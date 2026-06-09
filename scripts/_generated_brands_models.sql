/* Brands & models — generated from car-catalog.json */
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Audi')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Audi', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'BMW')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'BMW', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Ford')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Ford', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Honda')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Honda', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Hyundai')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Hyundai', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Kia')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Kia', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Lexus')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Lexus', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Mazda')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Mazda', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Mercedes-Benz', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Mitsubishi')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Mitsubishi', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Nissan')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Nissan', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'Toyota')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'Toyota', NULL);
IF NOT EXISTS (SELECT 1 FROM [dbo].[brands] WHERE [name] = N'VinFast')
    INSERT INTO [dbo].[brands] ([created_date], [name], [logo_path])
    VALUES (CAST(GETDATE() AS DATE), N'VinFast', NULL);
GO
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF 3 Plus')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF 3 Plus', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF 5 Plus')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF 5 Plus', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF 8 Eco')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF 8 Eco', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'VinFast' AND m.[name] = N'VF 9 Eco')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'VF 9 Eco', [id] FROM [dbo].[brands] WHERE [name] = N'VinFast';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Vios 1.5G CVT')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Vios 1.5G CVT', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Corolla Cross 1.8V Hybrid')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Corolla Cross 1.8V Hybrid', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Camry 2.5Q')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Camry 2.5Q', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Fortuner 2.4AT 4x2')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Fortuner 2.4AT 4x2', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Toyota' AND m.[name] = N'Innova Cross 2.0G')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Innova Cross 2.0G', [id] FROM [dbo].[brands] WHERE [name] = N'Toyota';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Honda' AND m.[name] = N'City RS')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'City RS', [id] FROM [dbo].[brands] WHERE [name] = N'Honda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Honda' AND m.[name] = N'Civic RS e:HEV')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Civic RS e:HEV', [id] FROM [dbo].[brands] WHERE [name] = N'Honda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Honda' AND m.[name] = N'CR-V L')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'CR-V L', [id] FROM [dbo].[brands] WHERE [name] = N'Honda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Honda' AND m.[name] = N'HR-V G')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'HR-V G', [id] FROM [dbo].[brands] WHERE [name] = N'Honda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mazda' AND m.[name] = N'Mazda3 2.0 Luxury')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Mazda3 2.0 Luxury', [id] FROM [dbo].[brands] WHERE [name] = N'Mazda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mazda' AND m.[name] = N'CX-5 Premium')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'CX-5 Premium', [id] FROM [dbo].[brands] WHERE [name] = N'Mazda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mazda' AND m.[name] = N'CX-30 Premium')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'CX-30 Premium', [id] FROM [dbo].[brands] WHERE [name] = N'Mazda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mazda' AND m.[name] = N'BT-50 4x4 AT')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'BT-50 4x4 AT', [id] FROM [dbo].[brands] WHERE [name] = N'Mazda';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Hyundai' AND m.[name] = N'Tucson 2.0 MPI')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Tucson 2.0 MPI', [id] FROM [dbo].[brands] WHERE [name] = N'Hyundai';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Kia' AND m.[name] = N'Seltos 1.4 Turbo GT-Line')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Seltos 1.4 Turbo GT-Line', [id] FROM [dbo].[brands] WHERE [name] = N'Kia';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Kia' AND m.[name] = N'Carnival 3.5G')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Carnival 3.5G', [id] FROM [dbo].[brands] WHERE [name] = N'Kia';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mitsubishi' AND m.[name] = N'Xpander Cross 1.5 AT')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Xpander Cross 1.5 AT', [id] FROM [dbo].[brands] WHERE [name] = N'Mitsubishi';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Ford' AND m.[name] = N'Ranger Wildtrak 2.0 Bi-Turbo')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Ranger Wildtrak 2.0 Bi-Turbo', [id] FROM [dbo].[brands] WHERE [name] = N'Ford';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'BMW' AND m.[name] = N'320i Sport')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'320i Sport', [id] FROM [dbo].[brands] WHERE [name] = N'BMW';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'BMW' AND m.[name] = N'X3 xDrive20i')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'X3 xDrive20i', [id] FROM [dbo].[brands] WHERE [name] = N'BMW';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mercedes-Benz' AND m.[name] = N'C 200 AMG')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'C 200 AMG', [id] FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mercedes-Benz' AND m.[name] = N'E 200 Exclusive')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'E 200 Exclusive', [id] FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Mercedes-Benz' AND m.[name] = N'GLC 300 4MATIC')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'GLC 300 4MATIC', [id] FROM [dbo].[brands] WHERE [name] = N'Mercedes-Benz';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Audi' AND m.[name] = N'Q5 45 TFSI quattro')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Q5 45 TFSI quattro', [id] FROM [dbo].[brands] WHERE [name] = N'Audi';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Nissan' AND m.[name] = N'Almera VL')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'Almera VL', [id] FROM [dbo].[brands] WHERE [name] = N'Nissan';
IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'Lexus' AND m.[name] = N'NX 350')
    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])
    SELECT CAST(GETDATE() AS DATE), N'NX 350', [id] FROM [dbo].[brands] WHERE [name] = N'Lexus';
GO
