/*
  Dong bo data khop local (accounts + 70 xe thuc te, khong don mau).
  Chay khi VPS da co schema cu — db-init bo qua full seed.
*/
USE [autohub];
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
SET NOCOUNT ON;
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
/* Models — 35 tên trim thực tế */
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Camry 2.5Q')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Camry 2.5Q', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Corolla Cross 1.8V')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Corolla Cross 1.8V', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Fortuner Legender 2.4AT')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Fortuner Legender 2.4AT', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Vios 1.5G CVT')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Vios 1.5G CVT', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Innova Cross 2.0G')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Innova Cross 2.0G', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Hilux 2.8 Legender')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Hilux 2.8 Legender', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Yaris Cross 1.5G')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Yaris Cross 1.5G', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Honda' AND m.[name] = N'City RS 1.5Turbo')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'City RS 1.5Turbo', [id] FROM [dbo].[brands] WHERE [name] = N'Honda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Honda' AND m.[name] = N'Civic RS Turbo')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Civic RS Turbo', [id] FROM [dbo].[brands] WHERE [name] = N'Honda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Honda' AND m.[name] = N'CR-V L Turbo')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'CR-V L Turbo', [id] FROM [dbo].[brands] WHERE [name] = N'Honda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Honda' AND m.[name] = N'HR-V G 1.5L')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'HR-V G 1.5L', [id] FROM [dbo].[brands] WHERE [name] = N'Honda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Honda' AND m.[name] = N'Accord Turbo')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Accord Turbo', [id] FROM [dbo].[brands] WHERE [name] = N'Honda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Honda' AND m.[name] = N'BR-V G 1.5CVT')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'BR-V G 1.5CVT', [id] FROM [dbo].[brands] WHERE [name] = N'Honda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Honda' AND m.[name] = N'Odyssey 2.4L')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Odyssey 2.4L', [id] FROM [dbo].[brands] WHERE [name] = N'Honda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF 3 Standard')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF 3 Standard', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF 5 Plus')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF 5 Plus', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF 6 Eco')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF 6 Eco', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF 7 Plus')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF 7 Plus', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF 8 Eco')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF 8 Eco', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF 9 Eco')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF 9 Eco', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF 8 Premium')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF 8 Premium', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mazda' AND m.[name] = N'Mazda3 2.0G Luxury')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Mazda3 2.0G Luxury', [id] FROM [dbo].[brands] WHERE [name] = N'Mazda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mazda' AND m.[name] = N'CX-5 2.5G Premium')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'CX-5 2.5G Premium', [id] FROM [dbo].[brands] WHERE [name] = N'Mazda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mazda' AND m.[name] = N'CX-30 2.0G Premium')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'CX-30 2.0G Premium', [id] FROM [dbo].[brands] WHERE [name] = N'Mazda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mazda' AND m.[name] = N'BT-50 Premium 4x4')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'BT-50 Premium 4x4', [id] FROM [dbo].[brands] WHERE [name] = N'Mazda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mazda' AND m.[name] = N'CX-8 2.5G Luxury')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'CX-8 2.5G Luxury', [id] FROM [dbo].[brands] WHERE [name] = N'Mazda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mazda' AND m.[name] = N'Mazda6 2.5G Premium')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Mazda6 2.5G Premium', [id] FROM [dbo].[brands] WHERE [name] = N'Mazda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mazda' AND m.[name] = N'CX-5 Signature')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'CX-5 Signature', [id] FROM [dbo].[brands] WHERE [name] = N'Mazda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mercedes-Benz' AND m.[name] = N'C 200 Avantgarde')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'C 200 Avantgarde', [id] FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mercedes-Benz' AND m.[name] = N'C 300 AMG Line')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'C 300 AMG Line', [id] FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mercedes-Benz' AND m.[name] = N'E 300 AMG Line')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'E 300 AMG Line', [id] FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mercedes-Benz' AND m.[name] = N'GLC 300 4MATIC')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'GLC 300 4MATIC', [id] FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mercedes-Benz' AND m.[name] = N'GLC 200 4MATIC')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'GLC 200 4MATIC', [id] FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mercedes-Benz' AND m.[name] = N'GLE 450 4MATIC')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'GLE 450 4MATIC', [id] FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mercedes-Benz' AND m.[name] = N'S 450 L')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'S 450 L', [id] FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz';
GO

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
SET [password] = @pwd
WHERE [email] IN (
    N'admin@autohub.local', N'user@autohub.local', N'corp@autohub.local',
    N'admin@autohub.id.vn', N'user@autohub.id.vn', N'corp@autohub.id.vn'
);

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
IF NOT EXISTS (SELECT 1 FROM [dbo].[customers] c INNER JOIN [dbo].[users] u ON c.[user_id] = u.[id] WHERE u.[email] = N'user@autohub.id.vn')
    INSERT INTO [dbo].[customers] ([created_date], [first_name], [last_name], [birthdate], [international_id], [licence_issue_date], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'Văn Minh', N'Nguyễn', DATEFROMPARTS(1995, 6, 15), N'079195012345', DATEFROMPARTS(2020, 3, 1), [id]
    FROM [dbo].[users] WHERE [email] = N'user@autohub.id.vn';

IF NOT EXISTS (SELECT 1 FROM [dbo].[corporate_customers] cc INNER JOIN [dbo].[users] u ON cc.[user_id] = u.[id] WHERE u.[email] = N'corp@autohub.id.vn')
    INSERT INTO [dbo].[corporate_customers] ([created_date], [company_name], [tax_no], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'Công ty TNHH AutoHub Demo', N'0101234567', [id]
    FROM [dbo].[users] WHERE [email] = N'corp@autohub.id.vn';
GO

/* Catalog: reset khi chua dung 70 xe (51R0001..51S0035) */
IF (SELECT COUNT(*) FROM [dbo].[cars]) <> 70
   OR NOT EXISTS (SELECT 1 FROM [dbo].[cars] WHERE [plate] = N'51R0035')
BEGIN
DELETE FROM [dbo].[viewing_appointments];
DELETE FROM [dbo].[reviews];
DELETE FROM [dbo].[invoices];
DELETE FROM [dbo].[rentals];
DELETE FROM [dbo].[sale_orders];
DELETE FROM [dbo].[car_images];
DELETE FROM [dbo].[cars];
DBCC CHECKIDENT ('[dbo].[cars]', RESEED, 0);

INSERT INTO [dbo].[cars]
([created_date], [model_year], [service_city], [plate], [min_findeks_rate], [kilometer], [daily_price], [listing_type], [sale_price], [sale_status], [image_path], [seats], [transmission], [fuel_type], [model_id], [color_id])
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
    src.seats,
    src.transmission,
    src.fuel_type,
    m.id,
    c.id
FROM (
VALUES
      (N'51R0001', 2023, 500, 18500, 1500000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg', 5, N'AUTO', N'GASOLINE', N'Toyota', N'Camry 2.5Q'),
      (N'51S0001', 2023, 500, 12000, 0.0, N'SALE_ONLY', 1050000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg', 5, N'AUTO', N'GASOLINE', N'Toyota', N'Camry 2.5Q'),
      (N'51R0002', 2023, 500, 22000, 900000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Toyota', N'Corolla Cross 1.8V'),
      (N'51S0002', 2023, 500, 8500, 0.0, N'SALE_ONLY', 820000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Toyota', N'Corolla Cross 1.8V'),
      (N'51R0003', 2023, 500, 31000, 1600000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2016_Toyota_Fortuner_%28front%29.jpg/800px-2016_Toyota_Fortuner_%28front%29.jpg', 7, N'AUTO', N'DIESEL', N'Toyota', N'Fortuner Legender 2.4AT'),
      (N'51S0003', 2023, 500, 15000, 0.0, N'SALE_ONLY', 1150000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2016_Toyota_Fortuner_%28front%29.jpg/800px-2016_Toyota_Fortuner_%28front%29.jpg', 7, N'AUTO', N'DIESEL', N'Toyota', N'Fortuner Legender 2.4AT'),
      (N'51R0004', 2023, 500, 42000, 650000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2018_Toyota_Vios_%28front%29.jpg/800px-2018_Toyota_Vios_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Toyota', N'Vios 1.5G CVT'),
      (N'51S0004', 2023, 500, 28000, 0.0, N'SALE_ONLY', 480000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2018_Toyota_Vios_%28front%29.jpg/800px-2018_Toyota_Vios_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Toyota', N'Vios 1.5G CVT'),
      (N'51R0005', 2024, 500, 12000, 1300000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/2023_Toyota_Innova_Cross_%28front%29.jpg/800px-2023_Toyota_Innova_Cross_%28front%29.jpg', 7, N'AUTO', N'GASOLINE', N'Toyota', N'Innova Cross 2.0G'),
      (N'51S0005', 2024, 500, 5000, 0.0, N'SALE_ONLY', 950000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/2023_Toyota_Innova_Cross_%28front%29.jpg/800px-2023_Toyota_Innova_Cross_%28front%29.jpg', 7, N'AUTO', N'GASOLINE', N'Toyota', N'Innova Cross 2.0G'),
      (N'51R0006', 2024, 500, 28000, 1500000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/2018_Toyota_Hilux_%28front%29.jpg/800px-2018_Toyota_Hilux_%28front%29.jpg', 5, N'AUTO', N'DIESEL', N'Toyota', N'Hilux 2.8 Legender'),
      (N'51S0006', 2024, 500, 11000, 0.0, N'SALE_ONLY', 1150000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/2018_Toyota_Hilux_%28front%29.jpg/800px-2018_Toyota_Hilux_%28front%29.jpg', 5, N'AUTO', N'DIESEL', N'Toyota', N'Hilux 2.8 Legender'),
      (N'51R0007', 2024, 500, 9500, 850000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2022_Toyota_Yaris_Cross_%28front%29.jpg/800px-2022_Toyota_Yaris_Cross_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Toyota', N'Yaris Cross 1.5G'),
      (N'51S0007', 2024, 500, 6000, 0.0, N'SALE_ONLY', 720000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2022_Toyota_Yaris_Cross_%28front%29.jpg/800px-2022_Toyota_Yaris_Cross_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Toyota', N'Yaris Cross 1.5G'),
      (N'51R0008', 2023, 500, 35000, 700000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2020_Honda_City_RS_%28front%29.jpg/800px-2020_Honda_City_RS_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Honda', N'City RS 1.5Turbo'),
      (N'51S0008', 2023, 500, 22000, 0.0, N'SALE_ONLY', 580000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2020_Honda_City_RS_%28front%29.jpg/800px-2020_Honda_City_RS_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Honda', N'City RS 1.5Turbo'),
      (N'51R0009', 2023, 500, 24000, 950000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2022_Honda_Civic_FE_%28front%29.jpg/800px-2022_Honda_Civic_FE_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Honda', N'Civic RS Turbo'),
      (N'51S0009', 2023, 500, 14000, 0.0, N'SALE_ONLY', 780000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2022_Honda_Civic_FE_%28front%29.jpg/800px-2022_Honda_Civic_FE_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Honda', N'Civic RS Turbo'),
      (N'51R0010', 2023, 500, 27000, 1200000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2017_Honda_CR-V_%28front%29.jpg/800px-2017_Honda_CR-V_%28front%29.jpg', 7, N'AUTO', N'GASOLINE', N'Honda', N'CR-V L Turbo'),
      (N'51S0010', 2023, 500, 16000, 0.0, N'SALE_ONLY', 980000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2017_Honda_CR-V_%28front%29.jpg/800px-2017_Honda_CR-V_%28front%29.jpg', 7, N'AUTO', N'GASOLINE', N'Honda', N'CR-V L Turbo'),
      (N'51R0011', 2024, 500, 15000, 850000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2022_Honda_HR-V_%28front%29.jpg/800px-2022_Honda_HR-V_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Honda', N'HR-V G 1.5L'),
      (N'51S0011', 2024, 500, 8000, 0.0, N'SALE_ONLY', 720000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2022_Honda_HR-V_%28front%29.jpg/800px-2022_Honda_HR-V_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Honda', N'HR-V G 1.5L'),
      (N'51R0012', 2023, 500, 19000, 1400000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2021_Honda_Accord_%28front%29.jpg/800px-2021_Honda_Accord_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Honda', N'Accord Turbo'),
      (N'51S0012', 2023, 500, 10000, 0.0, N'SALE_ONLY', 1250000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2021_Honda_Accord_%28front%29.jpg/800px-2021_Honda_Accord_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Honda', N'Accord Turbo'),
      (N'51R0013', 2023, 500, 38000, 800000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2019_Honda_BR-V_%28front%29.jpg/800px-2019_Honda_BR-V_%28front%29.jpg', 7, N'AUTO', N'GASOLINE', N'Honda', N'BR-V G 1.5CVT'),
      (N'51S0013', 2023, 500, 25000, 0.0, N'SALE_ONLY', 680000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2019_Honda_BR-V_%28front%29.jpg/800px-2019_Honda_BR-V_%28front%29.jpg', 7, N'AUTO', N'GASOLINE', N'Honda', N'BR-V G 1.5CVT'),
      (N'51R0014', 2023, 500, 45000, 1600000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2018_Honda_Odyssey_%28front%29.jpg/800px-2018_Honda_Odyssey_%28front%29.jpg', 7, N'AUTO', N'GASOLINE', N'Honda', N'Odyssey 2.4L'),
      (N'51S0014', 2023, 500, 32000, 0.0, N'SALE_ONLY', 1380000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2018_Honda_Odyssey_%28front%29.jpg/800px-2018_Honda_Odyssey_%28front%29.jpg', 7, N'AUTO', N'GASOLINE', N'Honda', N'Odyssey 2.4L'),
      (N'51R0015', 2024, 500, 8000, 650000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg', 4, N'AUTO', N'ELECTRIC', N'VinFast', N'VF 3 Standard'),
      (N'51S0015', 2024, 500, 3500, 0.0, N'SALE_ONLY', 280000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg', 4, N'AUTO', N'ELECTRIC', N'VinFast', N'VF 3 Standard'),
      (N'51R0016', 2024, 500, 11000, 900000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg/800px-VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg', 5, N'AUTO', N'ELECTRIC', N'VinFast', N'VF 5 Plus'),
      (N'51S0016', 2024, 500, 6000, 0.0, N'SALE_ONLY', 520000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg/800px-VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg', 5, N'AUTO', N'ELECTRIC', N'VinFast', N'VF 5 Plus'),
      (N'51R0017', 2024, 500, 14000, 1100000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', 5, N'AUTO', N'ELECTRIC', N'VinFast', N'VF 6 Eco'),
      (N'51S0017', 2024, 500, 7500, 0.0, N'SALE_ONLY', 720000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', 5, N'AUTO', N'ELECTRIC', N'VinFast', N'VF 6 Eco'),
      (N'51R0018', 2024, 500, 9000, 1400000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', 5, N'AUTO', N'ELECTRIC', N'VinFast', N'VF 7 Plus'),
      (N'51S0018', 2024, 500, 4000, 0.0, N'SALE_ONLY', 920000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', 5, N'AUTO', N'ELECTRIC', N'VinFast', N'VF 7 Plus'),
      (N'51R0019', 2023, 500, 21000, 1800000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', 5, N'AUTO', N'ELECTRIC', N'VinFast', N'VF 8 Eco'),
      (N'51S0019', 2023, 500, 12000, 0.0, N'SALE_ONLY', 1050000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', 5, N'AUTO', N'ELECTRIC', N'VinFast', N'VF 8 Eco'),
      (N'51R0020', 2023, 500, 16000, 2200000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg/800px-VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg', 7, N'AUTO', N'ELECTRIC', N'VinFast', N'VF 9 Eco'),
      (N'51S0020', 2023, 500, 9000, 0.0, N'SALE_ONLY', 1550000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg/800px-VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg', 7, N'AUTO', N'ELECTRIC', N'VinFast', N'VF 9 Eco'),
      (N'51R0021', 2024, 500, 7000, 2000000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', 5, N'AUTO', N'ELECTRIC', N'VinFast', N'VF 8 Premium'),
      (N'51S0021', 2024, 500, 2500, 0.0, N'SALE_ONLY', 1150000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', 5, N'AUTO', N'ELECTRIC', N'VinFast', N'VF 8 Premium'),
      (N'51R0022', 2023, 500, 26000, 900000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Mazda', N'Mazda3 2.0G Luxury'),
      (N'51S0022', 2023, 500, 15000, 0.0, N'SALE_ONLY', 750000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Mazda', N'Mazda3 2.0G Luxury'),
      (N'51R0023', 2023, 500, 33000, 1200000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Mazda', N'CX-5 2.5G Premium'),
      (N'51S0023', 2023, 500, 18000, 0.0, N'SALE_ONLY', 980000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Mazda', N'CX-5 2.5G Premium'),
      (N'51R0024', 2024, 500, 14000, 1000000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Mazda_CX-30_%28front%29.jpg/800px-2020_Mazda_CX-30_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Mazda', N'CX-30 2.0G Premium'),
      (N'51S0024', 2024, 500, 7000, 0.0, N'SALE_ONLY', 860000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Mazda_CX-30_%28front%29.jpg/800px-2020_Mazda_CX-30_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Mazda', N'CX-30 2.0G Premium'),
      (N'51R0025', 2024, 500, 52000, 950000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2012_Mazda_BT-50_%28front%29.jpg/800px-2012_Mazda_BT-50_%28front%29.jpg', 5, N'AUTO', N'DIESEL', N'Mazda', N'BT-50 Premium 4x4'),
      (N'51S0025', 2024, 500, 35000, 0.0, N'SALE_ONLY', 780000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2012_Mazda_BT-50_%28front%29.jpg/800px-2012_Mazda_BT-50_%28front%29.jpg', 5, N'AUTO', N'DIESEL', N'Mazda', N'BT-50 Premium 4x4'),
      (N'51R0026', 2023, 500, 29000, 1400000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', 7, N'AUTO', N'GASOLINE', N'Mazda', N'CX-8 2.5G Luxury'),
      (N'51S0026', 2023, 500, 16000, 0.0, N'SALE_ONLY', 1150000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', 7, N'AUTO', N'GASOLINE', N'Mazda', N'CX-8 2.5G Luxury'),
      (N'51R0027', 2023, 500, 41000, 1200000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Mazda', N'Mazda6 2.5G Premium'),
      (N'51S0027', 2023, 500, 28000, 0.0, N'SALE_ONLY', 1020000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Mazda', N'Mazda6 2.5G Premium'),
      (N'51R0028', 2024, 500, 11000, 1250000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Mazda', N'CX-5 Signature'),
      (N'51S0028', 2024, 500, 5500, 0.0, N'SALE_ONLY', 1050000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', 5, N'AUTO', N'GASOLINE', N'Mazda', N'CX-5 Signature'),
      (N'51R0029', 2023, 500, 22000, 3500000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', 5, N'AUTO', N'GASOLINE', N'Mercedes-Benz', N'C 200 Avantgarde'),
      (N'51S0029', 2023, 500, 11000, 0.0, N'SALE_ONLY', 1950000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', 5, N'AUTO', N'GASOLINE', N'Mercedes-Benz', N'C 200 Avantgarde'),
      (N'51R0030', 2024, 500, 8500, 4000000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', 5, N'AUTO', N'GASOLINE', N'Mercedes-Benz', N'C 300 AMG Line'),
      (N'51S0030', 2024, 500, 4000, 0.0, N'SALE_ONLY', 2250000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', 5, N'AUTO', N'GASOLINE', N'Mercedes-Benz', N'C 300 AMG Line'),
      (N'51R0031', 2024, 500, 12000, 5000000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', 5, N'AUTO', N'GASOLINE', N'Mercedes-Benz', N'E 300 AMG Line'),
      (N'51S0031', 2024, 500, 6000, 0.0, N'SALE_ONLY', 2850000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', 5, N'AUTO', N'GASOLINE', N'Mercedes-Benz', N'E 300 AMG Line'),
      (N'51R0032', 2024, 500, 15000, 4200000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', 5, N'AUTO', N'GASOLINE', N'Mercedes-Benz', N'GLC 300 4MATIC'),
      (N'51S0032', 2024, 500, 7500, 0.0, N'SALE_ONLY', 2450000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', 5, N'AUTO', N'GASOLINE', N'Mercedes-Benz', N'GLC 300 4MATIC'),
      (N'51R0033', 2023, 500, 28000, 3800000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', 5, N'AUTO', N'GASOLINE', N'Mercedes-Benz', N'GLC 200 4MATIC'),
      (N'51S0033', 2023, 500, 14000, 0.0, N'SALE_ONLY', 2150000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', 5, N'AUTO', N'GASOLINE', N'Mercedes-Benz', N'GLC 200 4MATIC'),
      (N'51R0034', 2024, 500, 9000, 5500000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', 5, N'AUTO', N'GASOLINE', N'Mercedes-Benz', N'GLE 450 4MATIC'),
      (N'51S0034', 2024, 500, 3500, 0.0, N'SALE_ONLY', 3850000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', 5, N'AUTO', N'GASOLINE', N'Mercedes-Benz', N'GLE 450 4MATIC'),
      (N'51R0035', 2024, 500, 5000, 7000000.0, N'RENT_ONLY', NULL, NULL, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', 5, N'AUTO', N'GASOLINE', N'Mercedes-Benz', N'S 450 L'),
      (N'51S0035', 2024, 500, 2000, 0.0, N'SALE_ONLY', 5200000000.0, N'AVAILABLE', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', 5, N'AUTO', N'GASOLINE', N'Mercedes-Benz', N'S 450 L')
) AS src(plate, model_year, min_findeks_rate, kilometer, daily_price, listing_type, sale_price, sale_status, image_path, seats, transmission, fuel_type, brand_name, model_name)
JOIN [dbo].[brands] b ON b.[name] = src.brand_name
JOIN [dbo].[models] m ON m.[brand_id] = b.[id] AND m.[name] = src.model_name
JOIN [dbo].[colors] c ON c.[name] = N'Trắng';

/* Gallery 5 ảnh / xe (3 ngoại + 2 nội thất) */
INSERT INTO [dbo].[car_images] ([car_id], [sort_order], [image_url], [image_type])
SELECT c.[id], src.[sort_order], src.[image_url], src.[image_type]
FROM (
VALUES
      (N'51R0001', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg', N'EXTERIOR'),
      (N'51R0001', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_left_%28NY%29.jpg', N'EXTERIOR'),
      (N'51R0001', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_side_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_side_%28NY%29.jpg', N'EXTERIOR'),
      (N'51R0001', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_interior.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_interior.jpg', N'INTERIOR'),
      (N'51R0001', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_interior.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_interior.jpg', N'INTERIOR'),
      (N'51S0001', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg', N'EXTERIOR'),
      (N'51S0001', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_left_%28NY%29.jpg', N'EXTERIOR'),
      (N'51S0001', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_side_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_side_%28NY%29.jpg', N'EXTERIOR'),
      (N'51S0001', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_interior.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_interior.jpg', N'INTERIOR'),
      (N'51S0001', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_interior.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_interior.jpg', N'INTERIOR'),
      (N'51R0002', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0002', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2021_Toyota_Corolla_Cross_Hybrid_%28rear%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0002', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2021_Toyota_Corolla_Cross_Hybrid_%28side%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0002', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/2021_Toyota_Corolla_Cross_Hybrid_%28interior%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0002', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/2021_Toyota_Corolla_Cross_dashboard.jpg/800px-2021_Toyota_Corolla_Cross_dashboard.jpg', N'INTERIOR'),
      (N'51S0002', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0002', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2021_Toyota_Corolla_Cross_Hybrid_%28rear%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0002', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2021_Toyota_Corolla_Cross_Hybrid_%28side%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0002', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/2021_Toyota_Corolla_Cross_Hybrid_%28interior%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0002', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/2021_Toyota_Corolla_Cross_dashboard.jpg/800px-2021_Toyota_Corolla_Cross_dashboard.jpg', N'INTERIOR'),
      (N'51R0003', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2016_Toyota_Fortuner_%28front%29.jpg/800px-2016_Toyota_Fortuner_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0003', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/2016_Toyota_Fortuner_%28rear%29.jpg/800px-2016_Toyota_Fortuner_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0003', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2016_Toyota_Fortuner_%28side%29.jpg/800px-2016_Toyota_Fortuner_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0003', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/2016_Toyota_Fortuner_%28interior%29.jpg/800px-2016_Toyota_Fortuner_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0003', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/2016_Toyota_Fortuner_dashboard.jpg/800px-2016_Toyota_Fortuner_dashboard.jpg', N'INTERIOR'),
      (N'51S0003', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2016_Toyota_Fortuner_%28front%29.jpg/800px-2016_Toyota_Fortuner_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0003', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/2016_Toyota_Fortuner_%28rear%29.jpg/800px-2016_Toyota_Fortuner_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0003', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2016_Toyota_Fortuner_%28side%29.jpg/800px-2016_Toyota_Fortuner_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0003', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/2016_Toyota_Fortuner_%28interior%29.jpg/800px-2016_Toyota_Fortuner_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0003', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/2016_Toyota_Fortuner_dashboard.jpg/800px-2016_Toyota_Fortuner_dashboard.jpg', N'INTERIOR'),
      (N'51R0004', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2018_Toyota_Vios_%28front%29.jpg/800px-2018_Toyota_Vios_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0004', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2018_Toyota_Vios_%28rear%29.jpg/800px-2018_Toyota_Vios_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0004', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/2018_Toyota_Vios_%28side%29.jpg/800px-2018_Toyota_Vios_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0004', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2018_Toyota_Vios_%28interior%29.jpg/800px-2018_Toyota_Vios_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0004', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2018_Toyota_Vios_dashboard.jpg/800px-2018_Toyota_Vios_dashboard.jpg', N'INTERIOR'),
      (N'51S0004', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2018_Toyota_Vios_%28front%29.jpg/800px-2018_Toyota_Vios_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0004', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2018_Toyota_Vios_%28rear%29.jpg/800px-2018_Toyota_Vios_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0004', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/2018_Toyota_Vios_%28side%29.jpg/800px-2018_Toyota_Vios_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0004', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2018_Toyota_Vios_%28interior%29.jpg/800px-2018_Toyota_Vios_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0004', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2018_Toyota_Vios_dashboard.jpg/800px-2018_Toyota_Vios_dashboard.jpg', N'INTERIOR'),
      (N'51R0005', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/2023_Toyota_Innova_Cross_%28front%29.jpg/800px-2023_Toyota_Innova_Cross_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0005', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2023_Toyota_Innova_Cross_%28rear%29.jpg/800px-2023_Toyota_Innova_Cross_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0005', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2023_Toyota_Innova_Cross_%28side%29.jpg/800px-2023_Toyota_Innova_Cross_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0005', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/2023_Toyota_Innova_Cross_%28interior%29.jpg/800px-2023_Toyota_Innova_Cross_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0005', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/2023_Toyota_Innova_Cross_dashboard.jpg/800px-2023_Toyota_Innova_Cross_dashboard.jpg', N'INTERIOR'),
      (N'51S0005', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/2023_Toyota_Innova_Cross_%28front%29.jpg/800px-2023_Toyota_Innova_Cross_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0005', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2023_Toyota_Innova_Cross_%28rear%29.jpg/800px-2023_Toyota_Innova_Cross_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0005', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2023_Toyota_Innova_Cross_%28side%29.jpg/800px-2023_Toyota_Innova_Cross_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0005', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/2023_Toyota_Innova_Cross_%28interior%29.jpg/800px-2023_Toyota_Innova_Cross_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0005', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/2023_Toyota_Innova_Cross_dashboard.jpg/800px-2023_Toyota_Innova_Cross_dashboard.jpg', N'INTERIOR'),
      (N'51R0006', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/2018_Toyota_Hilux_%28front%29.jpg/800px-2018_Toyota_Hilux_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0006', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/2018_Toyota_Hilux_%28rear%29.jpg/800px-2018_Toyota_Hilux_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0006', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2018_Toyota_Hilux_%28side%29.jpg/800px-2018_Toyota_Hilux_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0006', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/2018_Toyota_Hilux_%28interior%29.jpg/800px-2018_Toyota_Hilux_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0006', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2018_Toyota_Hilux_dashboard.jpg/800px-2018_Toyota_Hilux_dashboard.jpg', N'INTERIOR'),
      (N'51S0006', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/2018_Toyota_Hilux_%28front%29.jpg/800px-2018_Toyota_Hilux_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0006', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/2018_Toyota_Hilux_%28rear%29.jpg/800px-2018_Toyota_Hilux_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0006', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2018_Toyota_Hilux_%28side%29.jpg/800px-2018_Toyota_Hilux_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0006', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/2018_Toyota_Hilux_%28interior%29.jpg/800px-2018_Toyota_Hilux_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0006', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2018_Toyota_Hilux_dashboard.jpg/800px-2018_Toyota_Hilux_dashboard.jpg', N'INTERIOR'),
      (N'51R0007', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2022_Toyota_Yaris_Cross_%28front%29.jpg/800px-2022_Toyota_Yaris_Cross_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0007', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2022_Toyota_Yaris_Cross_%28rear%29.jpg/800px-2022_Toyota_Yaris_Cross_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0007', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2022_Toyota_Yaris_Cross_%28side%29.jpg/800px-2022_Toyota_Yaris_Cross_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0007', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/2022_Toyota_Yaris_Cross_%28interior%29.jpg/800px-2022_Toyota_Yaris_Cross_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0007', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/2022_Toyota_Yaris_Cross_dashboard.jpg/800px-2022_Toyota_Yaris_Cross_dashboard.jpg', N'INTERIOR'),
      (N'51S0007', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2022_Toyota_Yaris_Cross_%28front%29.jpg/800px-2022_Toyota_Yaris_Cross_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0007', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2022_Toyota_Yaris_Cross_%28rear%29.jpg/800px-2022_Toyota_Yaris_Cross_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0007', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2022_Toyota_Yaris_Cross_%28side%29.jpg/800px-2022_Toyota_Yaris_Cross_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0007', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/2022_Toyota_Yaris_Cross_%28interior%29.jpg/800px-2022_Toyota_Yaris_Cross_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0007', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/2022_Toyota_Yaris_Cross_dashboard.jpg/800px-2022_Toyota_Yaris_Cross_dashboard.jpg', N'INTERIOR'),
      (N'51R0008', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2020_Honda_City_RS_%28front%29.jpg/800px-2020_Honda_City_RS_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0008', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/2020_Honda_City_RS_%28rear%29.jpg/800px-2020_Honda_City_RS_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0008', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Honda_City_RS_%28side%29.jpg/800px-2020_Honda_City_RS_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0008', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2020_Honda_City_RS_%28interior%29.jpg/800px-2020_Honda_City_RS_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0008', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2020_Honda_City_dashboard.jpg/800px-2020_Honda_City_dashboard.jpg', N'INTERIOR'),
      (N'51S0008', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2020_Honda_City_RS_%28front%29.jpg/800px-2020_Honda_City_RS_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0008', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/2020_Honda_City_RS_%28rear%29.jpg/800px-2020_Honda_City_RS_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0008', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Honda_City_RS_%28side%29.jpg/800px-2020_Honda_City_RS_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0008', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2020_Honda_City_RS_%28interior%29.jpg/800px-2020_Honda_City_RS_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0008', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2020_Honda_City_dashboard.jpg/800px-2020_Honda_City_dashboard.jpg', N'INTERIOR'),
      (N'51R0009', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2022_Honda_Civic_FE_%28front%29.jpg/800px-2022_Honda_Civic_FE_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0009', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2022_Honda_Civic_FE_%28rear%29.jpg/800px-2022_Honda_Civic_FE_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0009', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/2022_Honda_Civic_FE_%28side%29.jpg/800px-2022_Honda_Civic_FE_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0009', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/2022_Honda_Civic_FE_%28interior%29.jpg/800px-2022_Honda_Civic_FE_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0009', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/2022_Honda_Civic_dashboard.jpg/800px-2022_Honda_Civic_dashboard.jpg', N'INTERIOR'),
      (N'51S0009', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2022_Honda_Civic_FE_%28front%29.jpg/800px-2022_Honda_Civic_FE_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0009', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2022_Honda_Civic_FE_%28rear%29.jpg/800px-2022_Honda_Civic_FE_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0009', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/2022_Honda_Civic_FE_%28side%29.jpg/800px-2022_Honda_Civic_FE_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0009', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/2022_Honda_Civic_FE_%28interior%29.jpg/800px-2022_Honda_Civic_FE_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0009', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/2022_Honda_Civic_dashboard.jpg/800px-2022_Honda_Civic_dashboard.jpg', N'INTERIOR'),
      (N'51R0010', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2017_Honda_CR-V_%28front%29.jpg/800px-2017_Honda_CR-V_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0010', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2017_Honda_CR-V_%28rear%29.jpg/800px-2017_Honda_CR-V_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0010', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2017_Honda_CR-V_%28side%29.jpg/800px-2017_Honda_CR-V_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0010', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2017_Honda_CR-V_%28interior%29.jpg/800px-2017_Honda_CR-V_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0010', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/2017_Honda_CR-V_dashboard.jpg/800px-2017_Honda_CR-V_dashboard.jpg', N'INTERIOR'),
      (N'51S0010', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2017_Honda_CR-V_%28front%29.jpg/800px-2017_Honda_CR-V_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0010', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2017_Honda_CR-V_%28rear%29.jpg/800px-2017_Honda_CR-V_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0010', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2017_Honda_CR-V_%28side%29.jpg/800px-2017_Honda_CR-V_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0010', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2017_Honda_CR-V_%28interior%29.jpg/800px-2017_Honda_CR-V_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0010', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/2017_Honda_CR-V_dashboard.jpg/800px-2017_Honda_CR-V_dashboard.jpg', N'INTERIOR'),
      (N'51R0011', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2022_Honda_HR-V_%28front%29.jpg/800px-2022_Honda_HR-V_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0011', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2022_Honda_HR-V_%28rear%29.jpg/800px-2022_Honda_HR-V_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0011', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/2022_Honda_HR-V_%28side%29.jpg/800px-2022_Honda_HR-V_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0011', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2022_Honda_HR-V_%28interior%29.jpg/800px-2022_Honda_HR-V_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0011', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/2022_Honda_HR-V_dashboard.jpg/800px-2022_Honda_HR-V_dashboard.jpg', N'INTERIOR'),
      (N'51S0011', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2022_Honda_HR-V_%28front%29.jpg/800px-2022_Honda_HR-V_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0011', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2022_Honda_HR-V_%28rear%29.jpg/800px-2022_Honda_HR-V_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0011', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/2022_Honda_HR-V_%28side%29.jpg/800px-2022_Honda_HR-V_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0011', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2022_Honda_HR-V_%28interior%29.jpg/800px-2022_Honda_HR-V_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0011', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/2022_Honda_HR-V_dashboard.jpg/800px-2022_Honda_HR-V_dashboard.jpg', N'INTERIOR'),
      (N'51R0012', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2021_Honda_Accord_%28front%29.jpg/800px-2021_Honda_Accord_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0012', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/2021_Honda_Accord_%28rear%29.jpg/800px-2021_Honda_Accord_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0012', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/2021_Honda_Accord_%28side%29.jpg/800px-2021_Honda_Accord_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0012', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/2021_Honda_Accord_%28interior%29.jpg/800px-2021_Honda_Accord_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0012', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/2021_Honda_Accord_dashboard.jpg/800px-2021_Honda_Accord_dashboard.jpg', N'INTERIOR'),
      (N'51S0012', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2021_Honda_Accord_%28front%29.jpg/800px-2021_Honda_Accord_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0012', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/2021_Honda_Accord_%28rear%29.jpg/800px-2021_Honda_Accord_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0012', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/2021_Honda_Accord_%28side%29.jpg/800px-2021_Honda_Accord_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0012', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/2021_Honda_Accord_%28interior%29.jpg/800px-2021_Honda_Accord_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0012', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/2021_Honda_Accord_dashboard.jpg/800px-2021_Honda_Accord_dashboard.jpg', N'INTERIOR'),
      (N'51R0013', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2019_Honda_BR-V_%28front%29.jpg/800px-2019_Honda_BR-V_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0013', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/2019_Honda_BR-V_%28rear%29.jpg/800px-2019_Honda_BR-V_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0013', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2019_Honda_BR-V_%28side%29.jpg/800px-2019_Honda_BR-V_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0013', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2019_Honda_BR-V_%28interior%29.jpg/800px-2019_Honda_BR-V_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0013', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/2019_Honda_BR-V_dashboard.jpg/800px-2019_Honda_BR-V_dashboard.jpg', N'INTERIOR'),
      (N'51S0013', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2019_Honda_BR-V_%28front%29.jpg/800px-2019_Honda_BR-V_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0013', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/2019_Honda_BR-V_%28rear%29.jpg/800px-2019_Honda_BR-V_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0013', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2019_Honda_BR-V_%28side%29.jpg/800px-2019_Honda_BR-V_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0013', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2019_Honda_BR-V_%28interior%29.jpg/800px-2019_Honda_BR-V_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0013', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/2019_Honda_BR-V_dashboard.jpg/800px-2019_Honda_BR-V_dashboard.jpg', N'INTERIOR'),
      (N'51R0014', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2018_Honda_Odyssey_%28front%29.jpg/800px-2018_Honda_Odyssey_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0014', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/2018_Honda_Odyssey_%28rear%29.jpg/800px-2018_Honda_Odyssey_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0014', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/2018_Honda_Odyssey_%28side%29.jpg/800px-2018_Honda_Odyssey_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0014', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2018_Honda_Odyssey_%28interior%29.jpg/800px-2018_Honda_Odyssey_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0014', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/2018_Honda_Odyssey_dashboard.jpg/800px-2018_Honda_Odyssey_dashboard.jpg', N'INTERIOR'),
      (N'51S0014', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2018_Honda_Odyssey_%28front%29.jpg/800px-2018_Honda_Odyssey_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0014', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/2018_Honda_Odyssey_%28rear%29.jpg/800px-2018_Honda_Odyssey_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0014', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/2018_Honda_Odyssey_%28side%29.jpg/800px-2018_Honda_Odyssey_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0014', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2018_Honda_Odyssey_%28interior%29.jpg/800px-2018_Honda_Odyssey_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0014', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/2018_Honda_Odyssey_dashboard.jpg/800px-2018_Honda_Odyssey_dashboard.jpg', N'INTERIOR'),
      (N'51R0015', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg', N'EXTERIOR'),
      (N'51R0015', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/VinFast_VF_3_IMG_7214.jpg/800px-VinFast_VF_3_IMG_7214.jpg', N'EXTERIOR'),
      (N'51R0015', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/VinFast_VF_3_%28Vietnam%29.jpg/800px-VinFast_VF_3_%28Vietnam%29.jpg', N'EXTERIOR'),
      (N'51R0015', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/VinFast_VF3_showcased_in_Hanoi.jpg/800px-VinFast_VF3_showcased_in_Hanoi.jpg', N'INTERIOR'),
      (N'51R0015', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/VinFast_VF_3_at_CAMMESA2024.jpg/800px-VinFast_VF_3_at_CAMMESA2024.jpg', N'INTERIOR'),
      (N'51S0015', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg', N'EXTERIOR'),
      (N'51S0015', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/VinFast_VF_3_IMG_7214.jpg/800px-VinFast_VF_3_IMG_7214.jpg', N'EXTERIOR'),
      (N'51S0015', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/VinFast_VF_3_%28Vietnam%29.jpg/800px-VinFast_VF_3_%28Vietnam%29.jpg', N'EXTERIOR'),
      (N'51S0015', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/VinFast_VF3_showcased_in_Hanoi.jpg/800px-VinFast_VF3_showcased_in_Hanoi.jpg', N'INTERIOR'),
      (N'51S0015', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/VinFast_VF_3_at_CAMMESA2024.jpg/800px-VinFast_VF_3_at_CAMMESA2024.jpg', N'INTERIOR'),
      (N'51R0016', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg/800px-VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg', N'EXTERIOR'),
      (N'51R0016', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg', N'EXTERIOR'),
      (N'51R0016', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/VinFast_VF_3_%28Vietnam%29.jpg/800px-VinFast_VF_3_%28Vietnam%29.jpg', N'EXTERIOR'),
      (N'51R0016', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/VinFast_VF3_showcased_in_Hanoi.jpg/800px-VinFast_VF3_showcased_in_Hanoi.jpg', N'INTERIOR'),
      (N'51R0016', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/VinFast_VF_3_at_CAMMESA2024.jpg/800px-VinFast_VF_3_at_CAMMESA2024.jpg', N'INTERIOR'),
      (N'51S0016', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg/800px-VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg', N'EXTERIOR'),
      (N'51S0016', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg', N'EXTERIOR'),
      (N'51S0016', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/VinFast_VF_3_%28Vietnam%29.jpg/800px-VinFast_VF_3_%28Vietnam%29.jpg', N'EXTERIOR'),
      (N'51S0016', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/VinFast_VF3_showcased_in_Hanoi.jpg/800px-VinFast_VF3_showcased_in_Hanoi.jpg', N'INTERIOR'),
      (N'51S0016', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/VinFast_VF_3_at_CAMMESA2024.jpg/800px-VinFast_VF_3_at_CAMMESA2024.jpg', N'INTERIOR'),
      (N'51R0017', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51R0017', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51R0017', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51R0017', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51R0017', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51S0017', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51S0017', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51S0017', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51S0017', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51S0017', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51R0018', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51R0018', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51R0018', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51R0018', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51R0018', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51S0018', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51S0018', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51S0018', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51S0018', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51S0018', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51R0019', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51R0019', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51R0019', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51R0019', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51R0019', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51S0019', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51S0019', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51S0019', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51S0019', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51S0019', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51R0020', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg/800px-VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg', N'EXTERIOR'),
      (N'51R0020', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/VinFast_VF9.jpg/800px-VinFast_VF9.jpg', N'EXTERIOR'),
      (N'51R0020', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/VinFast_VF_9_front.jpg/800px-VinFast_VF_9_front.jpg', N'EXTERIOR'),
      (N'51R0020', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/VinFast_VF_9_interior.jpg/800px-VinFast_VF_9_interior.jpg', N'INTERIOR'),
      (N'51R0020', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/VinFast_VF9_cabin.jpg/800px-VinFast_VF9_cabin.jpg', N'INTERIOR'),
      (N'51S0020', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg/800px-VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg', N'EXTERIOR'),
      (N'51S0020', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/VinFast_VF9.jpg/800px-VinFast_VF9.jpg', N'EXTERIOR'),
      (N'51S0020', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/VinFast_VF_9_front.jpg/800px-VinFast_VF_9_front.jpg', N'EXTERIOR'),
      (N'51S0020', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/VinFast_VF_9_interior.jpg/800px-VinFast_VF_9_interior.jpg', N'INTERIOR'),
      (N'51S0020', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/VinFast_VF9_cabin.jpg/800px-VinFast_VF9_cabin.jpg', N'INTERIOR'),
      (N'51R0021', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51R0021', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51R0021', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51R0021', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51R0021', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51S0021', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51S0021', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51S0021', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51S0021', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51S0021', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51R0022', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0022', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0022', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0022', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0022', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/2019_Mazda3_dashboard.jpg/800px-2019_Mazda3_dashboard.jpg', N'INTERIOR'),
      (N'51S0022', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0022', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0022', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0022', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0022', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/2019_Mazda3_dashboard.jpg/800px-2019_Mazda3_dashboard.jpg', N'INTERIOR'),
      (N'51R0023', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0023', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0023', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0023', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0023', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg', N'INTERIOR'),
      (N'51S0023', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0023', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0023', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0023', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0023', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg', N'INTERIOR'),
      (N'51R0024', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Mazda_CX-30_%28front%29.jpg/800px-2020_Mazda_CX-30_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0024', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2020_Mazda_CX-30_%28rear%29.jpg/800px-2020_Mazda_CX-30_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0024', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2020_Mazda_CX-30_%28side%29.jpg/800px-2020_Mazda_CX-30_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0024', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2020_Mazda_CX-30_%28interior%29.jpg/800px-2020_Mazda_CX-30_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0024', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2020_Mazda_CX-30_dashboard.jpg/800px-2020_Mazda_CX-30_dashboard.jpg', N'INTERIOR'),
      (N'51S0024', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Mazda_CX-30_%28front%29.jpg/800px-2020_Mazda_CX-30_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0024', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2020_Mazda_CX-30_%28rear%29.jpg/800px-2020_Mazda_CX-30_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0024', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2020_Mazda_CX-30_%28side%29.jpg/800px-2020_Mazda_CX-30_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0024', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2020_Mazda_CX-30_%28interior%29.jpg/800px-2020_Mazda_CX-30_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0024', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2020_Mazda_CX-30_dashboard.jpg/800px-2020_Mazda_CX-30_dashboard.jpg', N'INTERIOR'),
      (N'51R0025', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2012_Mazda_BT-50_%28front%29.jpg/800px-2012_Mazda_BT-50_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0025', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2012_Mazda_BT-50_%28rear%29.jpg/800px-2012_Mazda_BT-50_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0025', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2012_Mazda_BT-50_%28side%29.jpg/800px-2012_Mazda_BT-50_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0025', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2012_Mazda_BT-50_%28interior%29.jpg/800px-2012_Mazda_BT-50_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0025', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/2012_Mazda_BT-50_dashboard.jpg/800px-2012_Mazda_BT-50_dashboard.jpg', N'INTERIOR'),
      (N'51S0025', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2012_Mazda_BT-50_%28front%29.jpg/800px-2012_Mazda_BT-50_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0025', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2012_Mazda_BT-50_%28rear%29.jpg/800px-2012_Mazda_BT-50_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0025', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2012_Mazda_BT-50_%28side%29.jpg/800px-2012_Mazda_BT-50_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0025', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2012_Mazda_BT-50_%28interior%29.jpg/800px-2012_Mazda_BT-50_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0025', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/2012_Mazda_BT-50_dashboard.jpg/800px-2012_Mazda_BT-50_dashboard.jpg', N'INTERIOR'),
      (N'51R0026', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0026', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0026', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0026', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0026', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg', N'INTERIOR'),
      (N'51S0026', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0026', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0026', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0026', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0026', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg', N'INTERIOR'),
      (N'51R0027', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0027', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0027', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0027', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0027', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/2019_Mazda3_dashboard.jpg/800px-2019_Mazda3_dashboard.jpg', N'INTERIOR'),
      (N'51S0027', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0027', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0027', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0027', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0027', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/2019_Mazda3_dashboard.jpg/800px-2019_Mazda3_dashboard.jpg', N'INTERIOR'),
      (N'51R0028', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0028', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0028', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0028', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0028', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg', N'INTERIOR'),
      (N'51S0028', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0028', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0028', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0028', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0028', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg', N'INTERIOR'),
      (N'51R0029', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', N'EXTERIOR'),
      (N'51R0029', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mercedes-Benz_W206_IMG_6744.jpg/800px-Mercedes-Benz_W206_IMG_6744.jpg', N'EXTERIOR'),
      (N'51R0029', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mercedes-Benz_W206_IMG_6745.jpg/800px-Mercedes-Benz_W206_IMG_6745.jpg', N'EXTERIOR'),
      (N'51R0029', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mercedes-Benz_W206_interior_IMG_6746.jpg/800px-Mercedes-Benz_W206_interior_IMG_6746.jpg', N'INTERIOR'),
      (N'51R0029', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mercedes-Benz_W206_cabin.jpg/800px-Mercedes-Benz_W206_cabin.jpg', N'INTERIOR'),
      (N'51S0029', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', N'EXTERIOR'),
      (N'51S0029', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mercedes-Benz_W206_IMG_6744.jpg/800px-Mercedes-Benz_W206_IMG_6744.jpg', N'EXTERIOR'),
      (N'51S0029', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mercedes-Benz_W206_IMG_6745.jpg/800px-Mercedes-Benz_W206_IMG_6745.jpg', N'EXTERIOR'),
      (N'51S0029', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mercedes-Benz_W206_interior_IMG_6746.jpg/800px-Mercedes-Benz_W206_interior_IMG_6746.jpg', N'INTERIOR'),
      (N'51S0029', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mercedes-Benz_W206_cabin.jpg/800px-Mercedes-Benz_W206_cabin.jpg', N'INTERIOR'),
      (N'51R0030', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', N'EXTERIOR'),
      (N'51R0030', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mercedes-Benz_W206_IMG_6744.jpg/800px-Mercedes-Benz_W206_IMG_6744.jpg', N'EXTERIOR'),
      (N'51R0030', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mercedes-Benz_W206_IMG_6745.jpg/800px-Mercedes-Benz_W206_IMG_6745.jpg', N'EXTERIOR'),
      (N'51R0030', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mercedes-Benz_W206_interior_IMG_6746.jpg/800px-Mercedes-Benz_W206_interior_IMG_6746.jpg', N'INTERIOR'),
      (N'51R0030', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mercedes-Benz_W206_cabin.jpg/800px-Mercedes-Benz_W206_cabin.jpg', N'INTERIOR'),
      (N'51S0030', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', N'EXTERIOR'),
      (N'51S0030', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mercedes-Benz_W206_IMG_6744.jpg/800px-Mercedes-Benz_W206_IMG_6744.jpg', N'EXTERIOR'),
      (N'51S0030', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mercedes-Benz_W206_IMG_6745.jpg/800px-Mercedes-Benz_W206_IMG_6745.jpg', N'EXTERIOR'),
      (N'51S0030', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mercedes-Benz_W206_interior_IMG_6746.jpg/800px-Mercedes-Benz_W206_interior_IMG_6746.jpg', N'INTERIOR'),
      (N'51S0030', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mercedes-Benz_W206_cabin.jpg/800px-Mercedes-Benz_W206_cabin.jpg', N'INTERIOR'),
      (N'51R0031', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', N'EXTERIOR'),
      (N'51R0031', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mercedes-Benz_W213_IMG_3528.jpg/800px-Mercedes-Benz_W213_IMG_3528.jpg', N'EXTERIOR'),
      (N'51R0031', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mercedes-Benz_W213_IMG_3529.jpg/800px-Mercedes-Benz_W213_IMG_3529.jpg', N'EXTERIOR'),
      (N'51R0031', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mercedes-Benz_W213_interior.jpg/800px-Mercedes-Benz_W213_interior.jpg', N'INTERIOR'),
      (N'51R0031', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mercedes-Benz_W213_cabin.jpg/800px-Mercedes-Benz_W213_cabin.jpg', N'INTERIOR'),
      (N'51S0031', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', N'EXTERIOR'),
      (N'51S0031', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mercedes-Benz_W213_IMG_3528.jpg/800px-Mercedes-Benz_W213_IMG_3528.jpg', N'EXTERIOR'),
      (N'51S0031', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mercedes-Benz_W213_IMG_3529.jpg/800px-Mercedes-Benz_W213_IMG_3529.jpg', N'EXTERIOR'),
      (N'51S0031', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mercedes-Benz_W213_interior.jpg/800px-Mercedes-Benz_W213_interior.jpg', N'INTERIOR'),
      (N'51S0031', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mercedes-Benz_W213_cabin.jpg/800px-Mercedes-Benz_W213_cabin.jpg', N'INTERIOR'),
      (N'51R0032', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'EXTERIOR'),
      (N'51R0032', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg', N'EXTERIOR'),
      (N'51R0032', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg', N'EXTERIOR'),
      (N'51R0032', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg', N'INTERIOR'),
      (N'51R0032', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg', N'INTERIOR'),
      (N'51S0032', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'EXTERIOR'),
      (N'51S0032', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg', N'EXTERIOR'),
      (N'51S0032', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg', N'EXTERIOR'),
      (N'51S0032', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg', N'INTERIOR'),
      (N'51S0032', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg', N'INTERIOR'),
      (N'51R0033', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'EXTERIOR'),
      (N'51R0033', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg', N'EXTERIOR'),
      (N'51R0033', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg', N'EXTERIOR'),
      (N'51R0033', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg', N'INTERIOR'),
      (N'51R0033', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg', N'INTERIOR'),
      (N'51S0033', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'EXTERIOR'),
      (N'51S0033', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg', N'EXTERIOR'),
      (N'51S0033', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg', N'EXTERIOR'),
      (N'51S0033', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg', N'INTERIOR'),
      (N'51S0033', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg', N'INTERIOR'),
      (N'51R0034', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'EXTERIOR'),
      (N'51R0034', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg', N'EXTERIOR'),
      (N'51R0034', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg', N'EXTERIOR'),
      (N'51R0034', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg', N'INTERIOR'),
      (N'51R0034', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg', N'INTERIOR'),
      (N'51S0034', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'EXTERIOR'),
      (N'51S0034', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg', N'EXTERIOR'),
      (N'51S0034', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg', N'EXTERIOR'),
      (N'51S0034', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg', N'INTERIOR'),
      (N'51S0034', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg', N'INTERIOR'),
      (N'51R0035', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', N'EXTERIOR'),
      (N'51R0035', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mercedes-Benz_W213_IMG_3528.jpg/800px-Mercedes-Benz_W213_IMG_3528.jpg', N'EXTERIOR'),
      (N'51R0035', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mercedes-Benz_W213_IMG_3529.jpg/800px-Mercedes-Benz_W213_IMG_3529.jpg', N'EXTERIOR'),
      (N'51R0035', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mercedes-Benz_W213_interior.jpg/800px-Mercedes-Benz_W213_interior.jpg', N'INTERIOR'),
      (N'51R0035', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mercedes-Benz_W213_cabin.jpg/800px-Mercedes-Benz_W213_cabin.jpg', N'INTERIOR'),
      (N'51S0035', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', N'EXTERIOR'),
      (N'51S0035', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mercedes-Benz_W213_IMG_3528.jpg/800px-Mercedes-Benz_W213_IMG_3528.jpg', N'EXTERIOR'),
      (N'51S0035', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mercedes-Benz_W213_IMG_3529.jpg/800px-Mercedes-Benz_W213_IMG_3529.jpg', N'EXTERIOR'),
      (N'51S0035', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mercedes-Benz_W213_interior.jpg/800px-Mercedes-Benz_W213_interior.jpg', N'INTERIOR'),
      (N'51S0035', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mercedes-Benz_W213_cabin.jpg/800px-Mercedes-Benz_W213_cabin.jpg', N'INTERIOR')
) AS src([plate], [sort_order], [image_url], [image_type])
JOIN [dbo].[cars] c ON c.[plate] = src.[plate];
END
GO

/* user_documents (KYC mẫu) */
IF NOT EXISTS (SELECT 1 FROM [dbo].[user_documents] ud INNER JOIN [dbo].[users] u ON ud.[user_id] = u.[id] WHERE u.[email] = N'user@autohub.id.vn' AND ud.[document_type] = N'CCCD')
    INSERT INTO [dbo].[user_documents] ([created_date], [document_type], [file_path], [status], [admin_note], [reviewed_at], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'CCCD', N'kyc/demo-cccd-user.png', N'APPROVED', NULL, SYSUTCDATETIME(), [id]
    FROM [dbo].[users] WHERE [email] = N'user@autohub.id.vn';

IF NOT EXISTS (SELECT 1 FROM [dbo].[user_documents] ud INNER JOIN [dbo].[users] u ON ud.[user_id] = u.[id] WHERE u.[email] = N'user@autohub.id.vn' AND ud.[document_type] = N'GPLX')
    INSERT INTO [dbo].[user_documents] ([created_date], [document_type], [file_path], [status], [admin_note], [reviewed_at], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'GPLX', N'kyc/demo-gplx-user.png', N'APPROVED', NULL, SYSUTCDATETIME(), [id]
    FROM [dbo].[users] WHERE [email] = N'user@autohub.id.vn';

IF NOT EXISTS (SELECT 1 FROM [dbo].[user_documents] ud INNER JOIN [dbo].[users] u ON ud.[user_id] = u.[id] WHERE u.[email] = N'corp@autohub.id.vn' AND ud.[document_type] = N'CCCD')
    INSERT INTO [dbo].[user_documents] ([created_date], [document_type], [file_path], [status], [admin_note], [reviewed_at], [user_id])
    SELECT CAST(GETDATE() AS DATE), N'CCCD', N'kyc/demo-cccd-corp.png', N'APPROVED', NULL, SYSUTCDATETIME(), [id]
    FROM [dbo].[users] WHERE [email] = N'corp@autohub.id.vn';
GO


/* Gallery backfill: DB cu da co xe nhung chua co car_images */
IF NOT EXISTS (SELECT 1 FROM [dbo].[car_images])
   AND (SELECT COUNT(*) FROM [dbo].[cars]) = 70
BEGIN
/* Gallery 5 ảnh / xe (3 ngoại + 2 nội thất) */
INSERT INTO [dbo].[car_images] ([car_id], [sort_order], [image_url], [image_type])
SELECT c.[id], src.[sort_order], src.[image_url], src.[image_type]
FROM (
VALUES
      (N'51R0001', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg', N'EXTERIOR'),
      (N'51R0001', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_left_%28NY%29.jpg', N'EXTERIOR'),
      (N'51R0001', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_side_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_side_%28NY%29.jpg', N'EXTERIOR'),
      (N'51R0001', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_interior.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_interior.jpg', N'INTERIOR'),
      (N'51R0001', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_interior.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_interior.jpg', N'INTERIOR'),
      (N'51S0001', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg', N'EXTERIOR'),
      (N'51S0001', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_left_%28NY%29.jpg', N'EXTERIOR'),
      (N'51S0001', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_side_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_side_%28NY%29.jpg', N'EXTERIOR'),
      (N'51S0001', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_interior.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_interior.jpg', N'INTERIOR'),
      (N'51S0001', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_interior.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_interior.jpg', N'INTERIOR'),
      (N'51R0002', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0002', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2021_Toyota_Corolla_Cross_Hybrid_%28rear%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0002', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2021_Toyota_Corolla_Cross_Hybrid_%28side%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0002', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/2021_Toyota_Corolla_Cross_Hybrid_%28interior%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0002', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/2021_Toyota_Corolla_Cross_dashboard.jpg/800px-2021_Toyota_Corolla_Cross_dashboard.jpg', N'INTERIOR'),
      (N'51S0002', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0002', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2021_Toyota_Corolla_Cross_Hybrid_%28rear%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0002', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2021_Toyota_Corolla_Cross_Hybrid_%28side%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0002', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/2021_Toyota_Corolla_Cross_Hybrid_%28interior%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0002', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/2021_Toyota_Corolla_Cross_dashboard.jpg/800px-2021_Toyota_Corolla_Cross_dashboard.jpg', N'INTERIOR'),
      (N'51R0003', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2016_Toyota_Fortuner_%28front%29.jpg/800px-2016_Toyota_Fortuner_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0003', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/2016_Toyota_Fortuner_%28rear%29.jpg/800px-2016_Toyota_Fortuner_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0003', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2016_Toyota_Fortuner_%28side%29.jpg/800px-2016_Toyota_Fortuner_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0003', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/2016_Toyota_Fortuner_%28interior%29.jpg/800px-2016_Toyota_Fortuner_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0003', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/2016_Toyota_Fortuner_dashboard.jpg/800px-2016_Toyota_Fortuner_dashboard.jpg', N'INTERIOR'),
      (N'51S0003', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2016_Toyota_Fortuner_%28front%29.jpg/800px-2016_Toyota_Fortuner_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0003', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/2016_Toyota_Fortuner_%28rear%29.jpg/800px-2016_Toyota_Fortuner_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0003', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2016_Toyota_Fortuner_%28side%29.jpg/800px-2016_Toyota_Fortuner_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0003', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/2016_Toyota_Fortuner_%28interior%29.jpg/800px-2016_Toyota_Fortuner_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0003', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/2016_Toyota_Fortuner_dashboard.jpg/800px-2016_Toyota_Fortuner_dashboard.jpg', N'INTERIOR'),
      (N'51R0004', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2018_Toyota_Vios_%28front%29.jpg/800px-2018_Toyota_Vios_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0004', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2018_Toyota_Vios_%28rear%29.jpg/800px-2018_Toyota_Vios_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0004', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/2018_Toyota_Vios_%28side%29.jpg/800px-2018_Toyota_Vios_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0004', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2018_Toyota_Vios_%28interior%29.jpg/800px-2018_Toyota_Vios_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0004', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2018_Toyota_Vios_dashboard.jpg/800px-2018_Toyota_Vios_dashboard.jpg', N'INTERIOR'),
      (N'51S0004', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2018_Toyota_Vios_%28front%29.jpg/800px-2018_Toyota_Vios_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0004', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2018_Toyota_Vios_%28rear%29.jpg/800px-2018_Toyota_Vios_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0004', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/2018_Toyota_Vios_%28side%29.jpg/800px-2018_Toyota_Vios_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0004', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2018_Toyota_Vios_%28interior%29.jpg/800px-2018_Toyota_Vios_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0004', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2018_Toyota_Vios_dashboard.jpg/800px-2018_Toyota_Vios_dashboard.jpg', N'INTERIOR'),
      (N'51R0005', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/2023_Toyota_Innova_Cross_%28front%29.jpg/800px-2023_Toyota_Innova_Cross_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0005', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2023_Toyota_Innova_Cross_%28rear%29.jpg/800px-2023_Toyota_Innova_Cross_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0005', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2023_Toyota_Innova_Cross_%28side%29.jpg/800px-2023_Toyota_Innova_Cross_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0005', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/2023_Toyota_Innova_Cross_%28interior%29.jpg/800px-2023_Toyota_Innova_Cross_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0005', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/2023_Toyota_Innova_Cross_dashboard.jpg/800px-2023_Toyota_Innova_Cross_dashboard.jpg', N'INTERIOR'),
      (N'51S0005', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/2023_Toyota_Innova_Cross_%28front%29.jpg/800px-2023_Toyota_Innova_Cross_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0005', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2023_Toyota_Innova_Cross_%28rear%29.jpg/800px-2023_Toyota_Innova_Cross_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0005', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2023_Toyota_Innova_Cross_%28side%29.jpg/800px-2023_Toyota_Innova_Cross_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0005', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/2023_Toyota_Innova_Cross_%28interior%29.jpg/800px-2023_Toyota_Innova_Cross_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0005', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/2023_Toyota_Innova_Cross_dashboard.jpg/800px-2023_Toyota_Innova_Cross_dashboard.jpg', N'INTERIOR'),
      (N'51R0006', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/2018_Toyota_Hilux_%28front%29.jpg/800px-2018_Toyota_Hilux_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0006', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/2018_Toyota_Hilux_%28rear%29.jpg/800px-2018_Toyota_Hilux_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0006', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2018_Toyota_Hilux_%28side%29.jpg/800px-2018_Toyota_Hilux_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0006', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/2018_Toyota_Hilux_%28interior%29.jpg/800px-2018_Toyota_Hilux_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0006', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2018_Toyota_Hilux_dashboard.jpg/800px-2018_Toyota_Hilux_dashboard.jpg', N'INTERIOR'),
      (N'51S0006', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/2018_Toyota_Hilux_%28front%29.jpg/800px-2018_Toyota_Hilux_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0006', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/2018_Toyota_Hilux_%28rear%29.jpg/800px-2018_Toyota_Hilux_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0006', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2018_Toyota_Hilux_%28side%29.jpg/800px-2018_Toyota_Hilux_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0006', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/2018_Toyota_Hilux_%28interior%29.jpg/800px-2018_Toyota_Hilux_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0006', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2018_Toyota_Hilux_dashboard.jpg/800px-2018_Toyota_Hilux_dashboard.jpg', N'INTERIOR'),
      (N'51R0007', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2022_Toyota_Yaris_Cross_%28front%29.jpg/800px-2022_Toyota_Yaris_Cross_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0007', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2022_Toyota_Yaris_Cross_%28rear%29.jpg/800px-2022_Toyota_Yaris_Cross_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0007', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2022_Toyota_Yaris_Cross_%28side%29.jpg/800px-2022_Toyota_Yaris_Cross_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0007', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/2022_Toyota_Yaris_Cross_%28interior%29.jpg/800px-2022_Toyota_Yaris_Cross_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0007', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/2022_Toyota_Yaris_Cross_dashboard.jpg/800px-2022_Toyota_Yaris_Cross_dashboard.jpg', N'INTERIOR'),
      (N'51S0007', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2022_Toyota_Yaris_Cross_%28front%29.jpg/800px-2022_Toyota_Yaris_Cross_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0007', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2022_Toyota_Yaris_Cross_%28rear%29.jpg/800px-2022_Toyota_Yaris_Cross_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0007', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2022_Toyota_Yaris_Cross_%28side%29.jpg/800px-2022_Toyota_Yaris_Cross_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0007', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/2022_Toyota_Yaris_Cross_%28interior%29.jpg/800px-2022_Toyota_Yaris_Cross_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0007', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/2022_Toyota_Yaris_Cross_dashboard.jpg/800px-2022_Toyota_Yaris_Cross_dashboard.jpg', N'INTERIOR'),
      (N'51R0008', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2020_Honda_City_RS_%28front%29.jpg/800px-2020_Honda_City_RS_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0008', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/2020_Honda_City_RS_%28rear%29.jpg/800px-2020_Honda_City_RS_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0008', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Honda_City_RS_%28side%29.jpg/800px-2020_Honda_City_RS_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0008', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2020_Honda_City_RS_%28interior%29.jpg/800px-2020_Honda_City_RS_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0008', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2020_Honda_City_dashboard.jpg/800px-2020_Honda_City_dashboard.jpg', N'INTERIOR'),
      (N'51S0008', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2020_Honda_City_RS_%28front%29.jpg/800px-2020_Honda_City_RS_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0008', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/2020_Honda_City_RS_%28rear%29.jpg/800px-2020_Honda_City_RS_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0008', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Honda_City_RS_%28side%29.jpg/800px-2020_Honda_City_RS_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0008', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2020_Honda_City_RS_%28interior%29.jpg/800px-2020_Honda_City_RS_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0008', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2020_Honda_City_dashboard.jpg/800px-2020_Honda_City_dashboard.jpg', N'INTERIOR'),
      (N'51R0009', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2022_Honda_Civic_FE_%28front%29.jpg/800px-2022_Honda_Civic_FE_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0009', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2022_Honda_Civic_FE_%28rear%29.jpg/800px-2022_Honda_Civic_FE_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0009', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/2022_Honda_Civic_FE_%28side%29.jpg/800px-2022_Honda_Civic_FE_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0009', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/2022_Honda_Civic_FE_%28interior%29.jpg/800px-2022_Honda_Civic_FE_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0009', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/2022_Honda_Civic_dashboard.jpg/800px-2022_Honda_Civic_dashboard.jpg', N'INTERIOR'),
      (N'51S0009', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2022_Honda_Civic_FE_%28front%29.jpg/800px-2022_Honda_Civic_FE_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0009', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2022_Honda_Civic_FE_%28rear%29.jpg/800px-2022_Honda_Civic_FE_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0009', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/2022_Honda_Civic_FE_%28side%29.jpg/800px-2022_Honda_Civic_FE_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0009', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/2022_Honda_Civic_FE_%28interior%29.jpg/800px-2022_Honda_Civic_FE_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0009', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/2022_Honda_Civic_dashboard.jpg/800px-2022_Honda_Civic_dashboard.jpg', N'INTERIOR'),
      (N'51R0010', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2017_Honda_CR-V_%28front%29.jpg/800px-2017_Honda_CR-V_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0010', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2017_Honda_CR-V_%28rear%29.jpg/800px-2017_Honda_CR-V_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0010', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2017_Honda_CR-V_%28side%29.jpg/800px-2017_Honda_CR-V_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0010', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2017_Honda_CR-V_%28interior%29.jpg/800px-2017_Honda_CR-V_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0010', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/2017_Honda_CR-V_dashboard.jpg/800px-2017_Honda_CR-V_dashboard.jpg', N'INTERIOR'),
      (N'51S0010', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2017_Honda_CR-V_%28front%29.jpg/800px-2017_Honda_CR-V_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0010', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2017_Honda_CR-V_%28rear%29.jpg/800px-2017_Honda_CR-V_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0010', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2017_Honda_CR-V_%28side%29.jpg/800px-2017_Honda_CR-V_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0010', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2017_Honda_CR-V_%28interior%29.jpg/800px-2017_Honda_CR-V_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0010', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/2017_Honda_CR-V_dashboard.jpg/800px-2017_Honda_CR-V_dashboard.jpg', N'INTERIOR'),
      (N'51R0011', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2022_Honda_HR-V_%28front%29.jpg/800px-2022_Honda_HR-V_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0011', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2022_Honda_HR-V_%28rear%29.jpg/800px-2022_Honda_HR-V_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0011', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/2022_Honda_HR-V_%28side%29.jpg/800px-2022_Honda_HR-V_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0011', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2022_Honda_HR-V_%28interior%29.jpg/800px-2022_Honda_HR-V_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0011', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/2022_Honda_HR-V_dashboard.jpg/800px-2022_Honda_HR-V_dashboard.jpg', N'INTERIOR'),
      (N'51S0011', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2022_Honda_HR-V_%28front%29.jpg/800px-2022_Honda_HR-V_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0011', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2022_Honda_HR-V_%28rear%29.jpg/800px-2022_Honda_HR-V_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0011', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/2022_Honda_HR-V_%28side%29.jpg/800px-2022_Honda_HR-V_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0011', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2022_Honda_HR-V_%28interior%29.jpg/800px-2022_Honda_HR-V_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0011', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/2022_Honda_HR-V_dashboard.jpg/800px-2022_Honda_HR-V_dashboard.jpg', N'INTERIOR'),
      (N'51R0012', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2021_Honda_Accord_%28front%29.jpg/800px-2021_Honda_Accord_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0012', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/2021_Honda_Accord_%28rear%29.jpg/800px-2021_Honda_Accord_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0012', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/2021_Honda_Accord_%28side%29.jpg/800px-2021_Honda_Accord_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0012', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/2021_Honda_Accord_%28interior%29.jpg/800px-2021_Honda_Accord_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0012', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/2021_Honda_Accord_dashboard.jpg/800px-2021_Honda_Accord_dashboard.jpg', N'INTERIOR'),
      (N'51S0012', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2021_Honda_Accord_%28front%29.jpg/800px-2021_Honda_Accord_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0012', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/2021_Honda_Accord_%28rear%29.jpg/800px-2021_Honda_Accord_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0012', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/2021_Honda_Accord_%28side%29.jpg/800px-2021_Honda_Accord_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0012', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/2021_Honda_Accord_%28interior%29.jpg/800px-2021_Honda_Accord_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0012', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/2021_Honda_Accord_dashboard.jpg/800px-2021_Honda_Accord_dashboard.jpg', N'INTERIOR'),
      (N'51R0013', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2019_Honda_BR-V_%28front%29.jpg/800px-2019_Honda_BR-V_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0013', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/2019_Honda_BR-V_%28rear%29.jpg/800px-2019_Honda_BR-V_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0013', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2019_Honda_BR-V_%28side%29.jpg/800px-2019_Honda_BR-V_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0013', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2019_Honda_BR-V_%28interior%29.jpg/800px-2019_Honda_BR-V_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0013', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/2019_Honda_BR-V_dashboard.jpg/800px-2019_Honda_BR-V_dashboard.jpg', N'INTERIOR'),
      (N'51S0013', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2019_Honda_BR-V_%28front%29.jpg/800px-2019_Honda_BR-V_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0013', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/2019_Honda_BR-V_%28rear%29.jpg/800px-2019_Honda_BR-V_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0013', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2019_Honda_BR-V_%28side%29.jpg/800px-2019_Honda_BR-V_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0013', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2019_Honda_BR-V_%28interior%29.jpg/800px-2019_Honda_BR-V_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0013', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/2019_Honda_BR-V_dashboard.jpg/800px-2019_Honda_BR-V_dashboard.jpg', N'INTERIOR'),
      (N'51R0014', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2018_Honda_Odyssey_%28front%29.jpg/800px-2018_Honda_Odyssey_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0014', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/2018_Honda_Odyssey_%28rear%29.jpg/800px-2018_Honda_Odyssey_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0014', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/2018_Honda_Odyssey_%28side%29.jpg/800px-2018_Honda_Odyssey_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0014', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2018_Honda_Odyssey_%28interior%29.jpg/800px-2018_Honda_Odyssey_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0014', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/2018_Honda_Odyssey_dashboard.jpg/800px-2018_Honda_Odyssey_dashboard.jpg', N'INTERIOR'),
      (N'51S0014', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2018_Honda_Odyssey_%28front%29.jpg/800px-2018_Honda_Odyssey_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0014', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/2018_Honda_Odyssey_%28rear%29.jpg/800px-2018_Honda_Odyssey_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0014', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/2018_Honda_Odyssey_%28side%29.jpg/800px-2018_Honda_Odyssey_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0014', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2018_Honda_Odyssey_%28interior%29.jpg/800px-2018_Honda_Odyssey_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0014', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/2018_Honda_Odyssey_dashboard.jpg/800px-2018_Honda_Odyssey_dashboard.jpg', N'INTERIOR'),
      (N'51R0015', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg', N'EXTERIOR'),
      (N'51R0015', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/VinFast_VF_3_IMG_7214.jpg/800px-VinFast_VF_3_IMG_7214.jpg', N'EXTERIOR'),
      (N'51R0015', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/VinFast_VF_3_%28Vietnam%29.jpg/800px-VinFast_VF_3_%28Vietnam%29.jpg', N'EXTERIOR'),
      (N'51R0015', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/VinFast_VF3_showcased_in_Hanoi.jpg/800px-VinFast_VF3_showcased_in_Hanoi.jpg', N'INTERIOR'),
      (N'51R0015', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/VinFast_VF_3_at_CAMMESA2024.jpg/800px-VinFast_VF_3_at_CAMMESA2024.jpg', N'INTERIOR'),
      (N'51S0015', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg', N'EXTERIOR'),
      (N'51S0015', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/VinFast_VF_3_IMG_7214.jpg/800px-VinFast_VF_3_IMG_7214.jpg', N'EXTERIOR'),
      (N'51S0015', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/VinFast_VF_3_%28Vietnam%29.jpg/800px-VinFast_VF_3_%28Vietnam%29.jpg', N'EXTERIOR'),
      (N'51S0015', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/VinFast_VF3_showcased_in_Hanoi.jpg/800px-VinFast_VF3_showcased_in_Hanoi.jpg', N'INTERIOR'),
      (N'51S0015', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/VinFast_VF_3_at_CAMMESA2024.jpg/800px-VinFast_VF_3_at_CAMMESA2024.jpg', N'INTERIOR'),
      (N'51R0016', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg/800px-VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg', N'EXTERIOR'),
      (N'51R0016', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg', N'EXTERIOR'),
      (N'51R0016', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/VinFast_VF_3_%28Vietnam%29.jpg/800px-VinFast_VF_3_%28Vietnam%29.jpg', N'EXTERIOR'),
      (N'51R0016', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/VinFast_VF3_showcased_in_Hanoi.jpg/800px-VinFast_VF3_showcased_in_Hanoi.jpg', N'INTERIOR'),
      (N'51R0016', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/VinFast_VF_3_at_CAMMESA2024.jpg/800px-VinFast_VF_3_at_CAMMESA2024.jpg', N'INTERIOR'),
      (N'51S0016', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg/800px-VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg', N'EXTERIOR'),
      (N'51S0016', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg', N'EXTERIOR'),
      (N'51S0016', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/VinFast_VF_3_%28Vietnam%29.jpg/800px-VinFast_VF_3_%28Vietnam%29.jpg', N'EXTERIOR'),
      (N'51S0016', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/VinFast_VF3_showcased_in_Hanoi.jpg/800px-VinFast_VF3_showcased_in_Hanoi.jpg', N'INTERIOR'),
      (N'51S0016', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/VinFast_VF_3_at_CAMMESA2024.jpg/800px-VinFast_VF_3_at_CAMMESA2024.jpg', N'INTERIOR'),
      (N'51R0017', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51R0017', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51R0017', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51R0017', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51R0017', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51S0017', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51S0017', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51S0017', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51S0017', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51S0017', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51R0018', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51R0018', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51R0018', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51R0018', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51R0018', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51S0018', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51S0018', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51S0018', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51S0018', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51S0018', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51R0019', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51R0019', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51R0019', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51R0019', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51R0019', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51S0019', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51S0019', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51S0019', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51S0019', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51S0019', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51R0020', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg/800px-VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg', N'EXTERIOR'),
      (N'51R0020', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/VinFast_VF9.jpg/800px-VinFast_VF9.jpg', N'EXTERIOR'),
      (N'51R0020', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/VinFast_VF_9_front.jpg/800px-VinFast_VF_9_front.jpg', N'EXTERIOR'),
      (N'51R0020', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/VinFast_VF_9_interior.jpg/800px-VinFast_VF_9_interior.jpg', N'INTERIOR'),
      (N'51R0020', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/VinFast_VF9_cabin.jpg/800px-VinFast_VF9_cabin.jpg', N'INTERIOR'),
      (N'51S0020', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg/800px-VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg', N'EXTERIOR'),
      (N'51S0020', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/VinFast_VF9.jpg/800px-VinFast_VF9.jpg', N'EXTERIOR'),
      (N'51S0020', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/VinFast_VF_9_front.jpg/800px-VinFast_VF_9_front.jpg', N'EXTERIOR'),
      (N'51S0020', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/VinFast_VF_9_interior.jpg/800px-VinFast_VF_9_interior.jpg', N'INTERIOR'),
      (N'51S0020', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/VinFast_VF9_cabin.jpg/800px-VinFast_VF9_cabin.jpg', N'INTERIOR'),
      (N'51R0021', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51R0021', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51R0021', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51R0021', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51R0021', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51S0021', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg', N'EXTERIOR'),
      (N'51S0021', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg', N'EXTERIOR'),
      (N'51S0021', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg', N'EXTERIOR'),
      (N'51S0021', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg', N'INTERIOR'),
      (N'51S0021', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg', N'INTERIOR'),
      (N'51R0022', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0022', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0022', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0022', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0022', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/2019_Mazda3_dashboard.jpg/800px-2019_Mazda3_dashboard.jpg', N'INTERIOR'),
      (N'51S0022', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0022', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0022', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0022', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0022', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/2019_Mazda3_dashboard.jpg/800px-2019_Mazda3_dashboard.jpg', N'INTERIOR'),
      (N'51R0023', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0023', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0023', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0023', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0023', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg', N'INTERIOR'),
      (N'51S0023', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0023', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0023', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0023', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0023', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg', N'INTERIOR'),
      (N'51R0024', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Mazda_CX-30_%28front%29.jpg/800px-2020_Mazda_CX-30_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0024', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2020_Mazda_CX-30_%28rear%29.jpg/800px-2020_Mazda_CX-30_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0024', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2020_Mazda_CX-30_%28side%29.jpg/800px-2020_Mazda_CX-30_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0024', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2020_Mazda_CX-30_%28interior%29.jpg/800px-2020_Mazda_CX-30_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0024', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2020_Mazda_CX-30_dashboard.jpg/800px-2020_Mazda_CX-30_dashboard.jpg', N'INTERIOR'),
      (N'51S0024', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Mazda_CX-30_%28front%29.jpg/800px-2020_Mazda_CX-30_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0024', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2020_Mazda_CX-30_%28rear%29.jpg/800px-2020_Mazda_CX-30_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0024', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2020_Mazda_CX-30_%28side%29.jpg/800px-2020_Mazda_CX-30_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0024', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2020_Mazda_CX-30_%28interior%29.jpg/800px-2020_Mazda_CX-30_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0024', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2020_Mazda_CX-30_dashboard.jpg/800px-2020_Mazda_CX-30_dashboard.jpg', N'INTERIOR'),
      (N'51R0025', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2012_Mazda_BT-50_%28front%29.jpg/800px-2012_Mazda_BT-50_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0025', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2012_Mazda_BT-50_%28rear%29.jpg/800px-2012_Mazda_BT-50_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0025', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2012_Mazda_BT-50_%28side%29.jpg/800px-2012_Mazda_BT-50_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0025', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2012_Mazda_BT-50_%28interior%29.jpg/800px-2012_Mazda_BT-50_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0025', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/2012_Mazda_BT-50_dashboard.jpg/800px-2012_Mazda_BT-50_dashboard.jpg', N'INTERIOR'),
      (N'51S0025', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2012_Mazda_BT-50_%28front%29.jpg/800px-2012_Mazda_BT-50_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0025', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2012_Mazda_BT-50_%28rear%29.jpg/800px-2012_Mazda_BT-50_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0025', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2012_Mazda_BT-50_%28side%29.jpg/800px-2012_Mazda_BT-50_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0025', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2012_Mazda_BT-50_%28interior%29.jpg/800px-2012_Mazda_BT-50_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0025', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/2012_Mazda_BT-50_dashboard.jpg/800px-2012_Mazda_BT-50_dashboard.jpg', N'INTERIOR'),
      (N'51R0026', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0026', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0026', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0026', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0026', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg', N'INTERIOR'),
      (N'51S0026', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0026', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0026', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0026', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0026', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg', N'INTERIOR'),
      (N'51R0027', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0027', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0027', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0027', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0027', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/2019_Mazda3_dashboard.jpg/800px-2019_Mazda3_dashboard.jpg', N'INTERIOR'),
      (N'51S0027', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0027', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0027', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0027', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0027', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/2019_Mazda3_dashboard.jpg/800px-2019_Mazda3_dashboard.jpg', N'INTERIOR'),
      (N'51R0028', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'EXTERIOR'),
      (N'51R0028', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg', N'EXTERIOR'),
      (N'51R0028', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg', N'EXTERIOR'),
      (N'51R0028', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg', N'INTERIOR'),
      (N'51R0028', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg', N'INTERIOR'),
      (N'51S0028', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg', N'EXTERIOR'),
      (N'51S0028', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg', N'EXTERIOR'),
      (N'51S0028', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg', N'EXTERIOR'),
      (N'51S0028', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg', N'INTERIOR'),
      (N'51S0028', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg', N'INTERIOR'),
      (N'51R0029', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', N'EXTERIOR'),
      (N'51R0029', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mercedes-Benz_W206_IMG_6744.jpg/800px-Mercedes-Benz_W206_IMG_6744.jpg', N'EXTERIOR'),
      (N'51R0029', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mercedes-Benz_W206_IMG_6745.jpg/800px-Mercedes-Benz_W206_IMG_6745.jpg', N'EXTERIOR'),
      (N'51R0029', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mercedes-Benz_W206_interior_IMG_6746.jpg/800px-Mercedes-Benz_W206_interior_IMG_6746.jpg', N'INTERIOR'),
      (N'51R0029', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mercedes-Benz_W206_cabin.jpg/800px-Mercedes-Benz_W206_cabin.jpg', N'INTERIOR'),
      (N'51S0029', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', N'EXTERIOR'),
      (N'51S0029', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mercedes-Benz_W206_IMG_6744.jpg/800px-Mercedes-Benz_W206_IMG_6744.jpg', N'EXTERIOR'),
      (N'51S0029', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mercedes-Benz_W206_IMG_6745.jpg/800px-Mercedes-Benz_W206_IMG_6745.jpg', N'EXTERIOR'),
      (N'51S0029', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mercedes-Benz_W206_interior_IMG_6746.jpg/800px-Mercedes-Benz_W206_interior_IMG_6746.jpg', N'INTERIOR'),
      (N'51S0029', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mercedes-Benz_W206_cabin.jpg/800px-Mercedes-Benz_W206_cabin.jpg', N'INTERIOR'),
      (N'51R0030', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', N'EXTERIOR'),
      (N'51R0030', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mercedes-Benz_W206_IMG_6744.jpg/800px-Mercedes-Benz_W206_IMG_6744.jpg', N'EXTERIOR'),
      (N'51R0030', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mercedes-Benz_W206_IMG_6745.jpg/800px-Mercedes-Benz_W206_IMG_6745.jpg', N'EXTERIOR'),
      (N'51R0030', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mercedes-Benz_W206_interior_IMG_6746.jpg/800px-Mercedes-Benz_W206_interior_IMG_6746.jpg', N'INTERIOR'),
      (N'51R0030', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mercedes-Benz_W206_cabin.jpg/800px-Mercedes-Benz_W206_cabin.jpg', N'INTERIOR'),
      (N'51S0030', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg', N'EXTERIOR'),
      (N'51S0030', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mercedes-Benz_W206_IMG_6744.jpg/800px-Mercedes-Benz_W206_IMG_6744.jpg', N'EXTERIOR'),
      (N'51S0030', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mercedes-Benz_W206_IMG_6745.jpg/800px-Mercedes-Benz_W206_IMG_6745.jpg', N'EXTERIOR'),
      (N'51S0030', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mercedes-Benz_W206_interior_IMG_6746.jpg/800px-Mercedes-Benz_W206_interior_IMG_6746.jpg', N'INTERIOR'),
      (N'51S0030', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mercedes-Benz_W206_cabin.jpg/800px-Mercedes-Benz_W206_cabin.jpg', N'INTERIOR'),
      (N'51R0031', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', N'EXTERIOR'),
      (N'51R0031', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mercedes-Benz_W213_IMG_3528.jpg/800px-Mercedes-Benz_W213_IMG_3528.jpg', N'EXTERIOR'),
      (N'51R0031', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mercedes-Benz_W213_IMG_3529.jpg/800px-Mercedes-Benz_W213_IMG_3529.jpg', N'EXTERIOR'),
      (N'51R0031', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mercedes-Benz_W213_interior.jpg/800px-Mercedes-Benz_W213_interior.jpg', N'INTERIOR'),
      (N'51R0031', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mercedes-Benz_W213_cabin.jpg/800px-Mercedes-Benz_W213_cabin.jpg', N'INTERIOR'),
      (N'51S0031', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', N'EXTERIOR'),
      (N'51S0031', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mercedes-Benz_W213_IMG_3528.jpg/800px-Mercedes-Benz_W213_IMG_3528.jpg', N'EXTERIOR'),
      (N'51S0031', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mercedes-Benz_W213_IMG_3529.jpg/800px-Mercedes-Benz_W213_IMG_3529.jpg', N'EXTERIOR'),
      (N'51S0031', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mercedes-Benz_W213_interior.jpg/800px-Mercedes-Benz_W213_interior.jpg', N'INTERIOR'),
      (N'51S0031', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mercedes-Benz_W213_cabin.jpg/800px-Mercedes-Benz_W213_cabin.jpg', N'INTERIOR'),
      (N'51R0032', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'EXTERIOR'),
      (N'51R0032', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg', N'EXTERIOR'),
      (N'51R0032', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg', N'EXTERIOR'),
      (N'51R0032', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg', N'INTERIOR'),
      (N'51R0032', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg', N'INTERIOR'),
      (N'51S0032', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'EXTERIOR'),
      (N'51S0032', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg', N'EXTERIOR'),
      (N'51S0032', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg', N'EXTERIOR'),
      (N'51S0032', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg', N'INTERIOR'),
      (N'51S0032', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg', N'INTERIOR'),
      (N'51R0033', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'EXTERIOR'),
      (N'51R0033', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg', N'EXTERIOR'),
      (N'51R0033', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg', N'EXTERIOR'),
      (N'51R0033', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg', N'INTERIOR'),
      (N'51R0033', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg', N'INTERIOR'),
      (N'51S0033', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'EXTERIOR'),
      (N'51S0033', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg', N'EXTERIOR'),
      (N'51S0033', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg', N'EXTERIOR'),
      (N'51S0033', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg', N'INTERIOR'),
      (N'51S0033', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg', N'INTERIOR'),
      (N'51R0034', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'EXTERIOR'),
      (N'51R0034', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg', N'EXTERIOR'),
      (N'51R0034', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg', N'EXTERIOR'),
      (N'51R0034', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg', N'INTERIOR'),
      (N'51R0034', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg', N'INTERIOR'),
      (N'51S0034', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg', N'EXTERIOR'),
      (N'51S0034', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg', N'EXTERIOR'),
      (N'51S0034', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg', N'EXTERIOR'),
      (N'51S0034', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg', N'INTERIOR'),
      (N'51S0034', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg', N'INTERIOR'),
      (N'51R0035', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', N'EXTERIOR'),
      (N'51R0035', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mercedes-Benz_W213_IMG_3528.jpg/800px-Mercedes-Benz_W213_IMG_3528.jpg', N'EXTERIOR'),
      (N'51R0035', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mercedes-Benz_W213_IMG_3529.jpg/800px-Mercedes-Benz_W213_IMG_3529.jpg', N'EXTERIOR'),
      (N'51R0035', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mercedes-Benz_W213_interior.jpg/800px-Mercedes-Benz_W213_interior.jpg', N'INTERIOR'),
      (N'51R0035', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mercedes-Benz_W213_cabin.jpg/800px-Mercedes-Benz_W213_cabin.jpg', N'INTERIOR'),
      (N'51S0035', 1, N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg', N'EXTERIOR'),
      (N'51S0035', 2, N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mercedes-Benz_W213_IMG_3528.jpg/800px-Mercedes-Benz_W213_IMG_3528.jpg', N'EXTERIOR'),
      (N'51S0035', 3, N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mercedes-Benz_W213_IMG_3529.jpg/800px-Mercedes-Benz_W213_IMG_3529.jpg', N'EXTERIOR'),
      (N'51S0035', 4, N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mercedes-Benz_W213_interior.jpg/800px-Mercedes-Benz_W213_interior.jpg', N'INTERIOR'),
      (N'51S0035', 5, N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mercedes-Benz_W213_cabin.jpg/800px-Mercedes-Benz_W213_cabin.jpg', N'INTERIOR')
) AS src([plate], [sort_order], [image_url], [image_type])
JOIN [dbo].[cars] c ON c.[plate] = src.[plate];
END
GO

SET NOCOUNT OFF;
GO
