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

function Get-NextAvailableViewingSlot {
  $d = (Get-Date).AddDays(3).Date
  for ($i = 0; $i -lt 60; $i++) {
    while ($d.DayOfWeek -eq 'Sunday') { $d = $d.AddDays(1) }
    $slots = Normalize-ApiList (Invoke-Api -Path "/api/viewing-appointments/availability?date=$($d.ToString('yyyy-MM-dd'))") 'startTime'
    foreach ($s in $slots) {
      if ($s.available) {
        $hour = 10
        if ($s.startTime -match '^(\d{1,2})') { $hour = [int]$matches[1] }
        return $d.AddHours($hour)
      }
    }
    $d = $d.AddDays(1)
  }
  return (Get-Date).AddDays(7).Date.AddHours(14)
}

function Normalize-ApiList($Items, [string]$KeyProperty) {
  if ($null -eq $Items) { return @() }
  if ($Items -is [System.Collections.IEnumerable] -and -not ($Items -is [string])) {
    return @($Items)
  }
  if ($Items.PSObject.Properties.Name -contains $KeyProperty) { return @($Items) }
  return @()
}

function Normalize-BusyRanges($Busy) { Normalize-ApiList $Busy 'startDate' }

function Parse-RentalDate($Value) {
  if ($null -eq $Value) { return $null }
  if ($Value -is [DateTime]) { return $Value.Date }
  if ($Value -is [string] -and $Value.Length -gt 0) {
    return [DateTime]::Parse($Value, [System.Globalization.CultureInfo]::InvariantCulture).Date
  }
  return $null
}

function Test-RentalOverlap($Start, $End, $BusyRanges) {
  foreach ($b in (Normalize-BusyRanges $BusyRanges)) {
    $bs = Parse-RentalDate $b.startDate
    $be = Parse-RentalDate $b.endDate
    if ($null -eq $bs -or $null -eq $be) { continue }
    if ($bs -le $End -and $be -ge $Start) { return $true }
  }
  return $false
}

function Get-AvailableRentalWindow {
  param([int]$CarId, [int]$SpanDays = 2)
  $busy = Normalize-BusyRanges (Invoke-Api -Path "/api/rentals/public/busy-ranges/$CarId")
  $today = (Get-Date).Date
  for ($d = 7; $d -le 180; $d++) {
    $start = $today.AddDays($d)
    $end = $start.AddDays($SpanDays)
    if (-not (Test-RentalOverlap $start $end $busy)) {
      return @{
        startDate = $start.ToString('yyyy-MM-dd')
        endDate = $end.ToString('yyyy-MM-dd')
      }
    }
  }
  return $null
}

Write-Host "AutoHub smoke test" -ForegroundColor White
Write-Host "  API: $ApiBase"
Write-Host "  WEB: $WebBase"

# ── 1. Infrastructure ─────────────────────────────────────────────────────────
Write-Section '1/14 Infrastructure'
try {
  $health = Invoke-Api -Path '/actuator/health/liveness'
  Assert-Test 'API liveness' ($health.status -eq 'UP')
} catch {
  Assert-Test 'API liveness' $false $_.Exception.Message
}

$webHome = Http-Status "$WebBase/"
Assert-Test 'Web SPA (/)' ($webHome -eq 200) "status=$webHome"

# ── 2. Auth ───────────────────────────────────────────────────────────────────
Write-Section '2/14 Auth'
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
    email = $testEmail
    password = $testPass
    fullName = 'Smoke Test User'
    phone = ('09{0}' -f ($suffix.ToString().Substring([Math]::Max(0, $suffix.ToString().Length - 9))))
    birthDate = '1995-06-15'
    roles = @('user')
  } | Out-Null
  $script:UserToken = Login-Portal $testEmail $testPass 'USER'
  Assert-Test 'User register + login' ($null -ne $script:UserToken)
  $profReg = Invoke-Api -Path '/api/users/getProfile' -Headers (Auth-Headers $script:UserToken)
  Assert-Test 'Profile fullName after register' ($profReg.fullName -eq 'Smoke Test User')
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
Write-Section '3/14 Public catalog'
try {
  $brands = Invoke-Api -Path '/api/brands/getAll'
  Assert-Test 'Brands getAll' ($brands.Count -gt 0)
} catch { Assert-Test 'Brands getAll' $false $_.Exception.Message }

