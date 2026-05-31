"""Generate sync-demo-data.sql from autohub-full-schema.sql (UTF-8)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
src = (ROOT / "autohub-full-schema.sql").read_text(encoding="utf-8")
lines = src.splitlines(keepends=True)
seed = "".join(lines[291:597])

header = """/*
  Dong bo demo data khop local (accounts + 30 xe + don mau).
  Chay khi VPS da co schema cu — db-init bo qua full seed.
*/
USE [autohub];
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
SET NOCOUNT ON;
"""

catalog_marker = (
    "/* Xe mẫu: VinFast, Toyota, Honda, Mazda, Mercedes-Benz — 5 thương hiệu × 3 model × (1 thuê + 1 mua); màu Trắng. */\n"
    "DELETE FROM [dbo].[viewing_appointments];"
)
catalog_open = (
    "/* Catalog demo: reset neu chua co 30 xe mau (bien so 51R0001..51S0030) */\n"
    "IF NOT EXISTS (SELECT 1 FROM [dbo].[cars] WHERE [plate] = N'51R0001')\n"
    "   OR (SELECT COUNT(*) FROM [dbo].[cars]) < 30\n"
    "BEGIN\n"
    "DELETE FROM [dbo].[viewing_appointments];"
)
if catalog_marker not in seed:
    raise SystemExit("catalog_marker not found")
seed = seed.replace(catalog_marker, catalog_open, 1)

close_before_kyc = (
    "JOIN [dbo].[colors] c ON c.[name] = N'Trắng';\n"
    "GO\n"
    "\n"
    "/* user_documents"
)
close_with_end = (
    "JOIN [dbo].[colors] c ON c.[name] = N'Trắng';\n"
    "END\n"
    "GO\n"
    "\n"
    "/* user_documents"
)

pwd_updates = (
    "IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE [email] = N'corp@autohub.id.vn')\n"
    "    INSERT INTO [dbo].[users] ([created_date], [email], [password], [kyc_status])\n"
    "    VALUES (CAST(GETDATE() AS DATE), N'corp@autohub.id.vn', @pwd, N'APPROVED');\n"
    "GO\n"
)
pwd_updates_new = (
    "IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE [email] = N'corp@autohub.id.vn')\n"
    "    INSERT INTO [dbo].[users] ([created_date], [email], [password], [kyc_status])\n"
    "    VALUES (CAST(GETDATE() AS DATE), N'corp@autohub.id.vn', @pwd, N'APPROVED');\n"
    "\n"
    "UPDATE [dbo].[users]\n"
    "SET [password] = @pwd\n"
    "WHERE [email] IN (\n"
    "    N'admin@autohub.local', N'user@autohub.local', N'corp@autohub.local',\n"
    "    N'admin@autohub.id.vn', N'user@autohub.id.vn', N'corp@autohub.id.vn'\n"
    ");\n"
    "GO\n"
)
if close_before_kyc not in seed:
    raise SystemExit("close_before_kyc not found")
seed = seed.replace(close_before_kyc, close_with_end, 1)

if pwd_updates not in seed:
    raise SystemExit("pwd_updates block not found")
seed = seed.replace(pwd_updates, pwd_updates_new, 1)

roles_extra = (
    "INSERT INTO [dbo].[users_roles] ([user_id], [role_id])\n"
    "SELECT u.[id], r.[id]\n"
    "FROM [dbo].[users] u\n"
    "CROSS JOIN [dbo].[roles] r\n"
    "WHERE u.[email] = N'corp@autohub.id.vn' AND r.[name] = N'user'\n"
    "  AND NOT EXISTS (SELECT 1 FROM [dbo].[users_roles] ur WHERE ur.[user_id] = u.[id] AND ur.[role_id] = r.[id]);\n"
    "GO\n"
)
roles_extra_new = roles_extra + (
    "INSERT INTO [dbo].[users_roles] ([user_id], [role_id])\n"
    "SELECT u.[id], r.[id]\n"
    "FROM [dbo].[users] u\n"
    "CROSS JOIN [dbo].[roles] r\n"
    "WHERE u.[email] = N'admin@autohub.local' AND r.[name] = N'admin'\n"
    "  AND NOT EXISTS (SELECT 1 FROM [dbo].[users_roles] ur WHERE ur.[user_id] = u.[id] AND ur.[role_id] = r.[id]);\n"
    "\n"
    "INSERT INTO [dbo].[users_roles] ([user_id], [role_id])\n"
    "SELECT u.[id], r.[id]\n"
    "FROM [dbo].[users] u\n"
    "CROSS JOIN [dbo].[roles] r\n"
    "WHERE u.[email] = N'user@autohub.local' AND r.[name] = N'user'\n"
    "  AND NOT EXISTS (SELECT 1 FROM [dbo].[users_roles] ur WHERE ur.[user_id] = u.[id] AND ur.[role_id] = r.[id]);\n"
    "\n"
    "INSERT INTO [dbo].[users_roles] ([user_id], [role_id])\n"
    "SELECT u.[id], r.[id]\n"
    "FROM [dbo].[users] u\n"
    "CROSS JOIN [dbo].[roles] r\n"
    "WHERE u.[email] = N'corp@autohub.local' AND r.[name] = N'user'\n"
    "  AND NOT EXISTS (SELECT 1 FROM [dbo].[users_roles] ur WHERE ur.[user_id] = u.[id] AND ur.[role_id] = r.[id]);\n"
    "GO\n"
)
if roles_extra not in seed:
    raise SystemExit("roles_extra block not found")
seed = seed.replace(roles_extra, roles_extra_new, 1)

view_marker = "/* Lịch xem xe mẫu"
idx = seed.find(view_marker)
if idx == -1:
    raise SystemExit("view_marker not found")
# find GO after viewing block (last GO in seed)
go_idx = seed.rfind("\nGO\n", idx)
if go_idx == -1:
    raise SystemExit("view GO not found")
view_block = seed[idx : go_idx + len("\nGO\n")]
inner = view_block.replace("\nGO\n", "\n", 1).rstrip() + "\n"
wrapped_view = (
    "IF NOT EXISTS (SELECT 1 FROM [dbo].[viewing_appointments])\n"
    "BEGIN\n"
    + inner
    + "END\n"
    "GO\n"
)
seed = seed[:idx] + wrapped_view + seed[go_idx + len("\nGO\n") :]

footer = "\nSET NOCOUNT OFF;\nGO\n"
(ROOT / "sync-demo-data.sql").write_text(header + seed + footer, encoding="utf-8")
print("OK ->", ROOT / "sync-demo-data.sql")
