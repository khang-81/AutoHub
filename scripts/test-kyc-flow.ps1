# GPLX flow: upload CCCD+GPLX -> auto-approve (APP_KYC_AUTO_APPROVE) or admin approve -> APPROVED
# Usage: powershell -File scripts/test-kyc-flow.ps1

$ErrorActionPreference = 'Stop'
$base = if ($env:API_BASE) { $env:API_BASE } else { 'http://127.0.0.1:8088' }

function Invoke-Api {
  param([string]$Method = 'GET', [string]$Path, [hashtable]$Headers = @{}, $Body = $null)
  $params = @{ Method = $Method; Uri = "$base$Path"; Headers = $Headers; ContentType = 'application/json' }
  if ($Body) { $params.Body = ($Body | ConvertTo-Json -Compress) }
  try { return Invoke-RestMethod @params } catch {
    $r = $_.Exception.Response
    if ($r) {
      $reader = New-Object System.IO.StreamReader($r.GetResponseStream())
      throw "HTTP $($r.StatusCode.value__) $Path : $($reader.ReadToEnd())"
    }
    throw
  }
}

function Get-Token($Email, $Password, $Portal) {
  $r = Invoke-Api -Method POST -Path '/api/auth/login' -Body @{ email = $Email; password = $Password; portal = $Portal }
  if (-not $r.success) { throw $r.message }
  return $r.loginResponse.token
}

Write-Host "API: $base"

$suffix = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$testEmail = "kyc.test.$suffix@autohub.test"
$testPass = 'Test123!@#'
Write-Host "Register $testEmail"
Invoke-Api -Method POST -Path '/api/auth/register' -Body @{
  email = $testEmail; password = $testPass; firstName = 'Kyc'; lastName = 'Test'
} | Out-Null

$userToken = Get-Token $testEmail $testPass 'USER'
$userHdr = @{ Authorization = "Bearer $userToken" }

$profile = Invoke-Api -Path '/api/users/getProfile' -Headers $userHdr
Write-Host "kycStatus (before): $($profile.kycStatus)"

$pngBytes = [Convert]::FromBase64String(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
)
$tmpDir = Join-Path $env:TEMP "kyc-test-$suffix"
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null
$png = Join-Path $tmpDir 'doc.png'
[IO.File]::WriteAllBytes($png, $pngBytes)

function Upload-Kyc($Type) {
  $out = curl.exe -sS -X POST "$base/api/kyc/upload" -H "Authorization: Bearer $userToken" -F "file=@$png" -F "documentType=$Type"
  if ($LASTEXITCODE -ne 0) { throw $out }
  return $out | ConvertFrom-Json
}

Write-Host 'Upload CCCD...'
Upload-Kyc 'CCCD' | Out-Null
Write-Host 'Upload GPLX...'
Upload-Kyc 'GPLX' | Out-Null

$after = Invoke-Api -Path '/api/users/getProfile' -Headers $userHdr
Write-Host "kycStatus (after upload): $($after.kycStatus)"

if ($after.kycStatus -eq 'APPROVED') {
  Write-Host 'OK: auto-approve (APP_KYC_AUTO_APPROVE=true)'
} elseif ($after.kycStatus -eq 'PENDING') {
  Write-Host 'Manual approve via admin...'
  $adminToken = Get-Token 'admin@autohub.id.vn' 'admin123@' 'ADMIN'
  $ah = @{ Authorization = "Bearer $adminToken" }
  $pending = @(Invoke-Api -Path '/api/admin/kyc/pending' -Headers $ah | Where-Object { $_.userId -eq $profile.id })
  foreach ($d in $pending) {
    Invoke-Api -Method PUT -Path "/api/admin/kyc/$($d.id)/approve" -Headers $ah | Out-Null
  }
  $final = Invoke-Api -Path '/api/users/getProfile' -Headers $userHdr
  if ($final.kycStatus -ne 'APPROVED') { throw "Expected APPROVED, got $($final.kycStatus)" }
  Write-Host 'OK: manual admin approve'
} else {
  throw "Unexpected kycStatus: $($after.kycStatus)"
}

Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue
