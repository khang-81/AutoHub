#!/usr/bin/env bash
# query-orders.sh — xem don thue & don mua moi nhat (chay tren VPS hoac local).
# Usage: bash deploy/scripts/query-orders.sh
set -euo pipefail
REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${REPO_DIR}"

SQL_FILE="/tmp/query-orders.sql"
cat > "${SQL_FILE}" <<'EOF'
USE autohub;
GO
PRINT '=== DON THUE XE (rentals) ===';
SELECT TOP 10
  r.id, u.email, r.car_id, r.start_date, r.end_date,
  r.rental_status, r.payment_status, r.total_price, r.created_date
FROM rentals r
JOIN users u ON u.id = r.user_id
ORDER BY r.id DESC;
GO
PRINT '';
PRINT '=== DON MUA XE (sale_orders) ===';
SELECT TOP 10
  s.id, u.email, s.car_id, s.order_status, s.payment_status,
  s.total_price, s.created_date
FROM sale_orders s
JOIN users u ON u.id = s.user_id
ORDER BY s.id DESC;
GO
EOF

docker compose cp "${SQL_FILE}" sqlserver:/tmp/query-orders.sql
docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -i /tmp/query-orders.sql'
rm -f "${SQL_FILE}"
