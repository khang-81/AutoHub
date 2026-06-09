"""Gắn models + cars vào schema; xóa đơn thuê/bán/lịch xem demo."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SCHEMA = ROOT.parent / "docker" / "sqlserver-init" / "autohub-full-schema.sql"
MODELS_SQL = ROOT / "_generated_models.sql"
CARS_BLOCK = ROOT / "_generated_cars_block.sql"

text = SCHEMA.read_text(encoding="utf-8")
models_sql = MODELS_SQL.read_text(encoding="utf-8").strip()
cars_block = CARS_BLOCK.read_text(encoding="utf-8").strip()

models_start = "/* Models */"
models_end = "GO\n\n/* Colors */"
i0 = text.index(models_start)
i1 = text.index(models_end, i0)
text = text[:i0] + models_start + "\n" + models_sql + "\n\n" + models_end + text[i1 + len(models_end) :]

cars_start = "/* Danh mục xe"
if cars_start not in text:
    cars_start = "/* Xe mẫu:"
cars_end = "\n\n/* user_documents (KYC mẫu) */"
i0 = text.index(cars_start)
i1 = text.index(cars_end, i0)
text = text[:i0] + cars_block + cars_end + text[i1 + len(cars_end) :]

# Xóa đơn thuê, đơn bán, lịch xem demo — chỉ giữ KYC tài khoản
demo_start = "/* Đơn thuê + hóa đơn + đánh giá"
if demo_start in text:
    idx0 = text.index(demo_start)
    idx1 = text.index("\nSET NOCOUNT OFF;", idx0)
    text = text[:idx0] + text[idx1:]

SCHEMA.write_text(text, encoding="utf-8")
print(f"Patched {SCHEMA} (70 xe, no demo orders)")
