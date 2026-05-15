/*
  Dong bo demo data khop local (accounts + 30 xe + don mau).
  Chay khi VPS da co schema cu — db-init bo qua full seed.
*/
USE [autohub];
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
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
SET [password] = @pwd
WHERE [email] IN (
    N'admin@autohub.local', N'user@autohub.local', N'corp@autohub.local',
    N'admin@autohub.id.vn', N'user@autohub.id.vn', N'corp@autohub.id.vn'
);
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

/* Catalog demo: reset neu chua co 30 xe mau (bien so 51R0001..51S0030) */
IF NOT EXISTS (SELECT 1 FROM [dbo].[cars] WHERE [plate] = N'51R0001')
   OR (SELECT COUNT(*) FROM [dbo].[cars]) < 30
BEGIN
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
(N'51R0001', 2023, 500, 10100, 805000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=1', N'VinFast', N'VF 3'),
      (N'51S0002', 2023, 500, 0, 0.0, N'SALE_ONLY', 452000000.0, N'SOLD', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=2', N'VinFast', N'VF 3'),
      (N'51R0003', 2023, 500, 10300, 815000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=3', N'VinFast', N'VF 8'),
      (N'51S0004', 2023, 500, 0, 0.0, N'SALE_ONLY', 454000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=4', N'VinFast', N'VF 8'),
      (N'51R0005', 2023, 500, 10500, 825000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=5', N'VinFast', N'VF 9'),
      (N'51S0006', 2023, 500, 0, 0.0, N'SALE_ONLY', 456000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=6', N'VinFast', N'VF 9'),
      (N'51R0007', 2023, 500, 10700, 835000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=7', N'Toyota', N'Camry'),
      (N'51S0008', 2023, 500, 0, 0.0, N'SALE_ONLY', 458000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=8', N'Toyota', N'Camry'),
      (N'51R0009', 2023, 500, 10900, 845000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=9', N'Toyota', N'Corolla Cross'),
      (N'51S0010', 2023, 500, 0, 0.0, N'SALE_ONLY', 460000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=10', N'Toyota', N'Corolla Cross'),
      (N'51R0011', 2023, 500, 11100, 855000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=11', N'Toyota', N'Fortuner'),
      (N'51S0012', 2023, 500, 0, 0.0, N'SALE_ONLY', 462000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=12', N'Toyota', N'Fortuner'),
      (N'51R0013', 2023, 500, 11300, 865000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=13', N'Honda', N'City'),
      (N'51S0014', 2023, 500, 0, 0.0, N'SALE_ONLY', 464000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=14', N'Honda', N'City'),
      (N'51R0015', 2023, 500, 11500, 875000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=15', N'Honda', N'Civic'),
      (N'51S0016', 2023, 500, 0, 0.0, N'SALE_ONLY', 466000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=16', N'Honda', N'Civic'),
      (N'51R0017', 2023, 500, 11700, 885000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=17', N'Honda', N'CR-V'),
      (N'51S0018', 2023, 500, 0, 0.0, N'SALE_ONLY', 468000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=18', N'Honda', N'CR-V'),
      (N'51R0019', 2023, 500, 11900, 895000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=19', N'Mazda', N'Mazda3'),
      (N'51S0020', 2023, 500, 0, 0.0, N'SALE_ONLY', 470000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=20', N'Mazda', N'Mazda3'),
      (N'51R0021', 2023, 500, 12100, 905000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=21', N'Mazda', N'CX-5'),
      (N'51S0022', 2023, 500, 0, 0.0, N'SALE_ONLY', 472000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=22', N'Mazda', N'CX-5'),
      (N'51R0023', 2023, 500, 12300, 915000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=23', N'Mazda', N'BT-50'),
      (N'51S0024', 2023, 500, 0, 0.0, N'SALE_ONLY', 474000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=24', N'Mazda', N'BT-50'),
      (N'51R0025', 2023, 500, 12500, 925000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=25', N'Mercedes-Benz', N'C-Class'),
      (N'51S0026', 2023, 500, 0, 0.0, N'SALE_ONLY', 476000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=26', N'Mercedes-Benz', N'C-Class'),
      (N'51R0027', 2023, 500, 12700, 935000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=27', N'Mercedes-Benz', N'E-Class'),
      (N'51S0028', 2023, 500, 0, 0.0, N'SALE_ONLY', 478000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=28', N'Mercedes-Benz', N'E-Class'),
      (N'51R0029', 2023, 500, 12900, 945000.0, N'RENT_ONLY', NULL, NULL, N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=29', N'Mercedes-Benz', N'GLC'),
      (N'51S0030', 2023, 500, 0, 0.0, N'SALE_ONLY', 480000000.0, N'AVAILABLE', N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=30', N'Mercedes-Benz', N'GLC')
) AS src(plate, model_year, min_findeks_rate, kilometer, daily_price, listing_type, sale_price, sale_status, image_path, brand_name, model_name)
JOIN [dbo].[brands] b ON b.[name] = src.brand_name
JOIN [dbo].[models] m ON m.[brand_id] = b.[id] AND m.[name] = src.model_name
JOIN [dbo].[colors] c ON c.[name] = N'Trắng';
END
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
            CAST(GETDATE() AS DATE), 452000000, N'BANK_TRANSFER', N'PAID', N'COMPLETED',
            @carSold, @uidBuyer
        );
        DECLARE @saleId INT = SCOPE_IDENTITY();
        INSERT INTO [dbo].[invoices] ([created_date], [invoice_no], [total_price], [discount_rate], [tax_rate], [rental_id], [sale_order_id])
        VALUES (CAST(GETDATE() AS DATE), N'INV-SALE-DEMO-001', 452000000, 0, 10, NULL, @saleId);
    END
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[viewing_appointments])
BEGIN
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
END
GO

SET NOCOUNT OFF;
GO
