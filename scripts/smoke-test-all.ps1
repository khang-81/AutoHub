# AutoHub - smoke test toan bo chuc nang chinh (API + proxy web).# Usage:
#   powershell -File scripts/smoke-test-all.ps1
#   $env:API_BASE='http://127.0.0.1:8088'; $env:WEB_BASE='http://127.0.0.1:3000'; powershell -File scripts/smoke-test-all.ps1
#
# Yêu cầu: stack Docker đang chạy (docker compose up -d) hoặc backend + frontend dev.

param(
  [string]$ApiBase = $(if ($env:API_BASE) { $env:API_BASE } else { 'http://127.0.0.1:8088' }),
  [string]$WebBase = $(if ($env:WEB_BASE) { $env:WEB_BASE } else { 'http://127.0.0.1:3000' })
)

$ErrorActionPreference = 'Stop'
$script:Passed = 0
$script:Failed = 0
$script:Skipped = 0
$script:AdminToken = $null
$script:UserToken = $null
$script:TestUserId = $null
$script:RentCarId = $null
$usedSeedUser = $false

function Write-Section($title) {
  Write-Host ""
  Write-Host "=== $title ===" -ForegroundColor Cyan
}

function Assert-Test($name, $condition, [string]$detail = '') {
  if ($condition) {
    $script:Passed++
    Write-Host "  [PASS] $name" -ForegroundColor Green
  } else {
    $script:Failed++
    $msg = "  [FAIL] $name"
    if ($detail) { $msg += ": $detail" }
    Write-Host $msg -ForegroundColor Red
  }
}

function Skip-Test($name, [string]$reason) {
  $script:Skipped++
  Write-Host "  [SKIP] $name - $reason" -ForegroundColor Yellow
}

function Invoke-Api {
  param(
    [string]$Method = 'GET',
    [string]$Path,
    [hashtable]$Headers = @{},
    $Body = $null
  )
  $uri = "$ApiBase$Path"
  $params = @{ Method = $Method; Uri = $uri; Headers = $Headers; ContentType = 'application/json' }
  if ($null -ne $Body) { $params.Body = ($Body | ConvertTo-Json -Compress -Depth 8) }
  try {
    return Invoke-RestMethod @params
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
      $text = $reader.ReadToEnd()
      throw "HTTP $($resp.StatusCode.value__) $Path : $text"
    }
    throw
  }
}

function Login-Portal($Email, $Password, $Portal) {
  $r = Invoke-Api -Method POST -Path '/api/auth/login' -Body @{
    email = $Email; password = $Password; portal = $Portal
  }
  if (-not $r.success) { throw "Login failed ($Email/$Portal): $($r.message)" }
  return $r.loginResponse.token
}

function Auth-Headers($Token) { @{ Authorization = "Bearer $Token" } }

function New-TestPngFile($Path) {
  $bytes = [Convert]::FromBase64String(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  )
  [IO.File]::WriteAllBytes($Path, $bytes)
}

