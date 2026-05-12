-- Align SQL Server cars table with current JPA entity fields.
IF COL_LENGTH('dbo.cars', 'version') IS NULL
BEGIN
    ALTER TABLE [dbo].[cars]
    ADD [version] BIGINT NOT NULL CONSTRAINT [DF_cars_version] DEFAULT (0);
END;

IF COL_LENGTH('dbo.cars', 'seats') IS NULL
BEGIN
    ALTER TABLE [dbo].[cars]
    ADD [seats] INT NULL;
END;

IF COL_LENGTH('dbo.cars', 'transmission') IS NULL
BEGIN
    ALTER TABLE [dbo].[cars]
    ADD [transmission] NVARCHAR(16) NULL;
END;

IF COL_LENGTH('dbo.cars', 'fuel_type') IS NULL
BEGIN
    ALTER TABLE [dbo].[cars]
    ADD [fuel_type] NVARCHAR(16) NULL;
END;

IF COL_LENGTH('dbo.cars', 'average_rating') IS NULL
BEGIN
    ALTER TABLE [dbo].[cars]
    ADD [average_rating] FLOAT NULL;
END;

IF COL_LENGTH('dbo.cars', 'review_count') IS NULL
BEGIN
    ALTER TABLE [dbo].[cars]
    ADD [review_count] INT NOT NULL CONSTRAINT [DF_cars_review_count] DEFAULT (0);
END;
