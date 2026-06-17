#!/usr/bin/env bash
# order-detail.sh — chi tiet don thue / don mua theo id.
# Usage: bash deploy/scripts/order-detail.sh <rental_id> <sale_order_id>
set -euo pipefail
RENTAL_ID="${1:-1078}"
SALE_ID="${2:-3002}"
REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${REPO_DIR}"

SQL_FILE="/tmp/order-detail.sql"
cat > "${SQL_FILE}" <<EOF
USE autohub;
GO
PRINT '========== DON THUE #${RENTAL_ID} ==========';
SELECT
  r.id, r.created_date, r.updated_date,
  u.id AS user_id, u.email, u.full_name, u.phone, u.kyc_status,
  r.car_id, b.name AS brand, m.name AS model, c.plate, c.model_year, c.daily_price,
  c.service_city, c.seats, c.transmission, c.fuel_type,
  r.start_date, r.end_date, r.return_date,
  r.rental_status, r.payment_status, r.payment_method,
  r.total_price, r.deposit_amount, r.deposit_status,
  r.insurance_code, r.insurance_fee_amount,
  r.addon_codes, r.addon_fee_amount, r.extra_fees_amount,
  r.pickup_district, r.promotion_code, r.discount_amount,
  r.start_kilometer, r.end_kilometer, r.allowed_kilometers,
  r.late_fee_amount, r.return_additional_fees, r.balance_due_at_return,
  r.cancelled_at, r.cancelled_by, r.cancellation_reason
FROM rentals r
JOIN users u ON u.id = r.user_id
JOIN cars c ON c.id = r.car_id
JOIN models m ON m.id = c.model_id
JOIN brands b ON b.id = m.brand_id
WHERE r.id = ${RENTAL_ID};
GO
PRINT '';
PRINT '--- Hoa don lien quan (rental) ---';
SELECT i.id, i.invoice_no, i.total_price, i.discount_rate, i.tax_rate, i.created_date
FROM invoices i
WHERE i.rental_id = ${RENTAL_ID}
ORDER BY i.id;
GO
PRINT '';
PRINT '========== DON MUA #${SALE_ID} ==========';
SELECT
  s.id, s.created_date, s.updated_date,
  u.id AS user_id, u.email, u.full_name, u.phone, u.kyc_status,
  s.car_id, b.name AS brand, m.name AS model, c.plate, c.model_year, c.sale_price, c.sale_status,
  c.service_city, c.seats, c.transmission, c.fuel_type, c.kilometer,
  s.order_status, s.payment_status, s.payment_method,
  s.total_price, s.promotion_code, s.discount_amount,
  s.cancelled_at, s.cancelled_by, s.cancellation_reason
FROM sale_orders s
JOIN users u ON u.id = s.user_id
JOIN cars c ON c.id = s.car_id
JOIN models m ON m.id = c.model_id
JOIN brands b ON b.id = m.brand_id
WHERE s.id = ${SALE_ID};
GO
PRINT '';
PRINT '--- Hoa don lien quan (sale) ---';
SELECT i.id, i.invoice_no, i.total_price, i.discount_rate, i.tax_rate, i.created_date
FROM invoices i
WHERE i.sale_order_id = ${SALE_ID}
ORDER BY i.id;
GO
EOF

docker compose cp "${SQL_FILE}" sqlserver:/tmp/order-detail.sql
docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -i /tmp/order-detail.sql -y 0'
rm -f "${SQL_FILE}"
