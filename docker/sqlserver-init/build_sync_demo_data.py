"""Generate sync-demo-data.sql from autohub-full-schema.sql (UTF-8)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
src = (ROOT / "autohub-full-schema.sql").read_text(encoding="utf-8")
lines = src.splitlines(keepends=True)
seed = "".join(lines[307:781])

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
    "JOIN [dbo].[cars] c ON c.[plate] = src.[plate];\n"
    "GO\n"
    "\n"
    "/* user_documents (KYC mẫu) */"
)
close_with_end = (
    "JOIN [dbo].[cars] c ON c.[plate] = src.[plate];\n"
    "END\n"
    "GO\n"
    "\n"
    "/* user_documents (KYC mẫu) */"
)

pwd_updates = (
    "IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE [email] = N'corp@autohub.id.vn')\n"
    "    INSERT INTO [dbo].[users] ([created_date], [email], [password], [kyc_status])\n"
    "    VALUES (CAST(GETDATE() AS DATE), N'corp@autohub.id.vn', @pwd, N'APPROVED');\n"
    "\n"
    "UPDATE [dbo].[users]\n"
    "SET [full_name] = N'Nguyễn Văn Minh', [phone] = N'0912345678', [birth_date] = DATEFROMPARTS(1995, 6, 15)\n"
    "WHERE [email] = N'user@autohub.id.vn' AND ([full_name] IS NULL OR [full_name] = N'');\n"
    "\n"
    "UPDATE [dbo].[users]\n"
    "SET [full_name] = N'Quản trị AutoHub', [phone] = N'0329248087'\n"
    "WHERE [email] = N'admin@autohub.id.vn' AND ([full_name] IS NULL OR [full_name] = N'');\n"
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
    "\n"
    "UPDATE [dbo].[users]\n"
    "SET [full_name] = N'Nguyễn Văn Minh', [phone] = N'0912345678', [birth_date] = DATEFROMPARTS(1995, 6, 15)\n"
    "WHERE [email] = N'user@autohub.id.vn' AND ([full_name] IS NULL OR [full_name] = N'');\n"
    "\n"
    "UPDATE [dbo].[users]\n"
    "SET [full_name] = N'Quản trị AutoHub', [phone] = N'0329248087'\n"
    "WHERE [email] = N'admin@autohub.id.vn' AND ([full_name] IS NULL OR [full_name] = N'');\n"
    "GO\n"
)
if close_before_kyc not in seed:
    raise SystemExit("close_before_kyc not found")
seed = seed.replace(close_before_kyc, close_with_end, 1)

# GO giữa INSERT cars và gallery làm BEGIN/END catalog bị tách batch — bỏ GO đó.
cars_gallery_split = (
    "JOIN [dbo].[colors] c ON c.[name] = N'Trắng';\n"
    "GO\n"
    "\n"
    "/* Gallery 5 anh / xe (3 ngoai + 2 noi that) */\n"
)
cars_gallery_joined = (
    "JOIN [dbo].[colors] c ON c.[name] = N'Trắng';\n"
    "\n"
    "/* Gallery 5 anh / xe (3 ngoai + 2 noi that) */\n"
)
if cars_gallery_split not in seed:
    raise SystemExit("cars_gallery_split not found")
seed = seed.replace(cars_gallery_split, cars_gallery_joined, 1)

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

gallery_marker = "/* Gallery 5 anh / xe (3 ngoai + 2 noi that) */\n"
gallery_tail = "JOIN [dbo].[cars] c ON c.[plate] = src.[plate];\n"
gidx = seed.find(gallery_marker)
if gidx == -1:
    raise SystemExit("gallery_marker not found")
gend = seed.find(gallery_tail, gidx)
if gend == -1:
    raise SystemExit("gallery_tail not found")
gallery_sql = seed[gidx : gend + len(gallery_tail)]
gallery_backfill = (
    "/* Gallery backfill: DB cu da co 30 xe nhung chua co car_images */\n"
    "IF NOT EXISTS (SELECT 1 FROM [dbo].[car_images])\n"
    "   AND EXISTS (SELECT 1 FROM [dbo].[cars] WHERE [plate] = N'51R0001')\n"
    "BEGIN\n"
    + gallery_sql
    + "END\n"
    "GO\n"
)
seed = seed + "\n" + gallery_backfill

footer = "\nSET NOCOUNT OFF;\nGO\n"
(ROOT / "sync-demo-data.sql").write_text(header + seed + footer, encoding="utf-8")
print("OK ->", ROOT / "sync-demo-data.sql")
