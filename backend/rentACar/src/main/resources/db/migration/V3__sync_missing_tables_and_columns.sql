-- Sync SQL Server schema with current entities and project spec aliases.

/* ---------------------------------------------------------------------------
   1) Promotions table (required by JPA entity Promotion)
--------------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.promotions', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[promotions] (
        [id]                  INT IDENTITY(1,1) NOT NULL,
        [created_date]        DATE NULL,
        [updated_date]        DATE NULL,
        [deleted_date]        DATE NULL,
        [code]                NVARCHAR(64) NOT NULL,
        [description]         NVARCHAR(255) NULL,
        [discount_type]       NVARCHAR(16) NOT NULL,
        [discount_value]      FLOAT NOT NULL,
        [applies_to]          NVARCHAR(16) NOT NULL,
        [valid_from]          DATE NULL,
        [valid_to]            DATE NULL,
        [usage_limit]         INT NULL,
        [usage_count]         INT NOT NULL CONSTRAINT [DF_promotions_usage_count] DEFAULT (0),
        [max_discount_amount] FLOAT NULL,
        [min_order_value]     FLOAT NULL,
        [active]              BIT NOT NULL CONSTRAINT [DF_promotions_active] DEFAULT (1),
        CONSTRAINT [PK_promotions] PRIMARY KEY CLUSTERED ([id] ASC)
    );
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_promotions_code'
      AND object_id = OBJECT_ID(N'dbo.promotions')
)
BEGIN
    CREATE UNIQUE INDEX [UX_promotions_code] ON [dbo].[promotions]([code]);
END;

/* ---------------------------------------------------------------------------
   2) Users table: missing columns used by code + spec-friendly fields
--------------------------------------------------------------------------- */
IF COL_LENGTH('dbo.users', 'password_reset_last_sent_at') IS NULL
BEGIN
    ALTER TABLE [dbo].[users] ADD [password_reset_last_sent_at] DATETIMEOFFSET(6) NULL;
END;

IF COL_LENGTH('dbo.users', 'token_version') IS NULL
BEGIN
    ALTER TABLE [dbo].[users] ADD [token_version] INT NOT NULL CONSTRAINT [DF_users_token_version] DEFAULT (0);
END;

IF COL_LENGTH('dbo.users', 'enabled') IS NULL
BEGIN
    ALTER TABLE [dbo].[users] ADD [enabled] BIT NOT NULL CONSTRAINT [DF_users_enabled] DEFAULT (1);
END;

IF COL_LENGTH('dbo.users', 'full_name') IS NULL
BEGIN
    ALTER TABLE [dbo].[users] ADD [full_name] NVARCHAR(255) NULL;
END;

IF COL_LENGTH('dbo.users', 'phone') IS NULL
BEGIN
    ALTER TABLE [dbo].[users] ADD [phone] NVARCHAR(20) NULL;
END;

IF COL_LENGTH('dbo.users', 'password_hash') IS NULL
BEGIN
    ALTER TABLE [dbo].[users] ADD [password_hash] NVARCHAR(255) NULL;
END;

IF COL_LENGTH('dbo.users', 'address') IS NULL
BEGIN
    ALTER TABLE [dbo].[users] ADD [address] NVARCHAR(255) NULL;
END;

IF COL_LENGTH('dbo.users', 'driver_license') IS NULL
BEGIN
    ALTER TABLE [dbo].[users] ADD [driver_license] NVARCHAR(255) NULL;
END;

IF COL_LENGTH('dbo.users', 'role') IS NULL
BEGIN
    ALTER TABLE [dbo].[users] ADD [role] NVARCHAR(50) NULL;
END;

IF COL_LENGTH('dbo.users', 'status') IS NULL
BEGIN
    ALTER TABLE [dbo].[users] ADD [status] NVARCHAR(50) NULL;
END;

IF COL_LENGTH('dbo.users', 'created_at') IS NULL
BEGIN
    ALTER TABLE [dbo].[users] ADD [created_at] DATETIME2(7) NULL;
END;

