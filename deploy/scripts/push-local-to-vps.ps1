# push-local-to-vps.ps1 — backup local, upload len VPS, restore DB + uploads.
# Usage: .\deploy\scripts\push-local-to-vps.ps1
# Env (optional): VPS_HOST, VPS_USER, VPS_REPO, SSH_KEY

$ErrorActionPreference = "Stop"
$RepoDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $RepoDir

$VpsHost = if ($env:VPS_HOST) { $env:VPS_HOST } else { "165.99.16.29" }
$VpsUser = if ($env:VPS_USER) { $env:VPS_USER } else { "khangtd" }
$VpsRepo = if ($env:VPS_REPO) { $env:VPS_REPO } else { "/opt/apps/Do_An_Deploy/AutoHub" }
$SshKey = if ($env:SSH_KEY) { $env:SSH_KEY } else { Join-Path $env:USERPROFILE ".ssh\id_ed25519_megahost" }
$Target = "${VpsUser}@${VpsHost}"
$SshArgs = @("-i", $SshKey, "-o", "StrictHostKeyChecking=accept-new", "-o", "ConnectTimeout=30")

if (-not (Test-Path $SshKey)) {
  throw "SSH key not found: $SshKey. Set SSH_KEY env or add key file."
}

Write-Host "==> [1/5] Backup DB local"
& "$PSScriptRoot\backup-db-local.ps1"
Write-Host "==> [2/5] Backup uploads local"
& "$PSScriptRoot\backup-uploads.ps1"

$LatestDb = Get-ChildItem (Join-Path $RepoDir "backups\autohub-*.bak") | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$LatestUploads = Get-ChildItem (Join-Path $RepoDir "backups\uploads-*.tar.gz") | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $LatestDb -or -not $LatestUploads) { throw "Backup files not found in backups/" }

Write-Host "==> [3/5] Upload to VPS ($Target)"
ssh @SshArgs $Target "mkdir -p $VpsRepo/backups $VpsRepo/deploy/scripts"
scp @SshArgs "$PSScriptRoot\restore-db.sh" "$PSScriptRoot\restore-uploads.sh" "${Target}:${VpsRepo}/deploy/scripts/"
scp @SshArgs $LatestDb.FullName $LatestUploads.FullName "${Target}:${VpsRepo}/backups/"

$DbName = $LatestDb.Name
$UploadsName = $LatestUploads.Name

Write-Host "==> [4/5] Restore on VPS (DB: $DbName)"
$RestoreCmd = @"
cd $VpsRepo && sed -i 's/\r$//' deploy/scripts/restore-db.sh deploy/scripts/restore-uploads.sh && chmod +x deploy/scripts/restore-db.sh deploy/scripts/restore-uploads.sh && bash deploy/scripts/restore-db.sh backups/$DbName && bash deploy/scripts/restore-uploads.sh backups/$UploadsName
"@
ssh @SshArgs $Target $RestoreCmd

Write-Host "==> [5/5] Health check"
ssh @SshArgs $Target "cd $VpsRepo && docker compose ps && curl -sS -o /dev/null -w 'api health HTTP %{http_code}`n' http://127.0.0.1:3000/api/actuator/health"

Write-Host "Done. Local data pushed to VPS."
