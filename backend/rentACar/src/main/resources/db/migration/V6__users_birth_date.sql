IF COL_LENGTH('dbo.users', 'birth_date') IS NULL
BEGIN
    ALTER TABLE [dbo].[users] ADD [birth_date] DATE NULL;
END;
