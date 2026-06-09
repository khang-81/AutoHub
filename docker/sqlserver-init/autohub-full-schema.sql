/*
  AutoHub / Rent-A-Car — schema + seed mẫu đồng bộ JPA (backend/rentACar).
  SQL Server. Chạy trên DB trống (CREATE TABLE lần đầu). Docker db-init chỉ chạy file này khi chưa có bảng dbo.roles.

  Backend & docker-compose: databaseName=autohub (application.properties, SPRING_DATASOURCE_URL).

  Tài khoản demo (mật khẩu: admin123@ — BCrypt strength 10):
    admin@autohub.id.vn  → role admin
    user@autohub.id.vn   → role user (khách cá nhân)
    corp@autohub.id.vn   → role user (khách doanh nghiệp mẫu)
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
    [full_name]              NVARCHAR (255) NULL,
    [phone]                  NVARCHAR (20)  NULL,
    [birth_date]             DATE           NULL,
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

/* ---------- car_images (gallery chi tiết: 5 ảnh / xe) ---------- */
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
    [admin_reply]  NVARCHAR (2000) NULL,
    [hidden_from_public] BIT      NOT NULL CONSTRAINT [DF_reviews_hidden_from_public] DEFAULT ((0)),
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
   Mật khẩu tài khoản demo: admin123@
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
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Mercedes-Benz', NULL);
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
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF 3')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF 3', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF 8')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF 8', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF 9')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF 9', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Corolla Cross')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Corolla Cross', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Fortuner')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Fortuner', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Honda' AND m.[name] = N'Civic')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Civic', [id] FROM [dbo].[brands] WHERE [name] = N'Honda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Honda' AND m.[name] = N'CR-V')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'CR-V', [id] FROM [dbo].[brands] WHERE [name] = N'Honda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mazda' AND m.[name] = N'Mazda3')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Mazda3', [id] FROM [dbo].[brands] WHERE [name] = N'Mazda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mazda' AND m.[name] = N'BT-50')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'BT-50', [id] FROM [dbo].[brands] WHERE [name] = N'Mazda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mercedes-Benz' AND m.[name] = N'C-Class')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'C-Class', [id] FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mercedes-Benz' AND m.[name] = N'E-Class')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'E-Class', [id] FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mercedes-Benz' AND m.[name] = N'GLC')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'GLC', [id] FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz';
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

/* Users — BCrypt hash của "admin123@" (bcrypt rounds 10), tương thích BCryptPasswordEncoder */
DECLARE @pwd NVARCHAR(255) = N'$2b$10$bqBMqaSpBHVrUJmlzVTDbeVb/eoFx4F5qzPJJn0YwISSF6TFCc7V2';

IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE [email] = N'admin@autohub.id.vn')
    INSERT INTO [dbo].[users] ([created_date], [email], [password], [kyc_status])
    VALUES (CAST(GETDATE() AS DATE), N'admin@autohub.id.vn', @pwd, N'APPROVED');
IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE [email] = N'user@autohub.id.vn')
    INSERT INTO [dbo].[users] ([created_date], [email], [password], [kyc_status])
    VALUES (CAST(GETDATE() AS DATE), N'user@autohub.id.vn', @pwd, N'APPROVED');
IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE [email] = N'corp@autohub.id.vn')
    INSERT INTO [dbo].[users] ([created_date], [email], [password], [kyc_status])
    VALUES (CAST(GETDATE() AS DATE), N'corp@autohub.id.vn', @pwd, N'APPROVED');

UPDATE [dbo].[users]
SET [full_name] = N'Nguyễn Văn Minh', [phone] = N'0912345678', [birth_date] = DATEFROMPARTS(1995, 6, 15)
WHERE [email] = N'user@autohub.id.vn' AND ([full_name] IS NULL OR [full_name] = N'');

UPDATE [dbo].[users]
SET [full_name] = N'Quản trị AutoHub', [phone] = N'0329248087'
WHERE [email] = N'admin@autohub.id.vn' AND ([full_name] IS NULL OR [full_name] = N'');
GO

/* users_roles */
INSERT INTO [dbo].[users_roles] ([user_id], [role_id])
SELECT u.[id], r.[id]
FROM [dbo].[users] u
CROSS JOIN [dbo].[roles] r
WHERE u.[email] = N'admin@autohub.id.vn' AND r.[name] = N'admin'
  AND NOT EXISTS (SELECT 1 FROM [dbo].[users_roles] ur WHERE ur.[user_id] = u.[id] AND ur.[role_id] = r.[id]);

