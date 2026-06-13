# query-orders.ps1 — xem don thue & don mua trong DB local (Docker, khong can SSMS).
# Usage: .\deploy\scripts\query-orders.ps1

$ErrorActionPreference = "Stop"
$RepoDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $RepoDir

$SqlFile = Join-Path $env:TEMP "autohub-query-orders.sql"
@'
USE autohub;
GO
PRINT '=== DON THUE XE (rentals) ===';
SELECT TOP 20
  r.id,
  r.user_id,
  r.car_id,
  r.start_date,
  r.end_date,
  r.rental_status,
  r.payment_status,
  r.total_price,
  r.created_date
FROM rentals r
ORDER BY r.id DESC;

PRINT '';
PRINT '=== DON MUA XE (sale_orders) ===';
SELECT TOP 20
  s.id,
  s.user_id,
  s.car_id,
  s.order_status,
  s.payment_status,
  s.total_price,
  s.created_date
FROM sale_orders s
ORDER BY s.id DESC;
'@ | Set-Content -Path $SqlFile -Encoding ASCII

docker compose cp $SqlFile "sqlserver:/tmp/query-orders.sql"
docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -i /tmp/query-orders.sql'
Remove-Item -Force $SqlFile
