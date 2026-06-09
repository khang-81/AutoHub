# Reject + re-upload GPLX flow
$ErrorActionPreference = 'Stop'
$base = if ($env:API_BASE) { $env:API_BASE } else { 'http://127.0.0.1:8088' }

function Invoke-Api {
  param([string]$Method = 'GET', [string]$Path, [hashtable]$Headers = @{}, $Body = $null)
  $params = @{ Method = $Method; Uri = "$base$Path"; Headers = $Headers; ContentType = 'application/json' }
  if ($Body) { $params.Body = ($Body | ConvertTo-Json -Compress) }
  return Invoke-RestMethod @params
}

function Get-Token($Email, $Password, $Portal) {
  $r = Invoke-Api -Method POST -Path '/api/auth/login' -Body @{ email = $Email; password = $Password; portal = $Portal }
  if (-not $r.success) { throw $r.message }
  return $r.loginResponse.token
}

$suffix = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$email = "kyc.reject.$suffix@autohub.test"
$pass = 'Test123!@#'
$phone = ('09{0}' -f ($suffix.ToString().Substring([Math]::Max(0, $suffix.ToString().Length - 9))))
Invoke-Api -Method POST -Path '/api/auth/register' -Body @{
  email = $email
  password = $pass
  fullName = 'Reject Test'
  phone = $phone
  birthDate = '1991-08-20'
  roles = @('user')
} | Out-Null
$userToken = Get-Token $email $pass 'USER'
$hdr = @{ Authorization = "Bearer $userToken" }
$profile = Invoke-Api -Path '/api/users/getProfile' -Headers $hdr
$userId = $profile.id

$png = Join-Path $env:TEMP "kyc-r-$suffix.png"
[IO.File]::WriteAllBytes($png, [Convert]::FromBase64String('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='))
foreach ($t in @('CCCD','GPLX')) {
  curl.exe -sS -X POST "$base/api/kyc/upload" -H "Authorization: Bearer $userToken" -F "file=@$png" -F "documentType=$t" | Out-Null
}

$p = Invoke-Api -Path '/api/users/getProfile' -Headers $hdr
if ($p.kycStatus -eq 'APPROVED') {
  Write-Host 'SKIP: APP_KYC_AUTO_APPROVE=true — reject flow can only run with auto-approve disabled'
  Remove-Item $png -ErrorAction SilentlyContinue
  exit 0
}
if ($p.kycStatus -ne 'PENDING') { throw "Expected PENDING, got $($p.kycStatus)" }

$adminToken = Get-Token 'admin@autohub.id.vn' 'admin123@' 'ADMIN'
$ah = @{ Authorization = "Bearer $adminToken" }
$pending = @(Invoke-Api -Path '/api/admin/kyc/pending' -Headers $ah | Where-Object { $_.userId -eq $userId })
foreach ($d in $pending) {
  Invoke-Api -Method PUT -Path "/api/admin/kyc/$($d.id)/reject" -Headers $ah -Body @{ adminNote = 'Anh mo' } | Out-Null
}

$p2 = Invoke-Api -Path '/api/users/getProfile' -Headers $hdr
Write-Host "After reject: $($p2.kycStatus)"
if ($p2.kycStatus -ne 'REJECTED') { throw "Expected REJECTED" }

curl.exe -sS -X POST "$base/api/kyc/upload" -H "Authorization: Bearer $userToken" -F "file=@$png" -F "documentType=CCCD" | Out-Null
$p3 = Invoke-Api -Path '/api/users/getProfile' -Headers $hdr
Write-Host "After re-upload CCCD only: $($p3.kycStatus)"
if ($p3.kycStatus -ne 'PENDING') { throw "Expected PENDING after partial re-upload" }

Write-Host 'OK: reject + re-upload flow passed'
Remove-Item $png -ErrorAction SilentlyContinue