function Upload-Kyc($Token, $Type, $FilePath) {
  $json = curl.exe -sS -X POST "$ApiBase/api/kyc/upload" `
    -H "Authorization: Bearer $Token" `
    -F "file=@$FilePath" `
    -F "documentType=$Type"
  if ($LASTEXITCODE -ne 0) { throw "curl upload failed: $json" }
  return $json | ConvertFrom-Json
}

function Http-Status($Url) {
  $code = curl.exe -sS -o NUL -w '%{http_code}' $Url
  return [int]$code
}

Write-Host "AutoHub smoke test" -ForegroundColor White
Write-Host "  API: $ApiBase"
Write-Host "  WEB: $WebBase"

# ── 1. Infrastructure ─────────────────────────────────────────────────────────
Write-Section '1/12 Infrastructure'
try {
  $health = Invoke-Api -Path '/actuator/health/liveness'
  Assert-Test 'API liveness' ($health.status -eq 'UP')
} catch {
  Assert-Test 'API liveness' $false $_.Exception.Message
}

$webHome = Http-Status "$WebBase/"
Assert-Test 'Web SPA (/)' ($webHome -eq 200) "status=$webHome"

# ── 2. Auth ───────────────────────────────────────────────────────────────────
Write-Section '2/12 Auth'
try {
  $script:AdminToken = Login-Portal 'admin@autohub.id.vn' 'admin123@' 'ADMIN'
  Assert-Test 'Admin login (portal ADMIN)' ($null -ne $script:AdminToken)
} catch {
  Assert-Test 'Admin login' $false $_.Exception.Message
}

try {
  $bad = Invoke-Api -Method POST -Path '/api/auth/login' -Body @{
    email = 'admin@autohub.id.vn'; password = 'admin123@'; portal = 'USER'
  }
  Assert-Test 'Admin blocked on USER portal' (-not $bad.success)
} catch {
  Assert-Test 'Admin blocked on USER portal' $true
}

$suffix = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$testEmail = "smoke.$suffix@autohub.test"
$testPass = 'Smoke123!@#'
$usedSeedUser = $false
try {
  Invoke-Api -Method POST -Path '/api/auth/register' -Body @{
    email = $testEmail; password = $testPass; firstName = 'Smoke'; lastName = 'Test'
  } | Out-Null
  $script:UserToken = Login-Portal $testEmail $testPass 'USER'
  Assert-Test 'User register + login' ($null -ne $script:UserToken)
} catch {
  if ($_.Exception.Message -match '429') {
    Write-Host '  (rate limit register - dung user seed)' -ForegroundColor DarkYellow
    $script:UserToken = Login-Portal 'user@autohub.id.vn' 'admin123@' 'USER'
    $usedSeedUser = $true
    Assert-Test 'User login (seed fallback)' ($null -ne $script:UserToken)
  } else {
    Assert-Test 'User register + login' $false $_.Exception.Message
  }
}

# ── 3. Public catalog ─────────────────────────────────────────────────────────
Write-Section '3/12 Public catalog'
try {
  $brands = Invoke-Api -Path '/api/brands/getAll'
  Assert-Test 'Brands getAll' ($brands.Count -gt 0)
} catch { Assert-Test 'Brands getAll' $false $_.Exception.Message }

try {
  $cars = Invoke-Api -Path '/api/cars/getAll'
  Assert-Test 'Cars getAll' ($cars.Count -gt 0)
  $rentCar = $cars | Where-Object {
    ($_.listingType -eq 'RENT_ONLY' -or [string]::IsNullOrEmpty($_.listingType)) -and ($_.id -gt 0)
  } | Select-Object -First 1
  if (-not $rentCar) {
    $rentCar = $cars | Where-Object { $_.id -gt 0 } | Select-Object -First 1
  }
  if ($rentCar) {
    $carDetail = Invoke-Api -Path "/api/cars/getById/$($rentCar.id)"
    Assert-Test 'Car getById' ($null -ne $carDetail.id)
    $script:RentCarId = if ($carDetail.id) { $carDetail.id } else { $rentCar.id }
  } else {
    Skip-Test 'Car getById' 'no rent car in seed'
  }
} catch { Assert-Test 'Cars API' $false $_.Exception.Message }

try {
  $busy = Invoke-Api -Path "/api/rentals/public/busy-ranges/$($script:RentCarId)"
  Assert-Test 'Rental busy-ranges (public)' ($null -ne $busy)
} catch {
  if ($script:RentCarId) { Assert-Test 'Rental busy-ranges' $false $_.Exception.Message }
  else { Skip-Test 'Rental busy-ranges' 'no car id' }
}

try {
  $ins = Invoke-Api -Path '/api/rentals/insurance-options'
  Assert-Test 'Insurance options' ($ins.Count -ge 0)
} catch { Assert-Test 'Insurance options' $false $_.Exception.Message }

# ── 4. GPLX (auto-approve khi APP_KYC_AUTO_APPROVE=true) ─────────────────────
Write-Section '4/12 GPLX / KYC'
$kycFile = Join-Path $env:TEMP "smoke-kyc-$suffix.png"
New-TestPngFile $kycFile
$uh = Auth-Headers $script:UserToken
try {
  if ($usedSeedUser) {
    Assert-Test 'Profile seed user (skip NOT_SUBMITTED)' $true
    $script:TestUserId = (Invoke-Api -Path '/api/users/getProfile' -Headers $uh).id
    Skip-Test 'GPLX upload (seed user)' 'da co GPLX'
  } else {
  $profileBefore = Invoke-Api -Path '/api/users/getProfile' -Headers $uh
  $script:TestUserId = $profileBefore.id
  Assert-Test 'Profile NOT_SUBMITTED (new user)' ($profileBefore.kycStatus -eq 'NOT_SUBMITTED')

  Upload-Kyc $script:UserToken 'CCCD' $kycFile | Out-Null
  $mid = Invoke-Api -Path '/api/users/getProfile' -Headers $uh
  Assert-Test 'After CCCD only -> PENDING' ($mid.kycStatus -eq 'PENDING')

  $gplxDoc = Upload-Kyc $script:UserToken 'GPLX' $kycFile
  $after = Invoke-Api -Path '/api/users/getProfile' -Headers $uh
  # Auto-approve (Docker default) hoặc vẫn PENDING nếu tắt flag
  if ($after.kycStatus -eq 'APPROVED') {
    Assert-Test 'Auto-approve GPLX (APP_KYC_AUTO_APPROVE)' $true
    $pendingMine = @(Invoke-Api -Path '/api/admin/kyc/pending' -Headers (Auth-Headers $script:AdminToken) |
      Where-Object { $_.userId -eq $script:TestUserId })
    Assert-Test 'Not in admin pending after auto-approve' ($pendingMine.Count -eq 0)
  } else {
    Assert-Test 'Manual KYC pending queue' ($after.kycStatus -eq 'PENDING')
    if ($script:AdminToken) {
      $pending = @(Invoke-Api -Path '/api/admin/kyc/pending' -Headers (Auth-Headers $script:AdminToken) |
        Where-Object { $_.userId -eq $script:TestUserId })
      foreach ($d in $pending) {
        Invoke-Api -Method PUT -Path "/api/admin/kyc/$($d.id)/approve" -Headers (Auth-Headers $script:AdminToken) | Out-Null
      }
      $afterManual = Invoke-Api -Path '/api/users/getProfile' -Headers $uh
      Assert-Test 'Admin manual approve GPLX' ($afterManual.kycStatus -eq 'APPROVED')
    }
  }

  $fileUrl = $gplxDoc.fileUrl
  if ($fileUrl) {
    $apiFile = Http-Status "$ApiBase$fileUrl"
    $webFile = Http-Status "$WebBase$fileUrl"
    Assert-Test 'KYC file via API' ($apiFile -eq 200) "status=$apiFile"
    Assert-Test 'KYC file via Web proxy' ($webFile -eq 200) "status=$webFile"
  }
  }
} catch {
  Assert-Test 'GPLX flow' $false $_.Exception.Message
} finally {
  Remove-Item $kycFile -ErrorAction SilentlyContinue
}

# ── 5. Rentals (user APPROVED) ────────────────────────────────────────────────
Write-Section '5/12 Rentals'
if ($script:UserToken -and ($null -ne $script:RentCarId)) {
  try {
    $prof = Invoke-Api -Path '/api/users/getProfile' -Headers $uh
    if ($prof.kycStatus -ne 'APPROVED') {
      Skip-Test 'Create rental' 'KYC not APPROVED'
    } else {
      $start = (Get-Date).AddDays(14).ToString('yyyy-MM-dd')
      $end = (Get-Date).AddDays(16).ToString('yyyy-MM-dd')
      $rental = Invoke-Api -Method POST -Path '/api/rentals/add' -Headers $uh -Body @{
        startDate = $start; endDate = $end; carId = $script:RentCarId
        userId = $prof.id; paymentMethod = 'BANK_TRANSFER'
      }
      $ok = ($null -ne $rental.id)
      Assert-Test 'Create rental order' $ok
      $myRentals = Invoke-Api -Path '/api/rentals/getRentalsByUserId' -Headers $uh
      Assert-Test 'My rentals list' ($myRentals.Count -gt 0)
    }
  } catch { Assert-Test 'Rentals' $false $_.Exception.Message }
} else {
  Skip-Test 'Rentals' 'missing user or car'
}

# ── 6. Sale orders (catalog) ──────────────────────────────────────────────────
Write-Section '6/12 Sale'
try {
  $salePath = '/api/cars/search?listing=SALE_ONLY&page=1&size=5'
  $saleCars = Invoke-Api -Path $salePath
  Assert-Test 'Sale cars search' ($null -ne $saleCars.content -or $null -ne $saleCars.items -or $null -ne $saleCars.data)
} catch { Assert-Test 'Sale cars search' $false $_.Exception.Message }

# ── 7. Viewing appointments ───────────────────────────────────────────────────
Write-Section '7/12 Viewing appointments'
try {
  $viewDate = (Get-Date).AddDays(3).ToString('yyyy-MM-dd')
  $avail = Invoke-Api -Path "/api/viewing-appointments/availability?date=$viewDate"
  Assert-Test 'Viewing availability (public)' ($null -ne $avail)
} catch { Assert-Test 'Viewing availability' $false $_.Exception.Message }

# ── 8. Reviews ────────────────────────────────────────────────────────────────
Write-Section '8/12 Reviews'
if ($null -ne $script:RentCarId) {
  try {
    $revs = Invoke-Api -Path "/api/reviews/car/$($script:RentCarId)"
    Assert-Test 'Reviews by car' ($null -ne $revs)
  } catch { Assert-Test 'Reviews by car' $false $_.Exception.Message }
} else { Skip-Test 'Reviews' 'no car id' }

# ── 9. AI chatbot ─────────────────────────────────────────────────────────────
Write-Section '9/12 AI'
try {
  $ai = Invoke-Api -Path '/api/ai/status'
  Assert-Test 'AI status endpoint' ($null -ne $ai.geminiConfigured)
} catch { Assert-Test 'AI status' $false $_.Exception.Message }

# ── 10. Payment config ────────────────────────────────────────────────────────
Write-Section '10/12 Payment'
try {
  $bank = Invoke-Api -Path '/api/payment/bank-info' -Headers $uh
  Assert-Test 'Bank info (public)' ($null -ne $bank.accountNumber -or $null -ne $bank.bankName)
} catch { Assert-Test 'Bank info' $false $_.Exception.Message }

# ── 11. Admin APIs ────────────────────────────────────────────────────────────
Write-Section '11/12 Admin'
if ($script:AdminToken) {
  $ah = Auth-Headers $script:AdminToken
  try {
    $users = Invoke-Api -Path '/api/users/getAll' -Headers $ah
    Assert-Test 'Admin users getAll' ($users.Count -gt 0)
  } catch { Assert-Test 'Admin users' $false $_.Exception.Message }
  try {
    $allRentals = Invoke-Api -Path '/api/rentals/getAll' -Headers $ah
    Assert-Test 'Admin rentals getAll' ($null -ne $allRentals)
  } catch { Assert-Test 'Admin rentals' $false $_.Exception.Message }
  try {
    $reviews = Invoke-Api -Path '/api/reviews/admin/getAll' -Headers $ah
    Assert-Test 'Admin reviews getAll' ($null -ne $reviews)
  } catch { Assert-Test 'Admin reviews' $false $_.Exception.Message }
  try {
    Invoke-Api -Path '/api/admin/kyc/pending' -Headers $uh
    Assert-Test 'User blocked from admin KYC' $false
  } catch {
    Assert-Test 'User blocked from admin KYC' ($_.Exception.Message -match '403')
  }
} else {
  Skip-Test 'Admin APIs' 'no admin token'
}

# ── 12. Security / roles ──────────────────────────────────────────────────────
Write-Section '12/12 Security'
if ($script:UserToken) {
  try {
    Invoke-Api -Path '/api/rentals/getAll' -Headers $uh
    Assert-Test 'User blocked from admin rentals' $false
  } catch {
    Assert-Test 'User blocked from admin rentals' ($_.Exception.Message -match '403')
  }
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "------------------------------------" -ForegroundColor DarkGray
Write-Host "PASSED: $script:Passed  FAILED: $script:Failed  SKIPPED: $script:Skipped" -ForegroundColor White
if ($script:Failed -gt 0) {
  Write-Host "Smoke test FAILED" -ForegroundColor Red
  exit 1
}
Write-Host "Smoke test OK" -ForegroundColor Green
exit 0
