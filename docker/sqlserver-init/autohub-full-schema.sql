/*
  AutoHub / Rent-A-Car — schema + seed mẫu đồng bộ JPA (backend/rentACar).
  SQL Server. Chạy trên DB trống (CREATE TABLE lần đầu). Docker db-init chỉ chạy file này khi chưa có bảng dbo.roles.

  Backend & docker-compose: databaseName=autohub (application.properties, SPRING_DATASOURCE_URL).

  Tài khoản demo (mật khẩu: 12345678 — BCrypt strength 10):
    admin@autohub.local  → role admin
    user@autohub.local   → role user
    corp@autohub.local   → role user (khách hàng doanh nghiệp mẫu)
*/

IF DB_ID(N'autohub') IS NULL
    CREATE DATABASE [autohub];
GO

USE [autohub];
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* ---------- roles (không kế thừa BaseEntity; id = IDENTITY — khớp Role @GeneratedValue IDENTITY) ---------- */
CREATE TABLE [dbo].[roles] (
    [id]   INT            IDENTITY (1, 1) NOT NULL,
    [name] NVARCHAR (255) NULL,
    CONSTRAINT [PK_roles] PRIMARY KEY CLUSTERED ([id] ASC)
);

/* ---------- brands, models, colors ---------- */
CREATE TABLE [dbo].[brands] (
    [id]           INT            IDENTITY (1, 1) NOT NULL,
    [created_date] DATE           NULL,
    [updated_date] DATE           NULL,
    [deleted_date] DATE           NULL,
    [name]         NVARCHAR (255) NULL,
    [logo_path]    NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_brands] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[models] (
    [id]           INT            IDENTITY (1, 1) NOT NULL,
    [created_date] DATE           NULL,
    [updated_date] DATE           NULL,
    [deleted_date] DATE           NULL,
    [name]         NVARCHAR (255) NULL,
    [brand_id]     INT            NOT NULL,
    CONSTRAINT [PK_models] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_models_brands] FOREIGN KEY ([brand_id]) REFERENCES [dbo].[brands] ([id])
);

CREATE TABLE [dbo].[colors] (
    [id]           INT            IDENTITY (1, 1) NOT NULL,
    [created_date] DATE           NULL,
    [updated_date] DATE           NULL,
    [deleted_date] DATE           NULL,
    [name]         NVARCHAR (255) NULL,
    [code]         NVARCHAR (255) NULL,
    CONSTRAINT [PK_colors] PRIMARY KEY CLUSTERED ([id] ASC)
);

/* ---------- users + users_roles ---------- */
CREATE TABLE [dbo].[users] (
    [id]                     INT            IDENTITY (1, 1) NOT NULL,
    [created_date]           DATE           NULL,
    [updated_date]         DATE           NULL,
    [deleted_date]         DATE           NULL,
    [email]                  NVARCHAR (255) NULL,
    [password]               NVARCHAR (MAX) NULL,
    [kyc_status]             NVARCHAR (32)  NULL,
    [password_reset_token]   NVARCHAR (64)     NULL,
    /* Instant (Hibernate 6 + SQL Server) → datetimeoffset, không dùng datetime2 */
    [password_reset_expires] DATETIMEOFFSET (6) NULL,
    CONSTRAINT [PK_users] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[users_roles] (
    [user_id] INT NOT NULL,
    [role_id] INT NOT NULL,
    CONSTRAINT [PK_users_roles] PRIMARY KEY CLUSTERED ([user_id] ASC, [role_id] ASC),
    CONSTRAINT [FK_users_roles_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id]),
    CONSTRAINT [FK_users_roles_roles] FOREIGN KEY ([role_id]) REFERENCES [dbo].[roles] ([id])
);

