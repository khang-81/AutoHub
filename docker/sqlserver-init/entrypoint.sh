#!/bin/bash
set -euo pipefail
SQLCMD=/opt/mssql-tools18/bin/sqlcmd
# -I: QUOTED_IDENTIFIER ON (required for INSERT on tables with filtered indexes, e.g. users.email)
COMMON=( -S "$DB_HOST" -U sa -P "$MSSQL_SA_PASSWORD" -C -I )

# Không dùng -b: recovery / DB chưa ONLINE có thể làm lệnh lỗi tạm thời.
run_master() {
  "$SQLCMD" "${COMMON[@]}" -d master "$@"
}

echo "Waiting for SQL Server at ${DB_HOST} (login to [master])..."
for i in $(seq 1 90); do
  if run_master -Q "SELECT 1" -o /dev/null 2>/dev/null; then
    echo "SQL Server accepts connections."
    break
  fi
  if [ "$i" -eq 90 ]; then
    echo "Timeout waiting for SQL Server."
    exit 1
  fi
  sleep 2
done

echo "Waiting for server recovery to settle..."
sleep 5

echo "Ensuring database [autohub] exists..."
run_master -b -Q "IF DB_ID(N'autohub') IS NULL CREATE DATABASE [autohub];"

echo "Waiting for [autohub] to be ONLINE (state=0)..."
for i in $(seq 1 60); do
  ST=$(run_master -h -1 -W -Q "SET NOCOUNT ON; SELECT CAST(state AS VARCHAR(2)) FROM sys.databases WHERE name = N'autohub';" 2>/dev/null | tail -n 1 | tr -d '[:space:]' || true)
  if [ "$ST" = "0" ]; then
    echo "Database [autohub] is ONLINE."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Timeout waiting for [autohub] ONLINE (last state='$ST')."
    exit 1
  fi
  sleep 2
done

# Kiểm tra schema từ [master] — dùng OBJECT_ID (ổn định hơn INFORMATION_SCHEMA khi DB tồn tại).
schema_exists() {
  set +e
  local line
  line=$(run_master -h -1 -W -Q "SET NOCOUNT ON; SELECT CASE WHEN OBJECT_ID(N'autohub.dbo.roles', N'U') IS NOT NULL THEN 1 ELSE 0 END;" 2>/dev/null | tail -n 1 | tr -d '[:space:]')
  set -e
  [ "${line:-0}" = "1" ]
}

if ! schema_exists; then
  echo "Applying /autohub-full-schema.sql (schema + seed)..."
  # Chạy script qua kết nối [master] + retry ngắn để tránh lỗi tạm thời Msg 904 lúc DB vừa ONLINE.
  ok=0
  for i in $(seq 1 8); do
    if run_master -b -i /autohub-full-schema.sql; then
      ok=1
      break
    fi
    # Nếu đã seed một phần ở lần trước, schema đã tồn tại thì coi như thành công để tiếp tục migration an toàn.
    if schema_exists; then
      echo "Schema already exists after seed attempt $i; treating as initialized."
      ok=1
      break
    fi
    echo "Seed attempt $i failed; retrying in 2s..."
    sleep 2
  done
  if [ "$ok" -ne 1 ]; then
    echo "Failed to initialize database [autohub] after retries."
    exit 1
  fi
  echo "Database [autohub] initialized."