IF COL_LENGTH('dbo.users', 'password_hash') IS NOT NULL
BEGIN
    EXEC(N'
        UPDATE [dbo].[users]
        SET [password_hash] = [password]
        WHERE [password_hash] IS NULL AND [password] IS NOT NULL;
    ');
END;

IF COL_LENGTH('dbo.users', 'created_at') IS NOT NULL
BEGIN
    EXEC(N'
        UPDATE [dbo].[users]
        SET [created_at] = CAST([created_date] AS DATETIME2(7))
        WHERE [created_at] IS NULL AND [created_date] IS NOT NULL;
    ');
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_users_email_not_null'
      AND object_id = OBJECT_ID(N'dbo.users')
)
BEGIN
    EXEC(N'
        CREATE UNIQUE INDEX [UX_users_email_not_null]
        ON [dbo].[users]([email])
        WHERE [email] IS NOT NULL;
    ');
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_users_phone_not_null'
      AND object_id = OBJECT_ID(N'dbo.users')
)
BEGIN
    EXEC(N'
        CREATE UNIQUE INDEX [UX_users_phone_not_null]
        ON [dbo].[users]([phone])
        WHERE [phone] IS NOT NULL;
    ');
END;

/* ---------------------------------------------------------------------------
   3) Rentals / SaleOrders / Reviews: missing columns used by code
--------------------------------------------------------------------------- */
IF COL_LENGTH('dbo.rentals', 'addon_codes') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [addon_codes] NVARCHAR(256) NULL;
END;

IF COL_LENGTH('dbo.rentals', 'addon_fee_amount') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [addon_fee_amount] FLOAT NULL;
END;

IF COL_LENGTH('dbo.rentals', 'allowed_kilometers') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [allowed_kilometers] BIGINT NULL;
END;

IF COL_LENGTH('dbo.rentals', 'expected_fuel_level') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [expected_fuel_level] INT NULL;
END;

IF COL_LENGTH('dbo.rentals', 'actual_fuel_level') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [actual_fuel_level] INT NULL;
END;

IF COL_LENGTH('dbo.rentals', 'over_km_fee') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [over_km_fee] FLOAT NULL;
END;

IF COL_LENGTH('dbo.rentals', 'missing_fuel_fee') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [missing_fuel_fee] FLOAT NULL;
END;

IF COL_LENGTH('dbo.rentals', 'damage_notes') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [damage_notes] NVARCHAR(2000) NULL;
END;

IF COL_LENGTH('dbo.rentals', 'damage_photo_urls') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [damage_photo_urls] NVARCHAR(1024) NULL;
END;

IF COL_LENGTH('dbo.rentals', 'promotion_code') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [promotion_code] NVARCHAR(64) NULL;
END;

IF COL_LENGTH('dbo.rentals', 'discount_amount') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [discount_amount] FLOAT NULL;
END;

IF COL_LENGTH('dbo.sale_orders', 'promotion_code') IS NULL
BEGIN
    ALTER TABLE [dbo].[sale_orders] ADD [promotion_code] NVARCHAR(64) NULL;
END;

IF COL_LENGTH('dbo.sale_orders', 'discount_amount') IS NULL
BEGIN
    ALTER TABLE [dbo].[sale_orders] ADD [discount_amount] FLOAT NULL;
END;

IF COL_LENGTH('dbo.reviews', 'admin_reply') IS NULL
BEGIN
    ALTER TABLE [dbo].[reviews] ADD [admin_reply] NVARCHAR(2000) NULL;
END;

/* ---------------------------------------------------------------------------
   4) Spec aliases for order/appointment/review style columns (non-breaking)
--------------------------------------------------------------------------- */
IF COL_LENGTH('dbo.sale_orders', 'sale_car_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[sale_orders] ADD [sale_car_id] INT NULL;
END;

IF COL_LENGTH('dbo.sale_orders', 'admin_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[sale_orders] ADD [admin_id] INT NULL;
END;

IF COL_LENGTH('dbo.sale_orders', 'order_date') IS NULL
BEGIN
    ALTER TABLE [dbo].[sale_orders] ADD [order_date] DATETIME2(7) NULL;
END;

IF COL_LENGTH('dbo.sale_orders', 'total_amount') IS NULL
BEGIN
    ALTER TABLE [dbo].[sale_orders] ADD [total_amount] DECIMAL(15,2) NULL;
END;

IF COL_LENGTH('dbo.sale_orders', 'status') IS NULL
BEGIN
    ALTER TABLE [dbo].[sale_orders] ADD [status] NVARCHAR(50) NULL;
END;

IF COL_LENGTH('dbo.sale_orders', 'created_at') IS NULL
BEGIN
    ALTER TABLE [dbo].[sale_orders] ADD [created_at] DATETIME2(7) NULL;
END;

EXEC(N'
    UPDATE [dbo].[sale_orders]
    SET [sale_car_id] = [car_id]
    WHERE [sale_car_id] IS NULL AND [car_id] IS NOT NULL;

    UPDATE [dbo].[sale_orders]
    SET [total_amount] = CAST([total_price] AS DECIMAL(15,2))
    WHERE [total_amount] IS NULL;

    UPDATE [dbo].[sale_orders]
    SET [status] = [order_status]
    WHERE [status] IS NULL AND [order_status] IS NOT NULL;

    UPDATE [dbo].[sale_orders]
    SET [order_date] = CAST([created_date] AS DATETIME2(7))
    WHERE [order_date] IS NULL AND [created_date] IS NOT NULL;

    UPDATE [dbo].[sale_orders]
    SET [created_at] = CAST([created_date] AS DATETIME2(7))
    WHERE [created_at] IS NULL AND [created_date] IS NOT NULL;
');

IF COL_LENGTH('dbo.rentals', 'rental_car_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [rental_car_id] INT NULL;
END;

IF COL_LENGTH('dbo.rentals', 'admin_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [admin_id] INT NULL;
END;

IF COL_LENGTH('dbo.rentals', 'actual_return_date') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [actual_return_date] DATETIME2(7) NULL;
END;

IF COL_LENGTH('dbo.rentals', 'total_amount') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [total_amount] DECIMAL(15,2) NULL;
END;

IF COL_LENGTH('dbo.rentals', 'late_fee') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [late_fee] DECIMAL(15,2) NULL;
END;

IF COL_LENGTH('dbo.rentals', 'status') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [status] NVARCHAR(50) NULL;
END;

IF COL_LENGTH('dbo.rentals', 'created_at') IS NULL
BEGIN
    ALTER TABLE [dbo].[rentals] ADD [created_at] DATETIME2(7) NULL;
END;

EXEC(N'
    UPDATE [dbo].[rentals]
    SET [rental_car_id] = [car_id]
    WHERE [rental_car_id] IS NULL AND [car_id] IS NOT NULL;

    UPDATE [dbo].[rentals]
    SET [actual_return_date] = CAST([return_date] AS DATETIME2(7))
    WHERE [actual_return_date] IS NULL AND [return_date] IS NOT NULL;

    UPDATE [dbo].[rentals]
    SET [total_amount] = CAST([total_price] AS DECIMAL(15,2))
    WHERE [total_amount] IS NULL;

    UPDATE [dbo].[rentals]
    SET [late_fee] = CAST([late_fee_amount] AS DECIMAL(15,2))
    WHERE [late_fee] IS NULL AND [late_fee_amount] IS NOT NULL;

    UPDATE [dbo].[rentals]
    SET [status] = [rental_status]
    WHERE [status] IS NULL AND [rental_status] IS NOT NULL;

    UPDATE [dbo].[rentals]
    SET [created_at] = CAST([created_date] AS DATETIME2(7))
    WHERE [created_at] IS NULL AND [created_date] IS NOT NULL;
');

IF COL_LENGTH('dbo.viewing_appointments', 'appointment_date') IS NULL
BEGIN
    ALTER TABLE [dbo].[viewing_appointments] ADD [appointment_date] DATETIME2(7) NULL;
END;

IF COL_LENGTH('dbo.viewing_appointments', 'sale_car_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[viewing_appointments] ADD [sale_car_id] INT NULL;
END;

IF COL_LENGTH('dbo.viewing_appointments', 'rental_car_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[viewing_appointments] ADD [rental_car_id] INT NULL;
END;

IF COL_LENGTH('dbo.viewing_appointments', 'admin_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[viewing_appointments] ADD [admin_id] INT NULL;
END;

IF COL_LENGTH('dbo.viewing_appointments', 'created_at') IS NULL
BEGIN
    ALTER TABLE [dbo].[viewing_appointments] ADD [created_at] DATETIME2(7) NULL;
END;

EXEC(N'
    UPDATE va
    SET [appointment_date] = [scheduled_at]
    FROM [dbo].[viewing_appointments] va
    WHERE va.[appointment_date] IS NULL AND va.[scheduled_at] IS NOT NULL;

    UPDATE va
    SET [created_at] = CAST([created_date] AS DATETIME2(7))
    FROM [dbo].[viewing_appointments] va
    WHERE va.[created_at] IS NULL AND va.[created_date] IS NOT NULL;

    UPDATE va
    SET [sale_car_id] = va.[car_id]
    FROM [dbo].[viewing_appointments] va
    INNER JOIN [dbo].[cars] c ON c.[id] = va.[car_id]
    WHERE va.[sale_car_id] IS NULL AND c.[listing_type] = N''SALE_ONLY'';

    UPDATE va
    SET [rental_car_id] = va.[car_id]
    FROM [dbo].[viewing_appointments] va
    INNER JOIN [dbo].[cars] c ON c.[id] = va.[car_id]
    WHERE va.[rental_car_id] IS NULL AND c.[listing_type] = N''RENT_ONLY'';
');

IF COL_LENGTH('dbo.reviews', 'sale_car_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[reviews] ADD [sale_car_id] INT NULL;
END;

IF COL_LENGTH('dbo.reviews', 'rental_car_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[reviews] ADD [rental_car_id] INT NULL;
END;

IF COL_LENGTH('dbo.reviews', 'admin_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[reviews] ADD [admin_id] INT NULL;
END;

IF COL_LENGTH('dbo.reviews', 'created_at') IS NULL
BEGIN
    ALTER TABLE [dbo].[reviews] ADD [created_at] DATETIME2(7) NULL;
END;

EXEC(N'
    UPDATE rv
    SET [rental_car_id] = r.[car_id]
    FROM [dbo].[reviews] rv
    INNER JOIN [dbo].[rentals] r ON r.[id] = rv.[rental_id]
    WHERE rv.[rental_car_id] IS NULL;

    UPDATE rv
    SET [sale_car_id] = s.[car_id]
    FROM [dbo].[reviews] rv
    INNER JOIN [dbo].[sale_orders] s ON s.[id] = rv.[sale_order_id]
    WHERE rv.[sale_car_id] IS NULL;

    UPDATE [dbo].[reviews]
    SET [created_at] = CAST([created_date] AS DATETIME2(7))
    WHERE [created_at] IS NULL AND [created_date] IS NOT NULL;
');

/* ---------------------------------------------------------------------------
   5) Chat sessions table from spec
--------------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.chat_sessions', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[chat_sessions] (
        [id]           INT IDENTITY(1,1) NOT NULL,
        [user_id]      INT NOT NULL,
        [messages]     NVARCHAR(MAX) NOT NULL,
        [status]       NVARCHAR(50) NOT NULL,
        [created_date] DATE NULL,
        [created_at]   DATETIME2(7) NOT NULL CONSTRAINT [DF_chat_sessions_created_at] DEFAULT SYSUTCDATETIME(),
        CONSTRAINT [PK_chat_sessions] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_chat_sessions_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id])
    );
END;

/* ---------------------------------------------------------------------------
   6) Spec-compatible read models as SQL views (non-breaking for current code)
--------------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.sale_cars', N'U') IS NULL
BEGIN
    EXEC(N'
        CREATE OR ALTER VIEW [dbo].[sale_cars]
        AS
        SELECT
            c.[id],
            m.[brand_id],
            CAST(NULL AS INT) AS [admin_id],
            CAST(c.[model_year] AS INT) AS [year],
            col.[name] AS [color],
            CAST(NULL AS NVARCHAR(50)) AS [vin],
            c.[plate] AS [license_plate],
            CAST(c.[sale_price] AS DECIMAL(15,2)) AS [listing_price],
            CASE
                WHEN c.[image_path] IS NULL THEN N''[]''
                ELSE N''["'' + REPLACE(c.[image_path], N''"'', N''\"'') + N''"]''
            END AS [images],
            c.[sale_status] AS [status],
            CAST(c.[created_date] AS DATETIME2(7)) AS [created_at]
        FROM [dbo].[cars] c
        INNER JOIN [dbo].[models] m ON m.[id] = c.[model_id]
        LEFT JOIN [dbo].[colors] col ON col.[id] = c.[color_id]
        WHERE c.[listing_type] = N''SALE_ONLY'';
    ');
END;

IF OBJECT_ID(N'dbo.rental_cars', N'U') IS NULL
BEGIN
    EXEC(N'
        CREATE OR ALTER VIEW [dbo].[rental_cars]
        AS
        SELECT
            c.[id],
            m.[brand_id],
            CAST(NULL AS INT) AS [admin_id],
            CAST(c.[model_year] AS INT) AS [year],
            col.[name] AS [color],
            CAST(NULL AS NVARCHAR(50)) AS [vin],
            c.[plate] AS [license_plate],
            CAST(c.[daily_price] AS DECIMAL(15,2)) AS [daily_rate],
            CAST(ca.[deposit_amount] AS DECIMAL(15,2)) AS [deposit_amount],
            CASE
                WHEN c.[image_path] IS NULL THEN N''[]''
                ELSE N''["'' + REPLACE(c.[image_path], N''"'', N''\"'') + N''"]''
            END AS [images],
            COALESCE(ca.[status], N''AVAILABLE'') AS [status],
            CAST(c.[created_date] AS DATETIME2(7)) AS [created_at]
        FROM [dbo].[cars] c
        INNER JOIN [dbo].[models] m ON m.[id] = c.[model_id]
        LEFT JOIN [dbo].[colors] col ON col.[id] = c.[color_id]
        LEFT JOIN [dbo].[rentals] ca ON ca.[car_id] = c.[id]
        WHERE c.[listing_type] = N''RENT_ONLY'';
    ');
END;
