# Truy vấn SQL Server (Docker) — giống mysql -e nhưng qua container.
# Usage:
#   .\scripts\db-query.ps1 -Table rentals
#   .\scripts\db-query.ps1 -Table sale_orders -Top 10
#   .\scripts\db-query.ps1 -Sql "SELECT id, email FROM users"
#
# GUI (xem bảng như MySQL Workbench): DBeaver / Azure Data Studio
#   Host: 127.0.0.1,14330 | DB: autohub | User: sa | Password: trong .env

param(
    [string]$Sql = "",
    [ValidateSet("rentals", "sale_orders", "users", "cars", "invoices", "reviews", "viewing_appointments")]
    [string]$Table = "rentals",
    [int]$Top = 20,
    [string]$Container = "rentacar-sqlserver-1",
    [string]$Database = "autohub"
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

function Get-SaPassword {
    $envFile = Join-Path $root ".env"
    if (Test-Path $envFile) {
        foreach ($line in Get-Content $envFile) {
            if ($line -match '^\s*MSSQL_SA_PASSWORD\s*=\s*(.+)\s*$') {
                return $Matches[1].Trim().Trim('"').Trim("'")
            }
        }
    }
    if ($env:MSSQL_SA_PASSWORD) {
        return $env:MSSQL_SA_PASSWORD
    }
    throw "Không tìm thấy MSSQL_SA_PASSWORD. Đặt trong file .env hoặc biến môi trường."
}

$password = Get-SaPassword

if (-not $Sql.Trim()) {
    $Sql = "SELECT TOP $Top * FROM $Table ORDER BY id DESC"
}

$running = docker ps --format "{{.Names}}" 2>$null | Select-String -SimpleMatch $Container
if (-not $running) {
    throw "Container '$Container' chưa chạy. Chạy: docker compose up -d sqlserver"
}

Write-Host "Database: $Database" -ForegroundColor Cyan
Write-Host "Query: $Sql" -ForegroundColor DarkGray
Write-Host ""

docker exec $Container /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P $password -C -d $Database `
    -Q $Sql -W -s "|"
