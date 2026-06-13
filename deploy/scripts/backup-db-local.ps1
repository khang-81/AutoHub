# backup-db-local.ps1 — dump SQL Server autohub DB to .bak (run on Windows, repo root).
# Usage: .\deploy\scripts\backup-db-local.ps1
# Output: .\backups\autohub-YYYY-MM-DD-HHMM.bak

$ErrorActionPreference = "Stop"
$RepoDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $RepoDir

$Stamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$BackupDir = Join-Path $RepoDir "backups"
$LocalBak = Join-Path $BackupDir "autohub-$Stamp.bak"
$ContainerBak = "/var/opt/mssql/backup/autohub-$Stamp.bak"
$SqlFile = Join-Path $env:TEMP "autohub-backup-$Stamp.sql"

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
Set-Content -Path $SqlFile -Value "BACKUP DATABASE autohub TO DISK='$ContainerBak' WITH INIT, COMPRESSION, FORMAT;" -Encoding ASCII

Write-Host "==> Backup database inside sqlserver container"
docker compose exec -T sqlserver bash -c "mkdir -p /var/opt/mssql/backup"
docker compose cp $SqlFile "sqlserver:/tmp/backup.sql"
docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -i /tmp/backup.sql'
Remove-Item -Force $SqlFile

Write-Host "==> Copy .bak to $LocalBak"
docker compose cp "sqlserver:$ContainerBak" $LocalBak
docker compose exec -T sqlserver bash -c "rm -f '$ContainerBak' /tmp/backup.sql"

Write-Host "Backup OK: $LocalBak"