/* ---------- cars ---------- */
CREATE TABLE [dbo].[cars] (
    [id]               INT            IDENTITY (1, 1) NOT NULL,
    [created_date]     DATE           NULL,
    [updated_date]     DATE           NULL,
    [deleted_date]     DATE           NULL,
    [model_year]       SMALLINT       NOT NULL,
    [service_city]     NVARCHAR (128) NULL,
    [plate]            NVARCHAR (255) NULL,
    [min_findeks_rate] SMALLINT       NOT NULL,
    [kilometer]        BIGINT         NULL,
    [daily_price]      REAL           NULL,
    [listing_type]     NVARCHAR (16)  NULL,
    [sale_price]       REAL           NULL,
    [sale_status]      NVARCHAR (16)  NULL,
    [image_path]       NVARCHAR (MAX) NULL,
    [model_id]         INT            NOT NULL,
    [color_id]         INT            NOT NULL,
    CONSTRAINT [PK_cars] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_cars_models] FOREIGN KEY ([model_id]) REFERENCES [dbo].[models] ([id]),
    CONSTRAINT [FK_cars_colors] FOREIGN KEY ([color_id]) REFERENCES [dbo].[colors] ([id]),
    CONSTRAINT [CK_cars_listing_type] CHECK ([listing_type] IN (N'RENT_ONLY', N'SALE_ONLY')),
    CONSTRAINT [CK_cars_rent_price_rule] CHECK (
        ([listing_type] = N'RENT_ONLY' AND [daily_price] > 0 AND [sale_price] IS NULL AND [sale_status] IS NULL)
        OR
        ([listing_type] = N'SALE_ONLY' AND ([daily_price] = 0 OR [daily_price] IS NULL) AND [sale_price] > 0 AND [sale_status] IN (N'AVAILABLE', N'RESERVED', N'SOLD'))
    )
);

/* ---------- customers, corporate_customers ---------- */
CREATE TABLE [dbo].[customers] (
    [id]                 INT            IDENTITY (1, 1) NOT NULL,
    [created_date]       DATE           NULL,
    [updated_date]       DATE           NULL,
    [deleted_date]       DATE           NULL,
    [first_name]         NVARCHAR (255) NULL,
    [last_name]          NVARCHAR (255) NULL,
    [birthdate]          DATE           NULL,
    [international_id]   NVARCHAR (255) NULL,
    [licence_issue_date] DATE           NULL,
    [user_id]            INT            NOT NULL,
    CONSTRAINT [PK_customers] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_customers_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id])
);

CREATE TABLE [dbo].[corporate_customers] (
    [id]            INT            IDENTITY (1, 1) NOT NULL,
    [created_date]  DATE           NULL,
    [updated_date]  DATE           NULL,
    [deleted_date]  DATE           NULL,
    [company_name]  NVARCHAR (255) NULL,
    [tax_no]        NVARCHAR (255) NULL,
    [user_id]       INT            NOT NULL,
    CONSTRAINT [PK_corporate_customers] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_corporate_customers_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id])
);

/* ---------- rentals, sale_orders ---------- */
CREATE TABLE [dbo].[rentals] (
    [id]                      INT            IDENTITY (1, 1) NOT NULL,
    [created_date]            DATE           NULL,
    [updated_date]            DATE           NULL,
    [deleted_date]            DATE           NULL,
    [start_date]              DATE           NOT NULL,
    [end_date]                DATE           NOT NULL,
    [return_date]             DATE           NULL,
    [start_kilometer]         BIGINT         NULL,
    [end_kilometer]           BIGINT         NULL,
    [total_price]             FLOAT (53)     NOT NULL,
    [payment_method]          NVARCHAR (255) NULL,
    [payment_status]          NVARCHAR (255) NULL,
    [rental_status]           NVARCHAR (255) NULL,
    [deposit_amount]          FLOAT (53)     NULL,
    [deposit_status]          NVARCHAR (32)  NULL,
    [insurance_code]          NVARCHAR (64)  NULL,
    [insurance_fee_amount]    FLOAT (53)     NULL,
    [extra_fees_amount]       FLOAT (53)     NULL,
    [pickup_district]         NVARCHAR (128) NULL,
    [cancelled_at]            DATETIME2 (7)  NULL,
    [cancelled_by]            NVARCHAR (16)  NULL,
    [cancellation_reason]     NVARCHAR (500) NULL,
    [cancellation_fee_amount] FLOAT (53)     NULL,
    [refund_deposit_amount]   FLOAT (53)     NULL,
    [late_fee_amount]         FLOAT (53)     NULL,
    [return_additional_fees]  FLOAT (53)     NULL,
    [balance_due_at_return]  FLOAT (53)     NULL,
    [car_id]                  INT            NOT NULL,
    [user_id]                 INT            NOT NULL,
    CONSTRAINT [PK_rentals] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_rentals_cars] FOREIGN KEY ([car_id]) REFERENCES [dbo].[cars] ([id]),
    CONSTRAINT [FK_rentals_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id])
);

