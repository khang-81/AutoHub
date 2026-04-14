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
    [id]           INT            IDENTITY (1, 1) NOT NULL,
    [created_date] DATE           NULL,
    [updated_date] DATE           NULL,
    [deleted_date] DATE           NULL,
    [email]        NVARCHAR (255) NULL,
    [password]     NVARCHAR (MAX) NULL,
    [kyc_status]   NVARCHAR (32)  NULL,
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
    CONSTRAINT [FK_cars_colors] FOREIGN KEY ([color_id]) REFERENCES [dbo].[colors] ([id])
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

/* ---------- reviews (một review / rental) ---------- */
CREATE TABLE [dbo].[reviews] (
    [id]           INT            IDENTITY (1, 1) NOT NULL,
    [created_date] DATE           NULL,
    [updated_date] DATE           NULL,
    [deleted_date] DATE           NULL,
    [rental_id]    INT            NOT NULL,
    [user_id]      INT            NOT NULL,
    [rating]       INT            NOT NULL,
    [comment]      NVARCHAR (2000) NULL,
    CONSTRAINT [PK_reviews] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [UQ_reviews_rental_id] UNIQUE ([rental_id]),
    CONSTRAINT [FK_reviews_rentals] FOREIGN KEY ([rental_id]) REFERENCES [dbo].[rentals] ([id]),
    CONSTRAINT [FK_reviews_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id])
);

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

/* Xe mẫu: thuê / bán / cả hai — biển không có khoảng (khớp normalize phía API) */
IF NOT EXISTS (SELECT 1 FROM [dbo].[cars] WHERE [plate] = N'29A11111')
    INSERT INTO [dbo].[cars] ([created_date], [model_year], [service_city], [plate], [min_findeks_rate], [kilometer], [daily_price], [listing_type], [sale_price], [sale_status], [image_path], [model_id], [color_id])
    SELECT CAST(GETDATE() AS DATE), 2023, N'Hà Nội', N'29A11111', 500, 18500, 950000, N'RENT_ONLY', NULL, NULL, NULL,
           m.[id], col.[id]
    FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] AND b.[name] = N'Toyota' AND m.[name] = N'Camry'
    CROSS JOIN (SELECT TOP 1 [id] FROM [dbo].[colors] WHERE [name] = N'Trắng') col;

IF NOT EXISTS (SELECT 1 FROM [dbo].[cars] WHERE [plate] = N'29A22222')
    INSERT INTO [dbo].[cars] ([created_date], [model_year], [service_city], [plate], [min_findeks_rate], [kilometer], [daily_price], [listing_type], [sale_price], [sale_status], [image_path], [model_id], [color_id])
    SELECT CAST(GETDATE() AS DATE), 2022, N'Hà Nội', N'29A22222', 450, 22000, 720000, N'RENT_ONLY', NULL, NULL, NULL,
           m.[id], col.[id]
    FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] AND b.[name] = N'Honda' AND m.[name] = N'City'
    CROSS JOIN (SELECT TOP 1 [id] FROM [dbo].[colors] WHERE [name] = N'Bạc') col;

IF NOT EXISTS (SELECT 1 FROM [dbo].[cars] WHERE [plate] = N'51K88888')
    INSERT INTO [dbo].[cars] ([created_date], [model_year], [service_city], [plate], [min_findeks_rate], [kilometer], [daily_price], [listing_type], [sale_price], [sale_status], [image_path], [model_id], [color_id])
    SELECT CAST(GETDATE() AS DATE), 2024, N'Hà Nội', N'51K88888', 0, 8000, 0, N'SALE_ONLY', 685000000, N'AVAILABLE', NULL,
           m.[id], col.[id]
    FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] AND b.[name] = N'VinFast' AND m.[name] = N'VF e34'
    CROSS JOIN (SELECT TOP 1 [id] FROM [dbo].[colors] WHERE [name] = N'Đỏ') col;

IF NOT EXISTS (SELECT 1 FROM [dbo].[cars] WHERE [plate] = N'30F77777')
    INSERT INTO [dbo].[cars] ([created_date], [model_year], [service_city], [plate], [min_findeks_rate], [kilometer], [daily_price], [listing_type], [sale_price], [sale_status], [image_path], [model_id], [color_id])
    SELECT CAST(GETDATE() AS DATE), 2023, N'Hà Nội', N'30F77777', 0, 5000, 0, N'SALE_ONLY', 920000000, N'SOLD', NULL,
           m.[id], col.[id]
    FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] AND b.[name] = N'Mazda' AND m.[name] = N'CX-5'
    CROSS JOIN (SELECT TOP 1 [id] FROM [dbo].[colors] WHERE [name] = N'Xanh dương') col;

IF NOT EXISTS (SELECT 1 FROM [dbo].[cars] WHERE [plate] = N'29A33333')
    INSERT INTO [dbo].[cars] ([created_date], [model_year], [service_city], [plate], [min_findeks_rate], [kilometer], [daily_price], [listing_type], [sale_price], [sale_status], [image_path], [model_id], [color_id])
    SELECT CAST(GETDATE() AS DATE), 2024, N'Hà Nội', N'29A33333', 550, 12000, 1100000, N'BOTH', 1250000000, N'AVAILABLE', NULL,
           m.[id], col.[id]
    FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] AND b.[name] = N'Toyota' AND m.[name] = N'Vios'
    CROSS JOIN (SELECT TOP 1 [id] FROM [dbo].[colors] WHERE [name] = N'Đen') col;

IF NOT EXISTS (SELECT 1 FROM [dbo].[cars] WHERE [plate] = N'29A55555')
    INSERT INTO [dbo].[cars] ([created_date], [model_year], [service_city], [plate], [min_findeks_rate], [kilometer], [daily_price], [listing_type], [sale_price], [sale_status], [image_path], [model_id], [color_id])
    SELECT CAST(GETDATE() AS DATE), 2022, N'Hà Nội', N'29A55555', 500, 31000, 650000, N'BOTH', 480000000, N'RESERVED', NULL,
           m.[id], col.[id]
    FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] AND b.[name] = N'Honda' AND m.[name] = N'City'
    CROSS JOIN (SELECT TOP 1 [id] FROM [dbo].[colors] WHERE [name] = N'Trắng') col;
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
