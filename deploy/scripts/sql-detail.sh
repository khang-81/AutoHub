#!/usr/bin/env bash
# sql-detail.sh — truy van chi tiet bang rentals & sale_orders (chay trong bash VPS).
# Usage:
#   bash deploy/scripts/sql-detail.sh
#   bash deploy/scripts/sql-detail.sh rental
#   bash deploy/scripts/sql-detail.sh sale
set -euo pipefail
REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${REPO_DIR}"

MODE="${1:-all}"
SQL_FILE="/tmp/sql-detail.sql"

cat > "${SQL_FILE}" <<'EOF'
USE autohub;
SET NOCOUNT ON;
EOF

if [[ "${MODE}" == "rental" || "${MODE}" == "rent" || "${MODE}" == "thue" || "${MODE}" == "all" ]]; then
  cat >> "${SQL_FILE}" <<'EOF'
PRINT '=== RENTALS — DON MOI NHAT (SELECT *) ===';
SELECT TOP 1 * FROM rentals ORDER BY id DESC;
GO
PRINT '';
PRINT '=== RENTALS — KEM KHACH + XE ===';
SELECT TOP 1
  r.id, r.created_date, r.start_date, r.end_date, r.return_date,
  u.email, u.full_name, u.phone,
  b.name + ' ' + m.name AS car_name, c.plate, c.model_year,
  r.rental_status, r.payment_status, r.payment_method,
  r.total_price, r.deposit_amount, r.deposit_status,
  r.balance_due_at_return, r.pickup_district, r.insurance_code,
  r.start_kilometer, r.end_kilometer, r.allowed_kilometers
FROM rentals r
JOIN users u ON u.id = r.user_id
JOIN cars c ON c.id = r.car_id
JOIN models m ON m.id = c.model_id
JOIN brands b ON b.id = m.brand_id
ORDER BY r.id DESC;
GO
EOF
fi

if [[ "${MODE}" == "sale" || "${MODE}" == "mua" || "${MODE}" == "all" ]]; then
  cat >> "${SQL_FILE}" <<'EOF'
PRINT '';
PRINT '=== SALE_ORDERS — DON MOI NHAT (SELECT *) ===';
SELECT TOP 1 * FROM sale_orders ORDER BY id DESC;
GO
PRINT '';
PRINT '=== SALE_ORDERS — KEM KHACH + XE ===';
SELECT TOP 1
  s.id, s.created_date,
  u.email, u.full_name, u.phone,
  b.name + ' ' + m.name AS car_name, c.plate, c.model_year,
  c.sale_price, c.sale_status,
  s.order_status, s.payment_status, s.payment_method,
  s.total_price, s.promotion_code, s.discount_amount
FROM sale_orders s
JOIN users u ON u.id = s.user_id
JOIN cars c ON c.id = s.car_id
JOIN models m ON m.id = c.model_id
JOIN brands b ON b.id = m.brand_id
ORDER BY s.id DESC;
GO
EOF
fi

docker compose cp "${SQL_FILE}" sqlserver:/tmp/sql-detail.sql
docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -i /tmp/sql-detail.sql'
rm -f "${SQL_FILE}"
