-- Đồng bộ tài khoản / mật khẩu demo với seed hiện tại (admin@autohub.id.vn, user@..., corp@... + admin123@).
-- Dùng khi VPS đã có DB cũ (vd. admin@autohub.local) và db-init bỏ qua vì đã có bảng roles.
-- Giả định V3 đã chạy: cột token_version, enabled có DEFAULT (INSERT tối thiểu vẫn hợp lệ).

SET NOCOUNT ON;

IF OBJECT_ID(N'dbo.users', N'U') IS NULL OR OBJECT_ID(N'dbo.roles', N'U') IS NULL
    OR OBJECT_ID(N'dbo.users_roles', N'U') IS NULL
BEGIN
    RETURN;
END;

IF NOT EXISTS (SELECT 1 FROM [dbo].[roles] WHERE [name] = N'admin')
    INSERT INTO [dbo].[roles] ([name]) VALUES (N'admin');

IF NOT EXISTS (SELECT 1 FROM [dbo].[roles] WHERE [name] = N'user')
    INSERT INTO [dbo].[roles] ([name]) VALUES (N'user');

DECLARE @pwd NVARCHAR(255) = N'$2b$10$bqBMqaSpBHVrUJmlzVTDbeVb/eoFx4F5qzPJJn0YwISSF6TFCc7V2';

UPDATE [dbo].[users]
SET [password] = @pwd
WHERE [email] IN (
    N'admin@autohub.local',
    N'user@autohub.local',
    N'corp@autohub.local',
    N'admin@autohub.id.vn',
    N'user@autohub.id.vn',
    N'corp@autohub.id.vn'
);

IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE [email] = N'admin@autohub.id.vn')
    INSERT INTO [dbo].[users] ([created_date], [email], [password], [kyc_status])
    VALUES (CAST(GETDATE() AS DATE), N'admin@autohub.id.vn', @pwd, N'APPROVED');

IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE [email] = N'user@autohub.id.vn')
    INSERT INTO [dbo].[users] ([created_date], [email], [password], [kyc_status])
    VALUES (CAST(GETDATE() AS DATE), N'user@autohub.id.vn', @pwd, N'APPROVED');

IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE [email] = N'corp@autohub.id.vn')
    INSERT INTO [dbo].[users] ([created_date], [email], [password], [kyc_status])
    VALUES (CAST(GETDATE() AS DATE), N'corp@autohub.id.vn', @pwd, N'APPROVED');

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
