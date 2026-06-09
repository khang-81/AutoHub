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