CREATE TABLE [dbo].[sale_orders] (
    [id]                    INT            IDENTITY (1, 1) NOT NULL,
    [created_date]          DATE           NULL,
    [updated_date]          DATE           NULL,
    [deleted_date]          DATE           NULL,
    [total_price]           FLOAT (53)     NOT NULL,
    [payment_method]        NVARCHAR (32)  NULL,
    [payment_status]        NVARCHAR (32)  NULL,
    [order_status]          NVARCHAR (32)  NULL,
    [cancelled_at]          DATETIME2 (7)  NULL,
    [cancelled_by]          NVARCHAR (16)  NULL,
    [cancellation_reason]   NVARCHAR (500) NULL,
    [car_id]                INT            NOT NULL,
    [user_id]               INT            NOT NULL,
    CONSTRAINT [PK_sale_orders] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_sale_orders_cars] FOREIGN KEY ([car_id]) REFERENCES [dbo].[cars] ([id]),
    CONSTRAINT [FK_sale_orders_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id])
);

/* ---------- invoices (một hóa đơn gắn rental XOR sale_order — khớp nghiệp vụ backend) ---------- */
CREATE TABLE [dbo].[invoices] (
    [id]             INT            IDENTITY (1, 1) NOT NULL,
    [created_date]   DATE           NULL,
    [updated_date]   DATE           NULL,
    [deleted_date]   DATE           NULL,
    [invoice_no]     NVARCHAR (255) NULL,
    [total_price]    REAL           NULL,
    [discount_rate]  REAL           NULL,
    [tax_rate]       REAL           NULL,
    [rental_id]      INT            NULL,
    [sale_order_id]  INT            NULL,
    CONSTRAINT [PK_invoices] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_invoices_rentals] FOREIGN KEY ([rental_id]) REFERENCES [dbo].[rentals] ([id]),
    CONSTRAINT [FK_invoices_sale_orders] FOREIGN KEY ([sale_order_id]) REFERENCES [dbo].[sale_orders] ([id]),
    CONSTRAINT [CK_invoices_rental_xor_sale_order] CHECK (
        ([rental_id] IS NOT NULL AND [sale_order_id] IS NULL)
        OR ([rental_id] IS NULL AND [sale_order_id] IS NOT NULL)
    )
);

/* ---------- reviews (một review / rental hoặc sale_order) ---------- */
CREATE TABLE [dbo].[reviews] (
    [id]           INT            IDENTITY (1, 1) NOT NULL,
    [created_date] DATE           NULL,
    [updated_date] DATE           NULL,
    [deleted_date] DATE           NULL,
    [rental_id]    INT            NULL,
    [sale_order_id] INT           NULL,
    [user_id]      INT            NOT NULL,
    [rating]       INT            NOT NULL,
    [comment]      NVARCHAR (2000) NULL,
    CONSTRAINT [PK_reviews] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_reviews_rentals] FOREIGN KEY ([rental_id]) REFERENCES [dbo].[rentals] ([id]),
    CONSTRAINT [FK_reviews_sale_orders] FOREIGN KEY ([sale_order_id]) REFERENCES [dbo].[sale_orders] ([id]),
    CONSTRAINT [CK_reviews_rental_xor_sale_order] CHECK (
        ([rental_id] IS NOT NULL AND [sale_order_id] IS NULL)
        OR ([rental_id] IS NULL AND [sale_order_id] IS NOT NULL)
    ),
    CONSTRAINT [FK_reviews_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id])
);
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
CREATE UNIQUE INDEX [UX_reviews_rental_id_not_null]
    ON [dbo].[reviews]([rental_id])
    WHERE [rental_id] IS NOT NULL;
CREATE UNIQUE INDEX [UX_reviews_sale_order_id_not_null]
    ON [dbo].[reviews]([sale_order_id])
    WHERE [sale_order_id] IS NOT NULL;

