# latest-order.ps1 — truy van don thue hoac don mua moi nhat (Docker local).
# Usage:
#   .\deploy\scripts\latest-order.ps1
#   .\deploy\scripts\latest-order.ps1 rental
#   .\deploy\scripts\latest-order.ps1 sale

param([ValidateSet("all", "rental", "sale")][string]$Type = "all")

$ErrorActionPreference = "Stop"
$RepoDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $RepoDir

$SqlFile = Join-Path $env:TEMP "autohub-latest-order.sql"
$header = @"
USE autohub;
SET NOCOUNT ON;
"@

$rental = @'
PRINT '=== DON THUE MOI NHAT ===';
SELECT TOP 1
  r.id, u.email, u.full_name, u.phone, r.car_id,
  b.name + ' ' + m.name AS car_name, c.plate, c.model_year,
  r.start_date, r.end_date, r.return_date,
  r.rental_status, r.payment_status, r.payment_method,
  r.total_price, r.deposit_amount, r.deposit_status,
  r.balance_due_at_return, r.pickup_district, r.insurance_code, r.created_date
FROM rentals r
JOIN users u ON u.id = r.user_id
JOIN cars c ON c.id = r.car_id
JOIN models m ON m.id = c.model_id
JOIN brands b ON b.id = m.brand_id
ORDER BY r.id DESC;
GO
'@

$sale = @'
PRINT '';
PRINT '=== DON MUA MOI NHAT ===';
SELECT TOP 1
  s.id, u.email, u.full_name, u.phone, s.car_id,
  b.name + ' ' + m.name AS car_name, c.plate, c.model_year,
  c.sale_price, c.sale_status,
  s.order_status, s.payment_status, s.payment_method,
  s.total_price, s.promotion_code, s.discount_amount, s.created_date
FROM sale_orders s
JOIN users u ON u.id = s.user_id
JOIN cars c ON c.id = s.car_id
JOIN models m ON m.id = c.model_id
JOIN brands b ON b.id = m.brand_id
ORDER BY s.id DESC;
GO
'@

$content = $header
if ($Type -eq "all" -or $Type -eq "rental") { $content += "`n" + $rental }
if ($Type -eq "all" -or $Type -eq "sale")    { $content += "`n" + $sale }

Set-Content -Path $SqlFile -Value $content -Encoding ASCII
docker compose cp $SqlFile "sqlserver:/tmp/latest-order.sql"
docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -i /tmp/latest-order.sql'
Remove-Item -Force $SqlFile
