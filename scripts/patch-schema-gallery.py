from pathlib import Path

root = Path(__file__).resolve().parent.parent / "docker" / "sqlserver-init"
schema = root / "autohub-full-schema.sql"
gallery = (Path(__file__).resolve().parent / "seed-car-images.sql").read_text(encoding="utf-8")
insert_block = "\n".join(gallery.splitlines()[4:])
text = schema.read_text(encoding="utf-8")
marker = "JOIN [dbo].[colors] c ON c.[name] = N'Trắng';\nGO\n\n/* user_documents (KYC mẫu) */"
replacement = (
    "JOIN [dbo].[colors] c ON c.[name] = N'Trắng';\nGO\n\n"
    "/* Gallery 5 anh / xe (3 ngoai + 2 noi that) */\n"
    + insert_block
    + "\n\n/* user_documents (KYC mẫu) */"
)
if marker not in text:
    raise SystemExit("marker not found")
schema.write_text(text.replace(marker, replacement, 1), encoding="utf-8")
print("OK")