/* ---------- user_documents (unique user_id + document_type) ---------- */
CREATE TABLE [dbo].[user_documents] (
    [id]             INT            IDENTITY (1, 1) NOT NULL,
    [created_date]   DATE           NULL,
    [updated_date]   DATE           NULL,
    [deleted_date]   DATE           NULL,
    [document_type]  NVARCHAR (32)  NOT NULL,
    [file_path]      NVARCHAR (1024) NOT NULL,
    [status]         NVARCHAR (32)  NOT NULL,
    [admin_note]     NVARCHAR (500) NULL,
    [reviewed_at]    DATETIME2 (7)  NULL,
    [user_id]        INT            NOT NULL,
    CONSTRAINT [PK_user_documents] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [UK_user_document_type] UNIQUE ([user_id], [document_type]),
    CONSTRAINT [FK_user_documents_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id])
);

/* ---------- viewing_appointments (lịch xem xe mua) ---------- */
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
GO

/* =========================================================================================
   Seed dữ liệu mẫu (idempotent — chạy lại an toàn cho các bản ghi có kiểm tra NOT EXISTS)
   Mật khẩu người dùng: 12345678
   ========================================================================================= */
SET NOCOUNT ON;

/* Roles — khớp AuthCManager.register (roleService.findByName) */
IF NOT EXISTS (SELECT 1 FROM [dbo].[roles] WHERE [name] = N'admin')
    INSERT INTO [dbo].[roles] ([name]) VALUES (N'admin');
IF NOT EXISTS (SELECT 1 FROM [dbo].[roles] WHERE [name] = N'user')
    INSERT INTO [dbo].[roles] ([name]) VALUES (N'user');
GO

/* Brands */
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Toyota')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Toyota', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Honda')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Honda', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'VinFast')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'VinFast', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Mazda')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Mazda', NULL);
GO

/* Models */
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Camry')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Camry', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Vios')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Vios', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Honda' AND m.[name] = N'City')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'City', [id] FROM [dbo].[brands] WHERE [name] = N'Honda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF e34')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF e34', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mazda' AND m.[name] = N'CX-5')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'CX-5', [id] FROM [dbo].[brands] WHERE [name] = N'Mazda';
GO

/* Colors */
IF NOT EXISTS (SELECT 1 FROM [dbo].[colors] WHERE [name] = N'Trắng')
    INSERT INTO [dbo].[colors] ([created_date], [name], [code]) VALUES (CAST(GETDATE() AS DATE), N'Trắng', N'#FFFFFF');
IF NOT EXISTS (SELECT 1 FROM [dbo].[colors] WHERE [name] = N'Đen')
    INSERT INTO [dbo].[colors] ([created_date], [name], [code]) VALUES (CAST(GETDATE() AS DATE), N'Đen', N'#1A1A1A');
IF NOT EXISTS (SELECT 1 FROM [dbo].[colors] WHERE [name] = N'Bạc')
    INSERT INTO [dbo].[colors] ([created_date], [name], [code]) VALUES (CAST(GETDATE() AS DATE), N'Bạc', N'#C0C0C0');
IF NOT EXISTS (SELECT 1 FROM [dbo].[colors] WHERE [name] = N'Đỏ')
    INSERT INTO [dbo].[colors] ([created_date], [name], [code]) VALUES (CAST(GETDATE() AS DATE), N'Đỏ', N'#C41E3A');
IF NOT EXISTS (SELECT 1 FROM [dbo].[colors] WHERE [name] = N'Xanh dương')
    INSERT INTO [dbo].[colors] ([created_date], [name], [code]) VALUES (CAST(GETDATE() AS DATE), N'Xanh dương', N'#1E3A8A');
GO

/* Users — BCrypt hash của "12345678" (bcrypt rounds 10), tương thích BCryptPasswordEncoder */
DECLARE @pwd NVARCHAR(255) = N'$2b$10$.Uuu11fj963cC00HG6ApVOQV.ZeufsLm9ngqPA9fYqKdCz.UOd5Vi';

IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE [email] = N'admin@autohub.local')
    INSERT INTO [dbo].[users] ([created_date], [email], [password], [kyc_status])
    VALUES (CAST(GETDATE() AS DATE), N'admin@autohub.local', @pwd, N'APPROVED');
IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE [email] = N'user@autohub.local')
    INSERT INTO [dbo].[users] ([created_date], [email], [password], [kyc_status])
    VALUES (CAST(GETDATE() AS DATE), N'user@autohub.local', @pwd, N'APPROVED');
IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE [email] = N'corp@autohub.local')
    INSERT INTO [dbo].[users] ([created_date], [email], [password], [kyc_status])
    VALUES (CAST(GETDATE() AS DATE), N'corp@autohub.local', @pwd, N'PENDING');
GO

/* users_roles */
INSERT INTO [dbo].[users_roles] ([user_id], [role_id])
SELECT u.[id], r.[id]
FROM [dbo].[users] u
CROSS JOIN [dbo].[roles] r
WHERE u.[email] = N'admin@autohub.local' AND r.[name] = N'admin'
  AND NOT EXISTS (SELECT 1 FROM [dbo].[users_roles] ur WHERE ur.[user_id] = u.[id] AND ur.[role_id] = r.[id]);

INSERT INTO [dbo].[users_roles] ([user_id], [role_id])
SELECT u.[id], r.[id]
FROM [dbo].[users] u
CROSS JOIN [dbo].[roles] r
WHERE u.[email] = N'user@autohub.local' AND r.[name] = N'user'
  AND NOT EXISTS (SELECT 1 FROM [dbo].[users_roles] ur WHERE ur.[user_id] = u.[id] AND ur.[role_id] = r.[id]);

INSERT INTO [dbo].[users_roles] ([user_id], [role_id])
SELECT u.[id], r.[id]
FROM [dbo].[users] u
CROSS JOIN [dbo].[roles] r
WHERE u.[email] = N'corp@autohub.local' AND r.[name] = N'user'
  AND NOT EXISTS (SELECT 1 FROM [dbo].[users_roles] ur WHERE ur.[user_id] = u.[id] AND ur.[role_id] = r.[id]);
GO