else
  echo "Database [autohub] already has schema; skipping SQL init."
  echo "Applying safe incremental migrations (if needed)..."
  run_master -b -Q "
    USE [autohub];

    IF COL_LENGTH('dbo.reviews', 'sale_order_id') IS NULL
    BEGIN
      ALTER TABLE dbo.reviews ADD sale_order_id INT NULL;
    END;

    IF EXISTS (
      SELECT 1
      FROM sys.columns
      WHERE object_id = OBJECT_ID('dbo.reviews')
        AND name = 'rental_id'
        AND is_nullable = 0
    )
    BEGIN
      ALTER TABLE dbo.reviews ALTER COLUMN rental_id INT NULL;
    END;

    IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ_reviews_rental_id')
    BEGIN
      ALTER TABLE dbo.reviews DROP CONSTRAINT UQ_reviews_rental_id;
    END;

    IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ_reviews_sale_order_id')
    BEGIN
      ALTER TABLE dbo.reviews DROP CONSTRAINT UQ_reviews_sale_order_id;
    END;

    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_reviews_sale_orders')
    BEGIN
      ALTER TABLE dbo.reviews
      ADD CONSTRAINT FK_reviews_sale_orders FOREIGN KEY (sale_order_id) REFERENCES dbo.sale_orders(id);
    END;

    IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_reviews_rental_xor_sale_order')
    BEGIN
      ALTER TABLE dbo.reviews DROP CONSTRAINT CK_reviews_rental_xor_sale_order;
    END;

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_reviews_rental_id_not_null' AND object_id = OBJECT_ID('dbo.reviews'))
    BEGIN
      EXEC('SET QUOTED_IDENTIFIER ON; SET ANSI_NULLS ON; CREATE UNIQUE INDEX UX_reviews_rental_id_not_null ON dbo.reviews(rental_id) WHERE rental_id IS NOT NULL');
    END;

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_reviews_sale_order_id_not_null' AND object_id = OBJECT_ID('dbo.reviews'))
    BEGIN
      EXEC('SET QUOTED_IDENTIFIER ON; SET ANSI_NULLS ON; CREATE UNIQUE INDEX UX_reviews_sale_order_id_not_null ON dbo.reviews(sale_order_id) WHERE sale_order_id IS NOT NULL');
    END;

    IF COL_LENGTH('dbo.users', 'password_reset_token') IS NULL
    BEGIN
      ALTER TABLE dbo.users ADD password_reset_token NVARCHAR(64) NULL;
    END;

    IF COL_LENGTH('dbo.users', 'full_name') IS NULL
      ALTER TABLE dbo.users ADD full_name NVARCHAR(255) NULL;
    IF COL_LENGTH('dbo.users', 'phone') IS NULL
      ALTER TABLE dbo.users ADD phone NVARCHAR(20) NULL;
    IF COL_LENGTH('dbo.users', 'birth_date') IS NULL
      ALTER TABLE dbo.users ADD birth_date DATE NULL;
    IF COL_LENGTH('dbo.users', 'token_version') IS NULL
      ALTER TABLE dbo.users ADD token_version INT NOT NULL CONSTRAINT DF_users_token_version DEFAULT 0;
    IF COL_LENGTH('dbo.users', 'enabled') IS NULL
      ALTER TABLE dbo.users ADD enabled BIT NOT NULL CONSTRAINT DF_users_enabled DEFAULT 1;
    IF COL_LENGTH('dbo.users', 'password_reset_last_sent_at') IS NULL
      ALTER TABLE dbo.users ADD password_reset_last_sent_at DATETIMEOFFSET(6) NULL;

    IF COL_LENGTH('dbo.rentals', 'late_fee_amount') IS NULL
    BEGIN
      ALTER TABLE dbo.rentals ADD late_fee_amount FLOAT NULL;
    END;
    IF COL_LENGTH('dbo.rentals', 'return_additional_fees') IS NULL
    BEGIN
      ALTER TABLE dbo.rentals ADD return_additional_fees FLOAT NULL;
    END;
    IF COL_LENGTH('dbo.rentals', 'balance_due_at_return') IS NULL
    BEGIN
      ALTER TABLE dbo.rentals ADD balance_due_at_return FLOAT NULL;
    END;

    IF COL_LENGTH('dbo.users', 'password_reset_expires') IS NULL
    BEGIN
      ALTER TABLE dbo.users ADD password_reset_expires DATETIMEOFFSET(6) NULL;
    END
    ELSE IF EXISTS (
      SELECT 1
      FROM sys.columns c
      INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
      WHERE c.object_id = OBJECT_ID(N'dbo.users')
        AND c.name = N'password_reset_expires'
        AND t.name = N'datetime2'
    )
    BEGIN
      ALTER TABLE dbo.users ALTER COLUMN password_reset_expires DATETIMEOFFSET(6) NULL;
    END;

    IF OBJECT_ID(N'dbo.viewing_appointments', N'U') IS NULL
    BEGIN
      CREATE TABLE [dbo].[viewing_appointments] (
        [id]             INT            IDENTITY (1, 1) NOT NULL,
        [created_date]   DATE           NULL,
        [updated_date]   DATE           NULL,
        [deleted_date]   DATE           NULL,
        [scheduled_at]   DATETIME2 (7)  NOT NULL,
        [status]         NVARCHAR (32)  NOT NULL,
        [note]           NVARCHAR (500) NULL,
        [contact_phone]  NVARCHAR (32)  NULL,
        [admin_note]     NVARCHAR (500) NULL,
        [car_id]         INT            NOT NULL,
        [user_id]        INT            NOT NULL,
        CONSTRAINT [PK_viewing_appointments] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_viewing_appointments_cars] FOREIGN KEY ([car_id]) REFERENCES [dbo].[cars] ([id]),
        CONSTRAINT [FK_viewing_appointments_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id])
      );
    END;

    IF COL_LENGTH('dbo.reviews', 'admin_reply') IS NULL
    BEGIN
      ALTER TABLE dbo.reviews ADD admin_reply NVARCHAR(2000) NULL;
    END;

    IF COL_LENGTH('dbo.reviews', 'hidden_from_public') IS NULL
    BEGIN
      ALTER TABLE dbo.reviews ADD hidden_from_public BIT NOT NULL CONSTRAINT DF_reviews_hidden_from_public DEFAULT 0;
    END;

    IF COL_LENGTH('dbo.rentals', 'damage_photo_urls') IS NOT NULL
    BEGIN
      ALTER TABLE dbo.rentals ALTER COLUMN damage_photo_urls NVARCHAR(MAX) NULL;
    END;

    IF OBJECT_ID(N'dbo.car_images', N'U') IS NULL
    BEGIN
      CREATE TABLE [dbo].[car_images] (
        [id]          INT IDENTITY(1,1) NOT NULL,
        [car_id]      INT            NOT NULL,
        [image_url]   NVARCHAR(MAX)  NOT NULL,
        [sort_order]  SMALLINT       NOT NULL,
        [image_type]  NVARCHAR(16)   NOT NULL,
        CONSTRAINT [PK_car_images] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_car_images_cars] FOREIGN KEY ([car_id]) REFERENCES [dbo].[cars] ([id]) ON DELETE CASCADE,
        CONSTRAINT [CK_car_images_type] CHECK ([image_type] IN (N'EXTERIOR', N'INTERIOR'))
      );
      CREATE INDEX [IX_car_images_car_id] ON [dbo].[car_images]([car_id], [sort_order]);
    END;

    IF COL_LENGTH('dbo.cars', 'seats') IS NULL
      ALTER TABLE dbo.cars ADD seats INT NULL;
    IF COL_LENGTH('dbo.cars', 'transmission') IS NULL
      ALTER TABLE dbo.cars ADD transmission NVARCHAR(16) NULL;
    IF COL_LENGTH('dbo.cars', 'fuel_type') IS NULL
      ALTER TABLE dbo.cars ADD fuel_type NVARCHAR(16) NULL;
    IF COL_LENGTH('dbo.cars', 'average_rating') IS NULL
      ALTER TABLE dbo.cars ADD average_rating FLOAT NULL;
    IF COL_LENGTH('dbo.cars', 'version') IS NULL
      ALTER TABLE dbo.cars ADD version BIGINT NOT NULL CONSTRAINT DF_cars_version DEFAULT 0;
    IF COL_LENGTH('dbo.cars', 'review_count') IS NULL
      ALTER TABLE dbo.cars ADD review_count INT NOT NULL CONSTRAINT DF_cars_review_count DEFAULT 0;
    IF COL_LENGTH('dbo.cars', 'version') IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM sys.default_constraints dc
         INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
         WHERE c.object_id = OBJECT_ID(N'dbo.cars') AND c.name = N'version'
       )
      ALTER TABLE dbo.cars ADD CONSTRAINT DF_cars_version DEFAULT 0 FOR version;
    IF COL_LENGTH('dbo.cars', 'review_count') IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM sys.default_constraints dc
         INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
         WHERE c.object_id = OBJECT_ID(N'dbo.cars') AND c.name = N'review_count'
       )
      ALTER TABLE dbo.cars ADD CONSTRAINT DF_cars_review_count DEFAULT 0 FOR review_count;

    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_reviews_rental_xor_sale_order')
    BEGIN
      EXEC('ALTER TABLE dbo.reviews WITH NOCHECK
        ADD CONSTRAINT CK_reviews_rental_xor_sale_order CHECK (
          (rental_id IS NOT NULL AND sale_order_id IS NULL)
          OR (rental_id IS NULL AND sale_order_id IS NOT NULL)
        )');
    END;

  IF OBJECT_ID(N'dbo.user_documents', N'U') IS NOT NULL
  BEGIN
    UPDATE [dbo].[user_documents]
    SET [file_path] = REPLACE([file_path], N'uploads/kyc/', N'kyc/')
    WHERE [file_path] LIKE N'uploads/kyc/%';

    UPDATE [dbo].[user_documents]
    SET [file_path] = REPLACE([file_path], N'.pdf', N'.png')
    WHERE [file_path] LIKE N'%demo-%.pdf';
  END;
  "
  echo "Incremental migrations completed."

  if [ -f /sync-demo-data.sql ]; then
    echo "Applying sync-demo-data.sql (accounts + catalog demo, idempotent)..."
    ok_sync=0
    for i in $(seq 1 5); do
      if run_master -b -i /sync-demo-data.sql; then
        ok_sync=1
        break
      fi
      echo "sync-demo-data attempt $i failed; retrying in 2s..."
      sleep 2
    done
    if [ "$ok_sync" -ne 1 ]; then
      echo "ERROR: sync-demo-data.sql failed after retries."
      echo "Check SQL errors above, then run: docker compose run --rm --no-deps db-init"
      exit 1
    fi
    echo "Demo data sync completed."
  fi
fi
