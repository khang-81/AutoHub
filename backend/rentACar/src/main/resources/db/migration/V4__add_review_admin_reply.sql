-- Backward-compatible V4: add admin reply column for reviews moderation.
IF COL_LENGTH('dbo.reviews', 'admin_reply') IS NULL
BEGIN
    ALTER TABLE [dbo].[reviews] ADD [admin_reply] NVARCHAR(2000) NULL;
END;