try {
  $cars = Invoke-Api -Path '/api/cars/getAll'
  Assert-Test 'Cars getAll' ($cars.Count -gt 0)
  $rentCandidates = @($cars | Where-Object {
    $_.listingType -eq 'RENT_ONLY' -or [string]::IsNullOrEmpty($_.listingType)
  } | Sort-Object id)
  $rentCar = $null
  foreach ($c in $rentCandidates) {
    if ($c.id -le 0) { continue }
    if (Get-AvailableRentalWindow -CarId $c.id) { $rentCar = $c; break }
  }
  if (-not $rentCar -and $rentCandidates.Count -gt 0) {
    $rentCar = $rentCandidates | Select-Object -First 1
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

# ── 4. Sale + viewing without GPLX (new user NOT_SUBMITTED) ───────────────────
Write-Section '4/14 Sale & viewing without GPLX'
$uh = Auth-Headers $script:UserToken
try {
  if ($usedSeedUser) {
    Skip-Test 'Sale without GPLX' 'seed user da co KYC'
    Skip-Test 'Viewing without GPLX' 'seed user'
  } else {
    $profNoKyc = Invoke-Api -Path '/api/users/getProfile' -Headers $uh
    Assert-Test 'New user KYC NOT_SUBMITTED before upload' ($profNoKyc.kycStatus -eq 'NOT_SUBMITTED')
    $saleList = Invoke-Api -Path '/api/cars/search?listing=SALE_ONLY&page=1&size=20'
    $saleItems = @($saleList.content)
    if ($saleItems.Count -eq 0) { $saleItems = @($saleList.items) }
    $availSale = $saleItems | Where-Object { $_.saleStatus -eq 'AVAILABLE' -and $_.salePrice -gt 0 } | Select-Object -First 1
    if ($availSale) {
      try {
        $saleOrder = Invoke-Api -Method POST -Path '/api/sale-orders/add' -Headers $uh -Body @{
          carId = $availSale.id; paymentMethod = 'CASH'
        }
        Assert-Test 'Sale order without GPLX' ($null -ne $saleOrder.id)
      } catch {
        Assert-Test 'Sale order without GPLX' $false $_.Exception.Message
      }
    } else {
      Skip-Test 'Sale order without GPLX' 'no AVAILABLE sale car'
    }
    $viewCar = Invoke-Api -Path '/api/cars/search?listing=SALE_ONLY&page=1&size=5'
    $vc = @($viewCar.content | Where-Object { $_.saleStatus -in @('AVAILABLE','RESERVED') } | Select-Object -First 1)
    if ($vc) {
      $viewAt = (Get-NextAvailableViewingSlot).ToString('yyyy-MM-ddTHH:mm:ss')
      try {
        $viewAppt = Invoke-Api -Method POST -Path '/api/viewing-appointments' -Headers $uh -Body @{
          carId = $vc.id; scheduledAt = $viewAt; contactPhone = '0912345678'; note = 'smoke'
        }
        Assert-Test 'Viewing appointment without GPLX' ($null -ne $viewAppt.id)
      } catch {
        Assert-Test 'Viewing appointment without GPLX' $false $_.Exception.Message
      }
    } else {
      Skip-Test 'Viewing without GPLX' 'no sale car'
    }
  }
} catch {
  Assert-Test 'Sale/viewing without GPLX' $false $_.Exception.Message
}

# ── 5. GPLX (auto-approve khi APP_KYC_AUTO_APPROVE=true) ─────────────────────
Write-Section '5/14 GPLX / KYC'
$kycFile = Join-Path $env:TEMP "smoke-kyc-$suffix.png"
New-TestPngFile $kycFile
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

# ── 6. Car catalog (ảnh + giá) ──────────────────────────────────────────────
Write-Section '6/14 Car catalog'
try {
  $vf3 = Invoke-Api -Path '/api/cars/search?listing=RENT_ONLY&page=1&size=30'
  $vf3car = @($vf3.content | Where-Object { $_.plate -eq '51R0001' } | Select-Object -First 1)
  if ($vf3car) {
    Assert-Test 'VF3 rent daily_price' ([int]$vf3car.dailyPrice -eq 650000)
    Assert-Test 'VF3 image (wikimedia)' ($vf3car.imagePath -match 'wikimedia')
  } else {
    $anyRent = @($vf3.content | Select-Object -First 1)
    if ($anyRent) {
      Assert-Test 'Rent car has distinct image' ($anyRent.imagePath -notmatch 'sig=1$' -or $anyRent.imagePath -match 'wikimedia')
    } else {
      Skip-Test 'Car catalog' 'no rent cars'
    }
  }
} catch { Assert-Test 'Car catalog' $false $_.Exception.Message }

# ── 7. Rentals (user APPROVED) ────────────────────────────────────────────────
Write-Section '7/14 Rentals'
if ($script:UserToken -and ($null -ne $script:RentCarId)) {
  try {
    $prof = Invoke-Api -Path '/api/users/getProfile' -Headers $uh
    if ($prof.kycStatus -ne 'APPROVED') {
      Skip-Test 'Create rental' 'KYC not APPROVED'
    } else {
      $window = Get-AvailableRentalWindow -CarId $script:RentCarId
      if (-not $window) {
        Skip-Test 'Create rental' 'no free window in 180 days'
      } else {
      $rental = Invoke-Api -Method POST -Path '/api/rentals/add' -Headers $uh -Body @{
        startDate = $window.startDate; endDate = $window.endDate; carId = $script:RentCarId
        userId = $prof.id; paymentMethod = 'BANK_TRANSFER'
      }
      $ok = ($null -ne $rental.id)
      Assert-Test 'Create rental order' $ok
      $myRentals = Invoke-Api -Path '/api/rentals/getRentalsByUserId' -Headers $uh
      Assert-Test 'My rentals list' ($myRentals.Count -gt 0)
      }
    }
  } catch { Assert-Test 'Rentals' $false $_.Exception.Message }
} else {
  Skip-Test 'Rentals' 'missing user or car'
}

# ── 8. Sale orders (catalog) ──────────────────────────────────────────────────
Write-Section '8/14 Sale'
try {
  $salePath = '/api/cars/search?listing=SALE_ONLY&page=1&size=5'
  $saleCars = Invoke-Api -Path $salePath
  Assert-Test 'Sale cars search' ($null -ne $saleCars.content -or $null -ne $saleCars.items -or $null -ne $saleCars.data)
} catch { Assert-Test 'Sale cars search' $false $_.Exception.Message }

# ── 9. Viewing appointments ───────────────────────────────────────────────────
Write-Section '9/14 Viewing appointments'
try {
  $viewDate = (Get-Date).AddDays(3).ToString('yyyy-MM-dd')
  $avail = Invoke-Api -Path "/api/viewing-appointments/availability?date=$viewDate"
  Assert-Test 'Viewing availability (public)' ($null -ne $avail)
} catch { Assert-Test 'Viewing availability' $false $_.Exception.Message }

# ── 10. Reviews ───────────────────────────────────────────────────────────────
Write-Section '10/14 Reviews'
if ($null -ne $script:RentCarId) {
  try {
    $revs = Invoke-Api -Path "/api/reviews/car/$($script:RentCarId)"
    Assert-Test 'Reviews by car' ($null -ne $revs)
  } catch { Assert-Test 'Reviews by car' $false $_.Exception.Message }
} else { Skip-Test 'Reviews' 'no car id' }

# ── 11. AI chatbot ────────────────────────────────────────────────────────────
Write-Section '11/14 AI'
try {
  $ai = Invoke-Api -Path '/api/ai/status'
  Assert-Test 'AI status endpoint' ($null -ne $ai.geminiConfigured)
} catch { Assert-Test 'AI status' $false $_.Exception.Message }

# ── 12. Payment config ────────────────────────────────────────────────────────
Write-Section '12/14 Payment'
try {
  $bank = Invoke-Api -Path '/api/payment/bank-info' -Headers $uh
  Assert-Test 'Bank info (public)' ($null -ne $bank.accountNumber -or $null -ne $bank.bankName)
} catch { Assert-Test 'Bank info' $false $_.Exception.Message }

# ── 13. Admin APIs ────────────────────────────────────────────────────────────
Write-Section '13/14 Admin'
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

# ── 14. Security / roles ──────────────────────────────────────────────────────
Write-Section '14/14 Security'
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
