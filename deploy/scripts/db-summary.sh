#!/usr/bin/env bash
# db-summary.sh — tom tat nghiep vu chinh dang bang (VPS/local Docker).
# Usage: bash deploy/scripts/db-summary.sh
set -euo pipefail
REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${REPO_DIR}"

SQL_FILE="/tmp/db-summary.sql"
cat > "${SQL_FILE}" <<'EOF'
USE autohub;
SET NOCOUNT ON;

PRINT '=== USERS ===';
SELECT u.id, u.email, u.full_name, u.phone, u.kyc_status, u.enabled, u.created_date
FROM users u ORDER BY u.id;
GO

PRINT '=== CARS (TOP 15) ===';
SELECT c.id, b.name AS brand, m.name AS model, c.plate, c.model_year,
  c.listing_type, c.daily_price, c.sale_price, c.sale_status, c.service_city
FROM cars c
JOIN models m ON m.id = c.model_id
JOIN brands b ON b.id = m.brand_id
ORDER BY c.id;
GO

PRINT '=== RENTALS (TOP 15 moi nhat) ===';
SELECT TOP 15 r.id, u.email, r.car_id, r.start_date, r.end_date, r.return_date,
  r.rental_status, r.payment_status, r.payment_method,
  r.total_price, r.deposit_amount, r.deposit_status, r.balance_due_at_return,
  r.pickup_district, r.created_date
FROM rentals r
JOIN users u ON u.id = r.user_id
ORDER BY r.id DESC;
GO

PRINT '=== SALE ORDERS (TOP 15 moi nhat) ===';
SELECT TOP 15 s.id, u.email, s.car_id, s.order_status, s.payment_status, s.payment_method,
  s.total_price, s.promotion_code, s.discount_amount, s.created_date
FROM sale_orders s
JOIN users u ON u.id = s.user_id
ORDER BY s.id DESC;
GO

PRINT '=== INVOICES (TOP 15 moi nhat) ===';
SELECT TOP 15 i.id, i.invoice_no, i.total_price, i.tax_rate, i.rental_id, i.sale_order_id, i.created_date
FROM invoices i
ORDER BY i.id DESC;
GO

PRINT '=== REVIEWS (TOP 10) ===';
SELECT TOP 10 r.id, u.email, r.rental_id, r.sale_order_id, r.rating, LEFT(r.comment, 60) AS comment, r.created_date
FROM reviews r
JOIN users u ON u.id = r.user_id
ORDER BY r.id DESC;
GO
EOF

docker compose cp "${SQL_FILE}" sqlserver:/tmp/db-summary.sql
docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -i /tmp/db-summary.sql'
rm -f "${SQL_FILE}"