/* customers + corporate_customers */
IF NOT EXISTS (SELECT 1 FROM [dbo].[customers] c INNER JOIN [dbo].[users] u ON c.[user_id] = u.[id] WHERE u.[email] = N'user@autohub.local')
    INSERT INTO [dbo].[customers] ([created_date], [first_name], [last_name], [birthdate], [international_id], [licence_issue_date], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'Minh', N'Nguyễn', DATEFROMPARTS(1995, 6, 15), N'001095012345', DATEFROMPARTS(2020, 3, 1), [id]
    FROM [dbo].[users] WHERE [email] = N'user@autohub.local';

IF NOT EXISTS (SELECT 1 FROM [dbo].[corporate_customers] cc INNER JOIN [dbo].[users] u ON cc.[user_id] = u.[id] WHERE u.[email] = N'corp@autohub.local')
    INSERT INTO [dbo].[corporate_customers] ([created_date], [company_name], [tax_no], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'Công ty TNHH AutoHub Demo', N'0101234567', [id]
    FROM [dbo].[users] WHERE [email] = N'corp@autohub.local';
GO

/* Xe mẫu reset đầy đủ: 20 xe thuê + 20 xe mua (mỗi xe đúng 1 vai trò) */
DELETE FROM [dbo].[viewing_appointments];
DELETE FROM [dbo].[reviews];
DELETE FROM [dbo].[invoices];
DELETE FROM [dbo].[rentals];
DELETE FROM [dbo].[sale_orders];
DELETE FROM [dbo].[cars];
DBCC CHECKIDENT ('[dbo].[cars]', RESEED, 0);

INSERT INTO [dbo].[cars]
([created_date], [model_year], [service_city], [plate], [min_findeks_rate], [kilometer], [daily_price], [listing_type], [sale_price], [sale_status], [image_path], [model_id], [color_id])
SELECT
    CAST(GETDATE() AS DATE),
    src.model_year,
    N'Hà Nội',
    src.plate,
    src.min_findeks_rate,
    src.kilometer,
    src.daily_price,
    src.listing_type,
    src.sale_price,
    src.sale_status,
    src.image_path,
    m.id,
    c.id
FROM (
    VALUES
      (N'29A11111', 2023, 500, 18500,  950000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80', N'Toyota',  N'Camry', N'Trắng'),
      (N'29A11112', 2022, 450, 22000,  720000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1549924231-f129b911e442?w=1200&q=80', N'Honda',   N'City',  N'Bạc'),
      (N'29A11113', 2021, 400, 32000,  680000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80', N'Toyota',  N'Vios',  N'Đen'),
      (N'29A11114', 2024, 550, 12000, 1100000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80', N'Mazda',   N'CX-5',  N'Đỏ'),
      (N'29A11115', 2023, 520, 16000,  990000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1493238792000-8113da705763?w=1200&q=80', N'VinFast', N'VF e34',N'Xanh dương'),
      (N'29A11116', 2022, 480, 26000,  830000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80', N'Toyota',  N'Camry', N'Bạc'),
      (N'29A11117', 2021, 430, 34000,  700000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&q=80', N'Honda',   N'City',  N'Trắng'),
      (N'29A11118', 2020, 380, 41000,  620000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1462396881884-de2c07cb95ed?w=1200&q=80', N'Toyota',  N'Vios',  N'Đen'),
      (N'29A11119', 2024, 560,  9000, 1200000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&q=80', N'Mazda',   N'CX-5',  N'Đỏ'),
      (N'29A11120', 2023, 510, 15000,  960000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200&q=80', N'VinFast', N'VF e34',N'Xanh dương'),
      (N'29A11121', 2022, 470, 23000,  780000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=1200&q=80', N'Toyota',  N'Camry', N'Trắng'),
      (N'29A11122', 2021, 420, 33000,  690000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80', N'Honda',   N'City',  N'Bạc'),
      (N'29A11123', 2020, 390, 45000,  610000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1200&q=80', N'Toyota',  N'Vios',  N'Đen'),
      (N'29A11124', 2024, 570,  7000, 1250000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80', N'Mazda',   N'CX-5',  N'Đỏ'),
      (N'29A11125', 2023, 530, 13000, 1020000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=80', N'VinFast', N'VF e34',N'Xanh dương'),
      (N'29A11126', 2022, 490, 21000,  840000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1532581140115-3e355d1ed1de?w=1200&q=80', N'Toyota',  N'Camry', N'Bạc'),
      (N'29A11127', 2021, 440, 30000,  730000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1522932467653-e48f79727abf?w=1200&q=80', N'Honda',   N'City',  N'Trắng'),
      (N'29A11128', 2020, 400, 39000,  640000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=1200&q=80', N'Toyota',  N'Vios',  N'Đen'),
      (N'29A11129', 2024, 580,  6000, 1280000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=80', N'Mazda',   N'CX-5',  N'Đỏ'),
      (N'29A11130', 2023, 540, 11000, 1050000.0, N'RENT_ONLY', NULL,          NULL,          N'https://images.unsplash.com/photo-1551830820-330a71b99659?w=1200&q=80', N'VinFast', N'VF e34',N'Xanh dương'),

      (N'30F77777', 2023,   0,  5000,       0.0, N'SALE_ONLY', 920000000.0, N'SOLD',      N'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80', N'Mazda',   N'CX-5',  N'Xanh dương'),
      (N'51K88888', 2024,   0,  8000,       0.0, N'SALE_ONLY', 685000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80', N'VinFast', N'VF e34',N'Đỏ'),
      (N'30A20001', 2022,   0, 18000,       0.0, N'SALE_ONLY', 790000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80', N'Toyota',  N'Camry', N'Đen'),
      (N'30A20002', 2021,   0, 26000,       0.0, N'SALE_ONLY', 510000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1549924231-f129b911e442?w=1200&q=80', N'Honda',   N'City',  N'Trắng'),
      (N'30A20003', 2020,   0, 35000,       0.0, N'SALE_ONLY', 430000000.0, N'RESERVED',  N'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&q=80', N'Toyota',  N'Vios',  N'Bạc'),
      (N'30A20004', 2024,   0,  7000,       0.0, N'SALE_ONLY', 970000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80', N'Mazda',   N'CX-5',  N'Đỏ'),
      (N'30A20005', 2023,   0, 12000,       0.0, N'SALE_ONLY', 710000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=80', N'VinFast', N'VF e34',N'Xanh dương'),
      (N'30A20006', 2022,   0, 19000,       0.0, N'SALE_ONLY', 760000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200&q=80', N'Toyota',  N'Camry', N'Bạc'),
      (N'30A20007', 2021,   0, 24000,       0.0, N'SALE_ONLY', 495000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1532581140115-3e355d1ed1de?w=1200&q=80', N'Honda',   N'City',  N'Đen'),
      (N'30A20008', 2020,   0, 32000,       0.0, N'SALE_ONLY', 415000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1522932467653-e48f79727abf?w=1200&q=80', N'Toyota',  N'Vios',  N'Trắng'),
      (N'30A20009', 2024,   0,  6000,       0.0, N'SALE_ONLY', 990000000.0, N'RESERVED',  N'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=80', N'Mazda',   N'CX-5',  N'Xanh dương'),
      (N'30A20010', 2023,   0, 11000,       0.0, N'SALE_ONLY', 705000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1551830820-330a71b99659?w=1200&q=80', N'VinFast', N'VF e34',N'Đỏ'),
      (N'30A20011', 2022,   0, 21000,       0.0, N'SALE_ONLY', 745000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=1200&q=80', N'Toyota',  N'Camry', N'Trắng'),
      (N'30A20012', 2021,   0, 28000,       0.0, N'SALE_ONLY', 485000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80', N'Honda',   N'City',  N'Bạc'),
      (N'30A20013', 2020,   0, 36000,       0.0, N'SALE_ONLY', 405000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1200&q=80', N'Toyota',  N'Vios',  N'Đen'),
      (N'30A20014', 2024,   0,  5000,       0.0, N'SALE_ONLY', 1010000000.0,N'AVAILABLE', N'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&q=80', N'Mazda',   N'CX-5',  N'Đỏ'),
      (N'30A20015', 2023,   0, 14000,       0.0, N'SALE_ONLY', 695000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80', N'VinFast', N'VF e34',N'Xanh dương'),
      (N'30A20016', 2022,   0, 22000,       0.0, N'SALE_ONLY', 735000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1493238792000-8113da705763?w=1200&q=80', N'Toyota',  N'Camry', N'Đen'),
      (N'30A20017', 2021,   0, 30000,       0.0, N'SALE_ONLY', 475000000.0, N'RESERVED',  N'https://images.unsplash.com/photo-1462396881884-de2c07cb95ed?w=1200&q=80', N'Honda',   N'City',  N'Trắng'),
      (N'30A20018', 2020,   0, 38000,       0.0, N'SALE_ONLY', 398000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=1200&q=80', N'Toyota',  N'Vios',  N'Bạc')
) AS src(plate, model_year, min_findeks_rate, kilometer, daily_price, listing_type, sale_price, sale_status, image_path, brand_name, model_name, color_name)
JOIN [dbo].[brands] b ON b.[name] = src.brand_name
JOIN [dbo].[models] m ON m.[brand_id] = b.[id] AND m.[name] = src.model_name
JOIN [dbo].[colors] c ON c.[name] = src.color_name;
GO

/* user_documents (KYC mẫu) */
IF NOT EXISTS (SELECT 1 FROM [dbo].[user_documents] ud INNER JOIN [dbo].[users] u ON ud.[user_id] = u.[id] WHERE u.[email] = N'user@autohub.local' AND ud.[document_type] = N'CCCD')
    INSERT INTO [dbo].[user_documents] ([created_date], [document_type], [file_path], [status], [admin_note], [reviewed_at], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'CCCD', N'uploads/kyc/demo-cccd-user.pdf', N'APPROVED', NULL, SYSUTCDATETIME(), [id]
    FROM [dbo].[users] WHERE [email] = N'user@autohub.local';

IF NOT EXISTS (SELECT 1 FROM [dbo].[user_documents] ud INNER JOIN [dbo].[users] u ON ud.[user_id] = u.[id] WHERE u.[email] = N'user@autohub.local' AND ud.[document_type] = N'GPLX')
    INSERT INTO [dbo].[user_documents] ([created_date], [document_type], [file_path], [status], [admin_note], [reviewed_at], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'GPLX', N'uploads/kyc/demo-gplx-user.pdf', N'APPROVED', NULL, SYSUTCDATETIME(), [id]
    FROM [dbo].[users] WHERE [email] = N'user@autohub.local';

IF NOT EXISTS (SELECT 1 FROM [dbo].[user_documents] ud INNER JOIN [dbo].[users] u ON ud.[user_id] = u.[id] WHERE u.[email] = N'corp@autohub.local' AND ud.[document_type] = N'CCCD')
    INSERT INTO [dbo].[user_documents] ([created_date], [document_type], [file_path], [status], [admin_note], [reviewed_at], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'CCCD', N'uploads/kyc/demo-cccd-corp.pdf', N'PENDING', NULL, NULL, [id]
    FROM [dbo].[users] WHERE [email] = N'corp@autohub.local';
GO

/* Đơn thuê + hóa đơn + đánh giá (một lần nếu chưa có rental) */
IF NOT EXISTS (SELECT 1 FROM [dbo].[rentals])
BEGIN
    DECLARE @carRent INT = (SELECT TOP 1 [id] FROM [dbo].[cars] WHERE [plate] = N'29A11111');
    DECLARE @uidRenter INT = (SELECT [id] FROM [dbo].[users] WHERE [email] = N'user@autohub.local');
    IF @carRent IS NOT NULL AND @uidRenter IS NOT NULL
    BEGIN
        INSERT INTO [dbo].[rentals] (
            [created_date], [start_date], [end_date], [return_date], [start_kilometer], [end_kilometer],
            [total_price], [payment_method], [payment_status], [rental_status], [deposit_amount], [deposit_status],
            [insurance_code], [insurance_fee_amount], [extra_fees_amount], [pickup_district],
            [car_id], [user_id]
        )
        VALUES (
            CAST(GETDATE() AS DATE), DATEADD(DAY, -30, CAST(GETDATE() AS DATE)), DATEADD(DAY, -23, CAST(GETDATE() AS DATE)),
            DATEADD(DAY, -23, CAST(GETDATE() AS DATE)), 18500, 18720,
            6650000, N'BANK_TRANSFER', N'PAID', N'COMPLETED', 2000000, N'REFUNDED',
            N'BASIC', 150000, 0, N'Ba Đình',
            @carRent, @uidRenter
        );
        DECLARE @rentalId INT = SCOPE_IDENTITY();

        INSERT INTO [dbo].[invoices] ([created_date], [invoice_no], [total_price], [discount_rate], [tax_rate], [rental_id], [sale_order_id])
        VALUES (CAST(GETDATE() AS DATE), N'INV-RENT-DEMO-001', 6650000, 0, 10, @rentalId, NULL);

        INSERT INTO [dbo].[reviews] ([created_date], [rental_id], [user_id], [rating], [comment])
        VALUES (CAST(GETDATE() AS DATE), @rentalId, @uidRenter, 5, N'Xe sạch, giao đúng giờ — dữ liệu demo.');
    END
END
GO

/* Đơn bán + hóa đơn (xe 30F77777 đã SOLD — chỉ thêm hóa đơn nếu chưa có sale_order) */
IF NOT EXISTS (SELECT 1 FROM [dbo].[sale_orders])
BEGIN
    DECLARE @carSold INT = (SELECT TOP 1 [id] FROM [dbo].[cars] WHERE [plate] = N'30F77777');
    DECLARE @uidBuyer INT = (SELECT [id] FROM [dbo].[users] WHERE [email] = N'user@autohub.local');
    IF @carSold IS NOT NULL AND @uidBuyer IS NOT NULL
    BEGIN
        INSERT INTO [dbo].[sale_orders] (
            [created_date], [total_price], [payment_method], [payment_status], [order_status],
            [car_id], [user_id]
        )
        VALUES (
            CAST(GETDATE() AS DATE), 920000000, N'BANK_TRANSFER', N'PAID', N'COMPLETED',
            @carSold, @uidBuyer
        );
        DECLARE @saleId INT = SCOPE_IDENTITY();
        INSERT INTO [dbo].[invoices] ([created_date], [invoice_no], [total_price], [discount_rate], [tax_rate], [rental_id], [sale_order_id])
        VALUES (CAST(GETDATE() AS DATE), N'INV-SALE-DEMO-001', 920000000, 0, 10, NULL, @saleId);
    END
END
GO

SET NOCOUNT OFF;
GO
