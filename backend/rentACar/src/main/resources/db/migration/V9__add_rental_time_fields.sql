-- V9__add_rental_time_fields.sql
-- Sprint 4: TIME precision cho overlap check (morning/afternoon split)
-- Idempotent: dùng dynamic SQL EXEC để Flyway không phân tích nhầm khi bảng rentals
-- đã có sẵn cột này (tránh Invalid column name error 207 trên SQL Server).
DECLARE @sql NVARCHAR(500);
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[rentals]') AND name = N'start_time')
  SET @sql = N'ALTER TABLE [dbo].[rentals] ADD [start_time] TIME NULL';
ELSE
  SET @sql = N'SELECT 1';
EXEC sp_executesql @sql;
DECLARE @sql2 NVARCHAR(500);
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[rentals]') AND name = N'end_time')
  SET @sql2 = N'ALTER TABLE [dbo].[rentals] ADD [end_time] TIME NULL';
ELSE
  SET @sql2 = N'SELECT 1';
EXEC sp_executesql @sql2;
UPDATE [dbo].[rentals] SET [start_time] = '09:00:00', [end_time] = '18:00:00' WHERE [start_time] IS NULL OR [end_time] IS NULL;
