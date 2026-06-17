#!/usr/bin/env bash
# latest-order.sh — truy van don thue hoac don mua moi nhat.
# Usage:
#   bash deploy/scripts/latest-order.sh          # ca hai (thue + mua)
#   bash deploy/scripts/latest-order.sh rental   # don thue moi nhat
#   bash deploy/scripts/latest-order.sh sale     # don mua moi nhat
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${REPO_DIR}"

MODE="${1:-all}"
SQL_FILE="/tmp/latest-order.sql"

show_rental() {
  cat >> "${SQL_FILE}" <<'EOF'
PRINT '=== DON THUE MOI NHAT ===';
SELECT TOP 1
  r.id,
  u.email,
  u.full_name,
  u.phone,
  r.car_id,
  b.name + ' ' + m.name AS car_name,
  c.plate,
  c.model_year,
  r.start_date,
  r.end_date,
  r.return_date,
  r.rental_status,
  r.payment_status,
  r.payment_method,
  r.total_price,
  r.deposit_amount,
  r.deposit_status,
  r.balance_due_at_return,
  r.pickup_district,
  r.insurance_code,
  r.created_date
FROM rentals r
JOIN users u ON u.id = r.user_id
JOIN cars c ON c.id = r.car_id
JOIN models m ON m.id = c.model_id
JOIN brands b ON b.id = m.brand_id
ORDER BY r.id DESC;
GO
EOF
}

show_sale() {
  cat >> "${SQL_FILE}" <<'EOF'
PRINT '';
PRINT '=== DON MUA MOI NHAT ===';
SELECT TOP 1
  s.id,
  u.email,
  u.full_name,
  u.phone,
  s.car_id,
  b.name + ' ' + m.name AS car_name,
  c.plate,
  c.model_year,
  c.sale_price,
  c.sale_status,
  s.order_status,
  s.payment_status,
  s.payment_method,
  s.total_price,
  s.promotion_code,
  s.discount_amount,
  s.created_date
FROM sale_orders s
JOIN users u ON u.id = s.user_id
JOIN cars c ON c.id = s.car_id
JOIN models m ON m.id = c.model_id
JOIN brands b ON b.id = m.brand_id
ORDER BY s.id DESC;
GO
EOF
}

cat > "${SQL_FILE}" <<'EOF'
USE autohub;
SET NOCOUNT ON;
EOF

case "${MODE}" in
  rental|rent|thue) show_rental ;;
  sale|mua|buy)     show_sale ;;
  all|*)            show_rental; show_sale ;;
esac

docker compose cp "${SQL_FILE}" sqlserver:/tmp/latest-order.sql
docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -i /tmp/latest-order.sql'
rm -f "${SQL_FILE}"
