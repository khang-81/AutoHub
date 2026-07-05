#!/usr/bin/env bash
# order-tables-detail.sh — chi tiet day du bang rentals & sale_orders (don moi nhat hoac theo id).
# Usage:
#   bash deploy/scripts/order-tables-detail.sh           # don thue + don mua moi nhat
#   bash deploy/scripts/order-tables-detail.sh 1079      # chi don thue #1079
#   bash deploy/scripts/order-tables-detail.sh 1079 3002 # don thue #1079 + don mua #3002
set -euo pipefail
REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${REPO_DIR}"

RENTAL_ID="${1:-}"
SALE_ID="${2:-}"

if [[ -z "${RENTAL_ID}" && -z "${SALE_ID}" ]]; then
  RENTAL_ID=$(docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -h -1 -W -Q "SET NOCOUNT ON; USE autohub; SELECT MAX(id) FROM rentals;"' | tr -d '\r' | grep -E '^[0-9]+$' | head -1)
  SALE_ID=$(docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -h -1 -W -Q "SET NOCOUNT ON; USE autohub; SELECT MAX(id) FROM sale_orders;"' | tr -d '\r' | grep -E '^[0-9]+$' | head -1)
elif [[ -n "${RENTAL_ID}" && -z "${SALE_ID}" ]]; then
  SALE_ID=""
fi

SQL_FILE="/tmp/order-tables-detail.sql"
cat > "${SQL_FILE}" <<'HDR'
USE autohub;
SET NOCOUNT ON;
HDR

if [[ -n "${RENTAL_ID}" ]]; then
  cat >> "${SQL_FILE}" <<EOF
PRINT '========== BANG RENTALS — DON #${RENTAL_ID} ==========';
SELECT r.*
FROM rentals r WHERE r.id = ${RENTAL_ID};
GO
PRINT '--- Thong tin khach + xe (rental) ---';
SELECT
  u.id AS user_id, u.email, u.full_name, u.phone, u.kyc_status,
  c.id AS car_id, b.name AS brand, m.name AS model,
  c.plate, c.model_year, c.daily_price, c.service_city
FROM rentals r
JOIN users u ON u.id = r.user_id
JOIN cars c ON c.id = r.car_id
JOIN models m ON m.id = c.model_id
JOIN brands b ON b.id = m.brand_id
WHERE r.id = ${RENTAL_ID};
GO
PRINT '--- Hoa don (rental) ---';
SELECT i.* FROM invoices i WHERE i.rental_id = ${RENTAL_ID};
GO
EOF
fi

if [[ -n "${SALE_ID}" ]]; then
  cat >> "${SQL_FILE}" <<EOF
PRINT '';
PRINT '========== BANG SALE_ORDERS — DON #${SALE_ID} ==========';
SELECT s.*
FROM sale_orders s WHERE s.id = ${SALE_ID};
GO
PRINT '--- Thong tin khach + xe (sale) ---';
SELECT
  u.id AS user_id, u.email, u.full_name, u.phone, u.kyc_status,
  c.id AS car_id, b.name AS brand, m.name AS model,
  c.plate, c.model_year, c.sale_price, c.sale_status, c.service_city
FROM sale_orders s
JOIN users u ON u.id = s.user_id
JOIN cars c ON c.id = s.car_id
JOIN models m ON m.id = c.model_id
JOIN brands b ON b.id = m.brand_id
WHERE s.id = ${SALE_ID};
GO
PRINT '--- Hoa don (sale) ---';
SELECT i.* FROM invoices i WHERE i.sale_order_id = ${SALE_ID};
GO
EOF
fi

docker compose cp "${SQL_FILE}" sqlserver:/tmp/order-tables-detail.sql
docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -i /tmp/order-tables-detail.sql'
rm -f "${SQL_FILE}"