INSERT INTO [dbo].[users_roles] ([user_id], [role_id])
SELECT u.[id], r.[id]
FROM [dbo].[users] u
CROSS JOIN [dbo].[roles] r
WHERE u.[email] = N'user@autohub.id.vn' AND r.[name] = N'user'
  AND NOT EXISTS (SELECT 1 FROM [dbo].[users_roles] ur WHERE ur.[user_id] = u.[id] AND ur.[role_id] = r.[id]);

INSERT INTO [dbo].[users_roles] ([user_id], [role_id])
SELECT u.[id], r.[id]
FROM [dbo].[users] u
CROSS JOIN [dbo].[roles] r
WHERE u.[email] = N'corp@autohub.id.vn' AND r.[name] = N'user'
  AND NOT EXISTS (SELECT 1 FROM [dbo].[users_roles] ur WHERE ur.[user_id] = u.[id] AND ur.[role_id] = r.[id]);
GO

/* customers + corporate_customers */
IF NOT EXISTS (SELECT 1 FROM [dbo].[customers] c INNER JOIN [dbo].[users] u ON c.[user_id] = u.[id] WHERE u.[email] = N'user@autohub.id.vn')
    INSERT INTO [dbo].[customers] ([created_date], [first_name], [last_name], [birthdate], [international_id], [licence_issue_date], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'Văn Minh', N'Nguyễn', DATEFROMPARTS(1995, 6, 15), N'079195012345', DATEFROMPARTS(2020, 3, 1), [id]
    FROM [dbo].[users] WHERE [email] = N'user@autohub.id.vn';

IF NOT EXISTS (SELECT 1 FROM [dbo].[corporate_customers] cc INNER JOIN [dbo].[users] u ON cc.[user_id] = u.[id] WHERE u.[email] = N'corp@autohub.id.vn')
    INSERT INTO [dbo].[corporate_customers] ([created_date], [company_name], [tax_no], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'Công ty TNHH AutoHub Demo', N'0101234567', [id]
    FROM [dbo].[users] WHERE [email] = N'corp@autohub.id.vn';
GO

/* Xe mẫu: VinFast, Toyota, Honda, Mazda, Mercedes-Benz — 5 thương hiệu × 3 model × (1 thuê + 1 mua); màu Trắng. */
DELETE FROM [dbo].[viewing_appointments];
DELETE FROM [dbo].[reviews];
DELETE FROM [dbo].[invoices];
DELETE FROM [dbo].[rentals];
DELETE FROM [dbo].[sale_orders];
DELETE FROM [dbo].[car_images];
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
(N'51R0001', 2023, 500, 10100, 650000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg', N'VinFast', N'VF 3'),
      (N'51S0002', 2023, 500, 0, 0.0, N'SALE_ONLY', 280000000.0, N'SOLD', N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg', N'VinFast', N'VF 3'),
      (N'51R0003', 2023, 500, 10300, 1800000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'VinFast', N'VF 8'),
      (N'51S0004', 2023, 500, 0, 0.0, N'SALE_ONLY', 1050000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'VinFast', N'VF 8'),
      (N'51R0005', 2023, 500, 10500, 2200000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg/800px-VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg', N'VinFast', N'VF 9'),
      (N'51S0006', 2023, 500, 0, 0.0, N'SALE_ONLY', 1550000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg/800px-VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg', N'VinFast', N'VF 9'),
      (N'51R0007', 2023, 500, 10700, 1500000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg', N'Toyota', N'Camry'),
      (N'51S0008', 2023, 500, 0, 0.0, N'SALE_ONLY', 1050000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg', N'Toyota', N'Camry'),
      (N'51R0009', 2023, 500, 10900, 900000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg', N'Toyota', N'Corolla Cross'),
      (N'51S0010', 2023, 500, 0, 0.0, N'SALE_ONLY', 820000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg', N'Toyota', N'Corolla Cross'),
      (N'51R0011', 2023, 500, 11100, 1600000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2016_Toyota_Fortuner_%28front%29.jpg/800px-2016_Toyota_Fortuner_%28front%29.jpg', N'Toyota', N'Fortuner'),
      (N'51S0012', 2023, 500, 0, 0.0, N'SALE_ONLY', 1150000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2016_Toyota_Fortuner_%28front%29.jpg/800px-2016_Toyota_Fortuner_%28front%29.jpg', N'Toyota', N'Fortuner'),
      (N'51R0013', 2023, 500, 11300, 700000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2020_Honda_City_RS_%28front%29.jpg/800px-2020_Honda_City_RS_%28front%29.jpg', N'Honda', N'City'),
      (N'51S0014', 2023, 500, 0, 0.0, N'SALE_ONLY', 580000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2020_Honda_City_RS_%28front%29.jpg/800px-2020_Honda_City_RS_%28front%29.jpg', N'Honda', N'City'),
      (N'51R0015', 2023, 500, 11500, 950000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2022_Honda_Civic_FE_%28front%29.jpg/800px-2022_Honda_Civic_FE_%28front%29.jpg', N'Honda', N'Civic'),
      (N'51S0016', 2023, 500, 0, 0.0, N'SALE_ONLY', 780000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2022_Honda_Civic_FE_%28front%29.jpg/800px-2022_Honda_Civic_FE_%28front%29.jpg', N'Honda', N'Civic'),
      (N'51R0017', 2023, 500, 11700, 1200000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2017_Honda_CR-V_%28front%29.jpg/800px-2017_Honda_CR-V_%28front%29.jpg', N'Honda', N'CR-V'),
      (N'51S0018', 2023, 500, 0, 0.0, N'SALE_ONLY', 980000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2017_Honda_CR-V_%28front%29.jpg/800px-2017_Honda_CR-V_%28front%29.jpg', N'Honda', N'CR-V'),
      (N'51R0019', 2023, 500, 11900, 800000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', N'Mazda', N'Mazda3'),
      (N'51S0020', 2023, 500, 0, 0.0, N'SALE_ONLY', 680000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', N'Mazda', N'Mazda3'),
      (N'51R0021', 2023, 500, 12100, 1100000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'Mazda', N'CX-5'),
      (N'51S0022', 2023, 500, 0, 0.0, N'SALE_ONLY', 920000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'Mazda', N'CX-5'),
      (N'51R0023', 2023, 500, 12300, 850000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2012_Mazda_BT-50_%28front%29.jpg/800px-2012_Mazda_BT-50_%28front%29.jpg', N'Mazda', N'BT-50'),
      (N'51S0024', 2023, 500, 0, 0.0, N'SALE_ONLY', 720000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2012_Mazda_BT-50_%28front%29.jpg/800px-2012_Mazda_BT-50_%28front%29.jpg', N'Mazda', N'BT-50'),
      (N'51R0025', 2023, 500, 12500, 3500000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', N'Mercedes-Benz', N'C-Class'),
      (N'51S0026', 2023, 500, 0, 0.0, N'SALE_ONLY', 1950000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', N'Mercedes-Benz', N'C-Class'),
      (N'51R0027', 2023, 500, 12700, 4500000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', N'Mercedes-Benz', N'E-Class'),
      (N'51S0028', 2023, 500, 0, 0.0, N'SALE_ONLY', 2650000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', N'Mercedes-Benz', N'E-Class'),
      (N'51R0029', 2023, 500, 12900, 3800000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'Mercedes-Benz', N'GLC'),
      (N'51S0030', 2023, 500, 0, 0.0, N'SALE_ONLY', 2150000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'Mercedes-Benz', N'GLC')
) AS src(plate, model_year, min_findeks_rate, kilometer, daily_price, listing_type, sale_price, sale_status, image_path, brand_name, model_name)
JOIN [dbo].[brands] b ON b.[name] = src.brand_name
JOIN [dbo].[models] m ON m.[brand_id] = b.[id] AND m.[name] = src.model_name
JOIN [dbo].[colors] c ON c.[name] = N'Trắng';
GO

/* Gallery 5 anh / xe (3 ngoai + 2 noi that) */
INSERT INTO [dbo].[car_images] ([car_id], [sort_order], [image_url], [image_type])
SELECT c.[id], src.[sort_order], src.[image_url], src.[image_type]
FROM (
VALUES
      (N'51R0001', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg', N'EXTERIOR'),
      (N'51R0001', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/VinFast_VF_3_IMG_7214.jpg/800px-VinFast_VF_3_IMG_7214.jpg', N'EXTERIOR'),
      (N'51R0001', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/VinFast_VF_3_%28Vietnam%29.jpg/800px-VinFast_VF_3_%28Vietnam%29.jpg', N'EXTERIOR'),
      (N'51R0001', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/VinFast_VF3_showcased_in_Hanoi.jpg/800px-VinFast_VF3_showcased_in_Hanoi.jpg', N'INTERIOR'),
      (N'51R0001', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/VinFast_VF_3_at_CAMMESA2024.jpg/800px-VinFast_VF_3_at_CAMMESA2024.jpg', N'INTERIOR'),
      (N'51S0002', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg', N'EXTERIOR'),
      (N'51S0002', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/VinFast_VF_3_IMG_7214.jpg/800px-VinFast_VF_3_IMG_7214.jpg', N'EXTERIOR'),
      (N'51S0002', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/VinFast_VF_3_%28Vietnam%29.jpg/800px-VinFast_VF_3_%28Vietnam%29.jpg', N'EXTERIOR'),
      (N'51S0002', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/VinFast_VF3_showcased_in_Hanoi.jpg/800px-VinFast_VF3_showcased_in_Hanoi.jpg', N'INTERIOR'),
      (N'51S0002', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/VinFast_VF_3_at_CAMMESA2024.jpg/800px-VinFast_VF_3_at_CAMMESA2024.jpg', N'INTERIOR'),
      (N'51R0003', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51R0003', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51R0003', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51R0003', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51R0003', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51S0004', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51S0004', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51S0004', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51S0004', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51S0004', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51R0005', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg/800px-VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg', N'EXTERIOR'),
      (N'51R0005', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/VinFast_VF9.jpg/800px-VinFast_VF9.jpg', N'EXTERIOR'),
      (N'51R0005', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/VinFast_VF_9_front.jpg/800px-VinFast_VF_9_front.jpg', N'EXTERIOR'),
      (N'51R0005', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/VinFast_VF_9_interior.jpg/800px-VinFast_VF_9_interior.jpg', N'INTERIOR'),
      (N'51R0005', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/VinFast_VF9_cabin.jpg/800px-VinFast_VF9_cabin.jpg', N'INTERIOR'),
      (N'51S0006', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg/800px-VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg', N'EXTERIOR'),
      (N'51S0006', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/VinFast_VF9.jpg/800px-VinFast_VF9.jpg', N'EXTERIOR'),
      (N'51S0006', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/VinFast_VF_9_front.jpg/800px-VinFast_VF_9_front.jpg', N'EXTERIOR'),
      (N'51S0006', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/VinFast_VF_9_interior.jpg/800px-VinFast_VF_9_interior.jpg', N'INTERIOR'),
      (N'51S0006', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/VinFast_VF9_cabin.jpg/800px-VinFast_VF9_cabin.jpg', N'INTERIOR'),
      (N'51R0007', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg', N'EXTERIOR'),
      (N'51R0007', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_left_%28NY%29.jpg', N'EXTERIOR'),
      (N'51R0007', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_side_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_side_%28NY%29.jpg', N'EXTERIOR'),
      (N'51R0007', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_interior.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_interior.jpg', N'INTERIOR'),
      (N'51R0007', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_interior.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_interior.jpg', N'INTERIOR'),
      (N'51S0008', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg', N'EXTERIOR'),
      (N'51S0008', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_left_%28NY%29.jpg', N'EXTERIOR'),
      (N'51S0008', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_side_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_side_%28NY%29.jpg', N'EXTERIOR'),
      (N'51S0008', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_interior.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_interior.jpg', N'INTERIOR'),
      (N'51S0008', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_interior.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_interior.jpg', N'INTERIOR'),
      (N'51R0009', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0009', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2021_Toyota_Corolla_Cross_Hybrid_%28rear%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0009', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2021_Toyota_Corolla_Cross_Hybrid_%28side%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0009', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/2021_Toyota_Corolla_Cross_Hybrid_%28interior%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0009', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/2021_Toyota_Corolla_Cross_dashboard.jpg/800px-2021_Toyota_Corolla_Cross_dashboard.jpg', N'INTERIOR'),
      (N'51S0010', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0010', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2021_Toyota_Corolla_Cross_Hybrid_%28rear%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0010', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2021_Toyota_Corolla_Cross_Hybrid_%28side%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0010', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/2021_Toyota_Corolla_Cross_Hybrid_%28interior%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0010', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/2021_Toyota_Corolla_Cross_dashboard.jpg/800px-2021_Toyota_Corolla_Cross_dashboard.jpg', N'INTERIOR'),
      (N'51R0011', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2016_Toyota_Fortuner_%28front%29.jpg/800px-2016_Toyota_Fortuner_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0011', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/2016_Toyota_Fortuner_%28rear%29.jpg/800px-2016_Toyota_Fortuner_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0011', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2016_Toyota_Fortuner_%28side%29.jpg/800px-2016_Toyota_Fortuner_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0011', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/2016_Toyota_Fortuner_%28interior%29.jpg/800px-2016_Toyota_Fortuner_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0011', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/2016_Toyota_Fortuner_dashboard.jpg/800px-2016_Toyota_Fortuner_dashboard.jpg', N'INTERIOR'),
      (N'51S0012', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2016_Toyota_Fortuner_%28front%29.jpg/800px-2016_Toyota_Fortuner_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0012', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/2016_Toyota_Fortuner_%28rear%29.jpg/800px-2016_Toyota_Fortuner_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0012', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2016_Toyota_Fortuner_%28side%29.jpg/800px-2016_Toyota_Fortuner_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0012', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/2016_Toyota_Fortuner_%28interior%29.jpg/800px-2016_Toyota_Fortuner_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0012', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/2016_Toyota_Fortuner_dashboard.jpg/800px-2016_Toyota_Fortuner_dashboard.jpg', N'INTERIOR'),
      (N'51R0013', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2020_Honda_City_RS_%28front%29.jpg/800px-2020_Honda_City_RS_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0013', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/2020_Honda_City_RS_%28rear%29.jpg/800px-2020_Honda_City_RS_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0013', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Honda_City_RS_%28side%29.jpg/800px-2020_Honda_City_RS_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0013', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2020_Honda_City_RS_%28interior%29.jpg/800px-2020_Honda_City_RS_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0013', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2020_Honda_City_dashboard.jpg/800px-2020_Honda_City_dashboard.jpg', N'INTERIOR'),
      (N'51S0014', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2020_Honda_City_RS_%28front%29.jpg/800px-2020_Honda_City_RS_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0014', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/2020_Honda_City_RS_%28rear%29.jpg/800px-2020_Honda_City_RS_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0014', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Honda_City_RS_%28side%29.jpg/800px-2020_Honda_City_RS_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0014', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2020_Honda_City_RS_%28interior%29.jpg/800px-2020_Honda_City_RS_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0014', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2020_Honda_City_dashboard.jpg/800px-2020_Honda_City_dashboard.jpg', N'INTERIOR'),
      (N'51R0015', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2022_Honda_Civic_FE_%28front%29.jpg/800px-2022_Honda_Civic_FE_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0015', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2022_Honda_Civic_FE_%28rear%29.jpg/800px-2022_Honda_Civic_FE_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0015', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/2022_Honda_Civic_FE_%28side%29.jpg/800px-2022_Honda_Civic_FE_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0015', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/2022_Honda_Civic_FE_%28interior%29.jpg/800px-2022_Honda_Civic_FE_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0015', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/2022_Honda_Civic_dashboard.jpg/800px-2022_Honda_Civic_dashboard.jpg', N'INTERIOR'),
      (N'51S0016', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2022_Honda_Civic_FE_%28front%29.jpg/800px-2022_Honda_Civic_FE_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0016', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2022_Honda_Civic_FE_%28rear%29.jpg/800px-2022_Honda_Civic_FE_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0016', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/2022_Honda_Civic_FE_%28side%29.jpg/800px-2022_Honda_Civic_FE_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0016', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/2022_Honda_Civic_FE_%28interior%29.jpg/800px-2022_Honda_Civic_FE_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0016', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/2022_Honda_Civic_dashboard.jpg/800px-2022_Honda_Civic_dashboard.jpg', N'INTERIOR'),
      (N'51R0017', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2017_Honda_CR-V_%28front%29.jpg/800px-2017_Honda_CR-V_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0017', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2017_Honda_CR-V_%28rear%29.jpg/800px-2017_Honda_CR-V_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0017', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2017_Honda_CR-V_%28side%29.jpg/800px-2017_Honda_CR-V_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0017', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2017_Honda_CR-V_%28interior%29.jpg/800px-2017_Honda_CR-V_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0017', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/2017_Honda_CR-V_dashboard.jpg/800px-2017_Honda_CR-V_dashboard.jpg', N'INTERIOR'),
      (N'51S0018', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2017_Honda_CR-V_%28front%29.jpg/800px-2017_Honda_CR-V_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0018', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2017_Honda_CR-V_%28rear%29.jpg/800px-2017_Honda_CR-V_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0018', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2017_Honda_CR-V_%28side%29.jpg/800px-2017_Honda_CR-V_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0018', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2017_Honda_CR-V_%28interior%29.jpg/800px-2017_Honda_CR-V_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0018', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/2017_Honda_CR-V_dashboard.jpg/800px-2017_Honda_CR-V_dashboard.jpg', N'INTERIOR'),
      (N'51R0019', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0019', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0019', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0019', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0019', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/2019_Mazda3_dashboard.jpg/800px-2019_Mazda3_dashboard.jpg', N'INTERIOR'),
      (N'51S0020', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0020', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0020', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0020', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0020', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/2019_Mazda3_dashboard.jpg/800px-2019_Mazda3_dashboard.jpg', N'INTERIOR'),
      (N'51R0021', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0021', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0021', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0021', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0021', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg', N'INTERIOR'),
      (N'51S0022', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0022', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0022', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0022', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0022', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg', N'INTERIOR'),
      (N'51R0023', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2012_Mazda_BT-50_%28front%29.jpg/800px-2012_Mazda_BT-50_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0023', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2012_Mazda_BT-50_%28rear%29.jpg/800px-2012_Mazda_BT-50_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0023', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2012_Mazda_BT-50_%28side%29.jpg/800px-2012_Mazda_BT-50_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0023', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2012_Mazda_BT-50_%28interior%29.jpg/800px-2012_Mazda_BT-50_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0023', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/2012_Mazda_BT-50_dashboard.jpg/800px-2012_Mazda_BT-50_dashboard.jpg', N'INTERIOR'),
      (N'51S0024', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2012_Mazda_BT-50_%28front%29.jpg/800px-2012_Mazda_BT-50_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0024', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2012_Mazda_BT-50_%28rear%29.jpg/800px-2012_Mazda_BT-50_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0024', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2012_Mazda_BT-50_%28side%29.jpg/800px-2012_Mazda_BT-50_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0024', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2012_Mazda_BT-50_%28interior%29.jpg/800px-2012_Mazda_BT-50_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0024', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/2012_Mazda_BT-50_dashboard.jpg/800px-2012_Mazda_BT-50_dashboard.jpg', N'INTERIOR'),
      (N'51R0025', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', N'EXTERIOR'),
      (N'51R0025', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mercedes-Benz_W206_IMG_6744.jpg/800px-Mercedes-Benz_W206_IMG_6744.jpg', N'EXTERIOR'),
      (N'51R0025', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mercedes-Benz_W206_IMG_6745.jpg/800px-Mercedes-Benz_W206_IMG_6745.jpg', N'EXTERIOR'),
      (N'51R0025', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mercedes-Benz_W206_interior_IMG_6746.jpg/800px-Mercedes-Benz_W206_interior_IMG_6746.jpg', N'INTERIOR'),
      (N'51R0025', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mercedes-Benz_W206_cabin.jpg/800px-Mercedes-Benz_W206_cabin.jpg', N'INTERIOR'),
      (N'51S0026', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', N'EXTERIOR'),
      (N'51S0026', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mercedes-Benz_W206_IMG_6744.jpg/800px-Mercedes-Benz_W206_IMG_6744.jpg', N'EXTERIOR'),
      (N'51S0026', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mercedes-Benz_W206_IMG_6745.jpg/800px-Mercedes-Benz_W206_IMG_6745.jpg', N'EXTERIOR'),
      (N'51S0026', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mercedes-Benz_W206_interior_IMG_6746.jpg/800px-Mercedes-Benz_W206_interior_IMG_6746.jpg', N'INTERIOR'),
      (N'51S0026', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mercedes-Benz_W206_cabin.jpg/800px-Mercedes-Benz_W206_cabin.jpg', N'INTERIOR'),
      (N'51R0027', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', N'EXTERIOR'),
      (N'51R0027', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mercedes-Benz_W213_IMG_3528.jpg/800px-Mercedes-Benz_W213_IMG_3528.jpg', N'EXTERIOR'),
      (N'51R0027', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mercedes-Benz_W213_IMG_3529.jpg/800px-Mercedes-Benz_W213_IMG_3529.jpg', N'EXTERIOR'),
      (N'51R0027', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mercedes-Benz_W213_interior.jpg/800px-Mercedes-Benz_W213_interior.jpg', N'INTERIOR'),
      (N'51R0027', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mercedes-Benz_W213_cabin.jpg/800px-Mercedes-Benz_W213_cabin.jpg', N'INTERIOR'),
      (N'51S0028', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', N'EXTERIOR'),
      (N'51S0028', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mercedes-Benz_W213_IMG_3528.jpg/800px-Mercedes-Benz_W213_IMG_3528.jpg', N'EXTERIOR'),
      (N'51S0028', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mercedes-Benz_W213_IMG_3529.jpg/800px-Mercedes-Benz_W213_IMG_3529.jpg', N'EXTERIOR'),
      (N'51S0028', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mercedes-Benz_W213_interior.jpg/800px-Mercedes-Benz_W213_interior.jpg', N'INTERIOR'),
      (N'51S0028', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mercedes-Benz_W213_cabin.jpg/800px-Mercedes-Benz_W213_cabin.jpg', N'INTERIOR'),
      (N'51R0029', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'EXTERIOR'),
      (N'51R0029', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg', N'EXTERIOR'),
      (N'51R0029', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg', N'EXTERIOR'),
      (N'51R0029', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg', N'INTERIOR'),
      (N'51R0029', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg', N'INTERIOR'),
      (N'51S0030', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'EXTERIOR'),
      (N'51S0030', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg', N'EXTERIOR'),
      (N'51S0030', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg', N'EXTERIOR'),
      (N'51S0030', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg', N'INTERIOR'),
      (N'51S0030', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg', N'INTERIOR')
) AS src([plate], [sort_order], [image_url], [image_type])
JOIN [dbo].[cars] c ON c.[plate] = src.[plate];
GO

/* user_documents (KYC mẫu) */
IF NOT EXISTS (SELECT 1 FROM [dbo].[user_documents] ud INNER JOIN [dbo].[users] u ON ud.[user_id] = u.[id] WHERE u.[email] = N'user@autohub.id.vn' AND ud.[document_type] = N'CCCD')
    INSERT INTO [dbo].[user_documents] ([created_date], [document_type], [file_path], [status], [admin_note], [reviewed_at], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'CCCD', N'uploads/kyc/demo-cccd-user.pdf', N'APPROVED', NULL, SYSUTCDATETIME(), [id]
    FROM [dbo].[users] WHERE [email] = N'user@autohub.id.vn';

IF NOT EXISTS (SELECT 1 FROM [dbo].[user_documents] ud INNER JOIN [dbo].[users] u ON ud.[user_id] = u.[id] WHERE u.[email] = N'user@autohub.id.vn' AND ud.[document_type] = N'GPLX')
    INSERT INTO [dbo].[user_documents] ([created_date], [document_type], [file_path], [status], [admin_note], [reviewed_at], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'GPLX', N'uploads/kyc/demo-gplx-user.pdf', N'APPROVED', NULL, SYSUTCDATETIME(), [id]
    FROM [dbo].[users] WHERE [email] = N'user@autohub.id.vn';

IF NOT EXISTS (SELECT 1 FROM [dbo].[user_documents] ud INNER JOIN [dbo].[users] u ON ud.[user_id] = u.[id] WHERE u.[email] = N'corp@autohub.id.vn' AND ud.[document_type] = N'CCCD')
    INSERT INTO [dbo].[user_documents] ([created_date], [document_type], [file_path], [status], [admin_note], [reviewed_at], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'CCCD', N'uploads/kyc/demo-cccd-corp.pdf', N'APPROVED', NULL, SYSUTCDATETIME(), [id]
    FROM [dbo].[users] WHERE [email] = N'corp@autohub.id.vn';
GO

/* Đơn thuê + hóa đơn + đánh giá (một lần nếu chưa có rental) */
IF NOT EXISTS (SELECT 1 FROM [dbo].[rentals])
BEGIN
    DECLARE @carRent INT = (SELECT TOP 1 [id] FROM [dbo].[cars] WHERE [plate] = N'51R0001');
    DECLARE @uidRenter INT = (SELECT [id] FROM [dbo].[users] WHERE [email] = N'user@autohub.id.vn');
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
            DATEADD(DAY, -23, CAST(GETDATE() AS DATE)), 10100, 10250,
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

/* Đơn bán + hóa đơn (xe 51S0002 VinFast VF 3 — SOLD; khớp giá seed) */
IF NOT EXISTS (SELECT 1 FROM [dbo].[sale_orders])
BEGIN
    DECLARE @carSold INT = (SELECT TOP 1 [id] FROM [dbo].[cars] WHERE [plate] = N'51S0002');
    DECLARE @uidBuyer INT = (SELECT [id] FROM [dbo].[users] WHERE [email] = N'user@autohub.id.vn');
    IF @carSold IS NOT NULL AND @uidBuyer IS NOT NULL
    BEGIN
        INSERT INTO [dbo].[sale_orders] (
            [created_date], [total_price], [payment_method], [payment_status], [order_status],
            [car_id], [user_id]
        )
        VALUES (
            CAST(GETDATE() AS DATE), 280000000, N'BANK_TRANSFER', N'PAID', N'COMPLETED',
            @carSold, @uidBuyer
        );
        DECLARE @saleId INT = SCOPE_IDENTITY();
        INSERT INTO [dbo].[invoices] ([created_date], [invoice_no], [total_price], [discount_rate], [tax_rate], [rental_id], [sale_order_id])
        VALUES (CAST(GETDATE() AS DATE), N'INV-SALE-DEMO-001', 280000000, 0, 10, NULL, @saleId);
    END
END
GO

/* Lịch xem xe mẫu — thêm ngay sau khi xe được reset (bảng luôn trống tại đây) */
DECLARE @vCar1 INT = (SELECT TOP 1 [id] FROM [dbo].[cars] WHERE [plate] = N'51S0004');   -- VinFast VF 8, AVAILABLE
DECLARE @vCar2 INT = (SELECT TOP 1 [id] FROM [dbo].[cars] WHERE [plate] = N'51S0008');   -- Toyota Camry, AVAILABLE
DECLARE @vCar3 INT = (SELECT TOP 1 [id] FROM [dbo].[cars] WHERE [plate] = N'51S0010');   -- Toyota Corolla Cross, AVAILABLE
DECLARE @vCar4 INT = (SELECT TOP 1 [id] FROM [dbo].[cars] WHERE [plate] = N'51S0014');   -- Honda City, AVAILABLE
DECLARE @vUser INT = (SELECT [id] FROM [dbo].[users] WHERE [email] = N'user@autohub.id.vn');
DECLARE @vCorp INT = (SELECT [id] FROM [dbo].[users] WHERE [email] = N'corp@autohub.id.vn');

IF @vCar1 IS NOT NULL AND @vUser IS NOT NULL
    INSERT INTO [dbo].[viewing_appointments] ([created_date], [scheduled_at], [status], [note], [contact_phone], [admin_note], [car_id], [user_id])
    VALUES (CAST(GETDATE() AS DATE),
            DATEADD(DAY, 5, DATEADD(HOUR, 9, CAST(CAST(GETDATE() AS DATE) AS DATETIME2))),
            N'PENDING', N'Muốn xem kỹ nội thất và khoang máy.', N'0901234567', NULL, @vCar1, @vUser);

IF @vCar2 IS NOT NULL AND @vCorp IS NOT NULL
    INSERT INTO [dbo].[viewing_appointments] ([created_date], [scheduled_at], [status], [note], [contact_phone], [admin_note], [car_id], [user_id])
    VALUES (CAST(GETDATE() AS DATE),
            DATEADD(DAY, 8, DATEADD(HOUR, 14, CAST(CAST(GETDATE() AS DATE) AS DATETIME2))),
            N'CONFIRMED', N'Xem xe cho nhu cầu công ty.', N'0987654321', N'Gặp tại showroom Long Biên lúc 14:00.', @vCar2, @vCorp);

IF @vCar3 IS NOT NULL AND @vUser IS NOT NULL
    INSERT INTO [dbo].[viewing_appointments] ([created_date], [scheduled_at], [status], [note], [contact_phone], [admin_note], [car_id], [user_id])
    VALUES (CAST(GETDATE() AS DATE),
            DATEADD(DAY, 12, DATEADD(HOUR, 10, CAST(CAST(GETDATE() AS DATE) AS DATETIME2))),
            N'PENDING', NULL, N'0912345678', NULL, @vCar3, @vUser);

IF @vCar4 IS NOT NULL AND @vCorp IS NOT NULL
    INSERT INTO [dbo].[viewing_appointments] ([created_date], [scheduled_at], [status], [note], [contact_phone], [admin_note], [car_id], [user_id])
    VALUES (CAST(GETDATE() AS DATE),
            DATEADD(DAY, -7, DATEADD(HOUR, 9, CAST(CAST(GETDATE() AS DATE) AS DATETIME2))),
            N'COMPLETED', N'Xe đẹp, sẽ cân nhắc mua thêm.', N'0977888999', N'Khách đã xem tại showroom, hài lòng với tình trạng xe.', @vCar4, @vCorp);
GO

SET NOCOUNT OFF;
GO
