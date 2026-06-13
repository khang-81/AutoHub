# backup-uploads.ps1 — archive /app/uploads from local API container.
# Usage: .\deploy\scripts\backup-uploads.ps1
# Output: .\backups\uploads-YYYY-MM-DD-HHMM.tar.gz

$ErrorActionPreference = "Stop"
$RepoDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $RepoDir

$Stamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$BackupDir = Join-Path $RepoDir "backups"
$Archive = Join-Path $BackupDir "uploads-$Stamp.tar.gz"
$ContainerArchive = "/tmp/uploads-$Stamp.tar.gz"

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

Write-Host "==> Archive uploads inside api container"
docker compose exec -T api sh -c "cd /app/uploads && tar czf '$ContainerArchive' ."
docker compose cp "api:$ContainerArchive" $Archive
docker compose exec -T api sh -c "rm -f '$ContainerArchive'"

Write-Host "Uploads archive OK: $Archive"
