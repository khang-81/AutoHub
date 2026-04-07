# AutoHub - Data Seeding Script
$BASE = "http://localhost:8080"

function Invoke-Api($method, $url, $body, $token) {
    $h = @{ "Content-Type" = "application/json" }
    if ($token) { $h["Authorization"] = "Bearer $token" }
    try {
        $json = if ($body) { $body | ConvertTo-Json -Depth 10 } else { $null }
        $resp = Invoke-RestMethod -Method $method -Uri "$BASE$url" -Headers $h -Body $json -ErrorAction Stop
        return $resp
    } catch {
        Write-Host "  [WARN] $method $url => $($_.Exception.Message)" -ForegroundColor Yellow
        return $null
    }
}

Write-Host "=== AutoHub Data Seeder ===" -ForegroundColor Cyan

# STEP 1: Register users
Write-Host "[1] Registering accounts..." -ForegroundColor Green
Invoke-Api "POST" "/api/auth/register" @{ email="admin@autohub.vn"; password="Admin@123"; roles=@("admin") } $null
Write-Host "  OK: admin@autohub.vn / Admin@123"
Invoke-Api "POST" "/api/auth/register" @{ email="vana@gmail.com"; password="User@123"; roles=@("user") } $null
Write-Host "  OK: vana@gmail.com / User@123"
Invoke-Api "POST" "/api/auth/register" @{ email="bich@gmail.com"; password="User@123"; roles=@("user") } $null
Write-Host "  OK: bich@gmail.com / User@123"
Invoke-Api "POST" "/api/auth/register" @{ email="vanc@gmail.com"; password="User@123"; roles=@("user") } $null
Write-Host "  OK: vanc@gmail.com / User@123"

# STEP 2: Login
Write-Host "[2] Logging in..." -ForegroundColor Green
$adminLogin = Invoke-Api "POST" "/api/auth/login" @{ email="admin@autohub.vn"; password="Admin@123" } $null
$ADMIN_TOKEN = $adminLogin.data
if (-not $ADMIN_TOKEN) { Write-Host "[ERROR] Cannot get admin token!" -ForegroundColor Red; exit 1 }
Write-Host "  OK: Admin token obtained"

$userLogin = Invoke-Api "POST" "/api/auth/login" @{ email="vana@gmail.com"; password="User@123" } $null
$USER_TOKEN = $userLogin.data
Write-Host "  OK: User token obtained"

# STEP 3: Colors
Write-Host "[3] Creating colors..." -ForegroundColor Green
$colorList = @(
    @{ name="Trang"; code="#FFFFFF" },
    @{ name="Den"; code="#000000" },
    @{ name="Bac"; code="#C0C0C0" },
    @{ name="Do"; code="#DC2626" },
    @{ name="Xanh"; code="#2563EB" },
    @{ name="Xam"; code="#6B7280" },
    @{ name="Vang"; code="#F59E0B" },
    @{ name="Nau"; code="#92400E" }
)
foreach ($c in $colorList) {
    Invoke-Api "POST" "/api/colors/add" $c $ADMIN_TOKEN | Out-Null
    Write-Host "  OK: Color $($c.name)"
}

Start-Sleep -Milliseconds 300
$allColors = Invoke-Api "GET" "/api/colors/getAll" $null $null
Write-Host "  Total colors: $($allColors.Count)"

# STEP 4: Brands
Write-Host "[4] Creating brands..." -ForegroundColor Green
$brandList = @(
    @{ name="Toyota"; logoPath="https://upload.wikimedia.org/wikipedia/commons/e/ee/Toyota_logo_%28Red%29.png" },
    @{ name="Honda"; logoPath="https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg" },
    @{ name="Hyundai"; logoPath="https://upload.wikimedia.org/wikipedia/commons/0/04/Hyundai_Motor_Company_logo.svg" },
    @{ name="Mazda"; logoPath="https://upload.wikimedia.org/wikipedia/commons/1/17/Mazda_Motor_Corporation_logo.svg" },
    @{ name="Ford"; logoPath="https://upload.wikimedia.org/wikipedia/commons/1/1e/Ford_logo_flat.svg" },
    @{ name="Kia"; logoPath="https://upload.wikimedia.org/wikipedia/commons/1/13/Kia-logo.svg" },
    @{ name="Mercedes"; logoPath="https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg" },
    @{ name="BMW"; logoPath="https://upload.wikimedia.org/wikipedia/commons/f/f4/BMW_logo_%28gray%29.svg" }
)
foreach ($b in $brandList) {
    Invoke-Api "POST" "/api/brands/add" $b $ADMIN_TOKEN | Out-Null
    Write-Host "  OK: Brand $($b.name)"
}

Start-Sleep -Milliseconds 300
$allBrands = Invoke-Api "GET" "/api/brands/getAll" $null $null
$brandMap = @{}
foreach ($b in $allBrands) { $brandMap[$b.name] = $b.id }
Write-Host "  Total brands: $($allBrands.Count)"

# STEP 5: Models
Write-Host "[5] Creating models..." -ForegroundColor Green
$modelList = @(
    @{ name="Camry";    brandId=$brandMap["Toyota"] },
    @{ name="Corolla";  brandId=$brandMap["Toyota"] },
    @{ name="Fortuner"; brandId=$brandMap["Toyota"] },
    @{ name="Innova";   brandId=$brandMap["Toyota"] },
    @{ name="Vios";     brandId=$brandMap["Toyota"] },
    @{ name="Civic";    brandId=$brandMap["Honda"] },
    @{ name="CRV";      brandId=$brandMap["Honda"] },
    @{ name="HRV";      brandId=$brandMap["Honda"] },
    @{ name="Tucson";   brandId=$brandMap["Hyundai"] },
    @{ name="SantaFe";  brandId=$brandMap["Hyundai"] },
    @{ name="Accent";   brandId=$brandMap["Hyundai"] },
    @{ name="CX-Five";  brandId=$brandMap["Mazda"] },
    @{ name="MazdaThree"; brandId=$brandMap["Mazda"] },
    @{ name="CX-Eight"; brandId=$brandMap["Mazda"] },
    @{ name="Ranger";   brandId=$brandMap["Ford"] },
    @{ name="Everest";  brandId=$brandMap["Ford"] },
    @{ name="Seltos";   brandId=$brandMap["Kia"] },
    @{ name="Sportage"; brandId=$brandMap["Kia"] },
    @{ name="CClass";   brandId=$brandMap["Mercedes"] },
    @{ name="EClass";   brandId=$brandMap["Mercedes"] },
    @{ name="Series-Three"; brandId=$brandMap["BMW"] },
    @{ name="Series-Five";  brandId=$brandMap["BMW"] }
)
foreach ($m in $modelList) {
    if ($m.brandId -gt 0) {
        Invoke-Api "POST" "/api/models/add" $m $ADMIN_TOKEN | Out-Null
        Write-Host "  OK: Model $($m.name)"
    }
}

Start-Sleep -Milliseconds 300
$allModels = Invoke-Api "GET" "/api/models/getAll" $null $null
$modelMap = @{}
foreach ($m in $allModels) { $modelMap[$m.name] = $m.id }
$colorMap = @{}
foreach ($c in $allColors) { $colorMap[$c.name] = $c.id }
Write-Host "  Total models: $($allModels.Count)"

# STEP 6: Cars
Write-Host "[6] Creating cars..." -ForegroundColor Green

function Get-CarData($plate, $year, $km, $price, $modelName, $colorName, $findeks, $img) {
    $mid = $modelMap[$modelName]
    $cid = $colorMap[$colorName]
    if (-not $mid -or -not $cid) { return $null }
    return @{ plate=$plate; modelYear=[short]$year; kilometer=[long]$km; dailyPrice=[float]$price; modelId=$mid; colorId=$cid; minFindeksRate=[short]$findeks; imagePath=$img }
}

$carsData = @(
    (Get-CarData "51A-12345" 2022 25000 750000  "Camry"       "Trang" 1000 "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800"),
    (Get-CarData "51B-23456" 2023 8000  650000  "Vios"        "Bac"   800  "https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800"),
    (Get-CarData "51C-34567" 2022 15000 900000  "Fortuner"    "Den"   1200 "https://images.unsplash.com/photo-1669215420013-a8c37a0e09ee?w=800"),
    (Get-CarData "51D-45678" 2021 32000 600000  "Corolla"     "Do"    700  "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800"),
    (Get-CarData "51E-56789" 2023 5000  800000  "Civic"       "Trang" 900  "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800"),
    (Get-CarData "51F-67890" 2022 18000 1100000 "CRV"         "Xam"   1100 "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800"),
    (Get-CarData "51G-78901" 2023 9000  950000  "Tucson"      "Xanh"  1000 "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"),
    (Get-CarData "51H-89012" 2022 22000 1300000 "SantaFe"     "Den"   1300 "https://images.unsplash.com/photo-1568844293986-ca9c5c0b4ff5?w=800"),
    (Get-CarData "51I-90123" 2023 6000  850000  "CX-Five"     "Trang" 950  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800"),
    (Get-CarData "51J-01234" 2021 40000 720000  "MazdaThree"  "Do"    750  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800"),
    (Get-CarData "51K-11234" 2023 7000  1500000 "Ranger"      "Den"   1400 "https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800"),
    (Get-CarData "51L-22345" 2022 12000 870000  "Seltos"      "Bac"   900  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"),
    (Get-CarData "51M-33456" 2023 3000  2200000 "CClass"      "Den"   2000 "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800"),
    (Get-CarData "51N-44567" 2022 20000 2500000 "EClass"      "Trang" 2200 "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800"),
    (Get-CarData "51O-55678" 2023 8000  2800000 "Series-Three" "Xam"  2400 "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800"),
    (Get-CarData "51P-66789" 2022 15000 1000000 "Innova"      "Trang" 1000 "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800"),
    (Get-CarData "51Q-77890" 2023 4000  1200000 "CX-Eight"    "Nau"   1200 "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800"),
    (Get-CarData "51R-88901" 2021 35000 680000  "Accent"      "Vang"  700  "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800"),
    (Get-CarData "51S-99012" 2023 6000  1600000 "Sportage"    "Xanh"  1500 "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800"),
    (Get-CarData "51T-10123" 2022 19000 3200000 "Series-Five" "Den"   2800 "https://images.unsplash.com/photo-1520608760-eff2c44973f0?w=800")
)

$carCount = 0
foreach ($car in $carsData) {
    if ($car) {
        $r = Invoke-Api "POST" "/api/cars/add" $car $ADMIN_TOKEN
        if ($r) { $carCount++ }
        Write-Host "  OK: Car $($car.plate)"
    }
}

Start-Sleep -Milliseconds 500
$allCars = Invoke-Api "GET" "/api/cars/getAll" $null $null
Write-Host "  Total cars: $($allCars.Count)"

# STEP 7: Get User IDs
Write-Host "[7] Getting users..." -ForegroundColor Green
$allUsers = Invoke-Api "GET" "/api/users/getAll" $null $ADMIN_TOKEN
$userIdMap = @{}
foreach ($u in $allUsers) { $userIdMap[$u.email] = $u.id }

$adminId = $userIdMap["admin@autohub.vn"]
$user1Id = $userIdMap["vana@gmail.com"]
$user2Id = $userIdMap["bich@gmail.com"]
$user3Id = $userIdMap["vanc@gmail.com"]
Write-Host "  admin=$adminId user1=$user1Id user2=$user2Id user3=$user3Id"

# Create customer profiles
Invoke-Api "POST" "/api/customers/add" @{ firstName="Nguyen"; lastName="Van An"; birthdate="1990-05-15"; internationalId="012345678901"; licenceIssueDate="2015-03-01"; userId=$user1Id } $null | Out-Null
Invoke-Api "POST" "/api/customers/add" @{ firstName="Tran"; lastName="Thi Bich"; birthdate="1992-08-20"; internationalId="023456789012"; licenceIssueDate="2016-06-15"; userId=$user2Id } $null | Out-Null
Invoke-Api "POST" "/api/customers/add" @{ firstName="Le"; lastName="Van C"; birthdate="1988-12-10"; internationalId="034567890123"; licenceIssueDate="2014-09-20"; userId=$user3Id } $null | Out-Null
Write-Host "  OK: Customer profiles created"

# STEP 8: Rentals
Write-Host "[8] Creating rentals and invoices..." -ForegroundColor Green

$car1 = if ($allCars.Count -ge 1) { $allCars[0].id } else { 1 }
$car2 = if ($allCars.Count -ge 2) { $allCars[1].id } else { 2 }
$car3 = if ($allCars.Count -ge 3) { $allCars[2].id } else { 3 }
$car4 = if ($allCars.Count -ge 4) { $allCars[3].id } else { 4 }
$car5 = if ($allCars.Count -ge 5) { $allCars[4].id } else { 5 }
$car6 = if ($allCars.Count -ge 6) { $allCars[5].id } else { 6 }
$car7 = if ($allCars.Count -ge 7) { $allCars[6].id } else { 7 }

$rentalRequests = @()
if ($user1Id -gt 0) {
    $rentalRequests += @{ startDate="2024-01-15"; endDate="2024-01-20"; carId=$car1; userId=$user1Id }
    $rentalRequests += @{ startDate="2024-03-10"; endDate="2024-03-15"; carId=$car3; userId=$user1Id }
    $rentalRequests += @{ startDate="2024-06-01"; endDate="2024-06-07"; carId=$car5; userId=$user1Id }
    $rentalRequests += @{ startDate="2024-11-20"; endDate="2024-11-25"; carId=$car2; userId=$user1Id }
}
if ($user2Id -gt 0) {
    $rentalRequests += @{ startDate="2024-02-05"; endDate="2024-02-10"; carId=$car2; userId=$user2Id }
    $rentalRequests += @{ startDate="2024-07-15"; endDate="2024-07-22"; carId=$car4; userId=$user2Id }
    $rentalRequests += @{ startDate="2024-12-01"; endDate="2024-12-05"; carId=$car6; userId=$user2Id }
}
if ($user3Id -gt 0) {
    $rentalRequests += @{ startDate="2024-04-20"; endDate="2024-04-25"; carId=$car1; userId=$user3Id }
    $rentalRequests += @{ startDate="2024-08-10"; endDate="2024-08-17"; carId=$car3; userId=$user3Id }
    $rentalRequests += @{ startDate="2025-01-05"; endDate="2025-01-10"; carId=$car5; userId=$user3Id }
    $rentalRequests += @{ startDate="2025-02-10"; endDate="2025-02-15"; carId=$car7; userId=$user3Id }
}

foreach ($rental in $rentalRequests) {
    $r = Invoke-Api "POST" "/api/rentals/add" $rental $USER_TOKEN
    if ($r -and $r.rentalId) {
        Write-Host "  OK: Rental #$($r.rentalId) Car:$($rental.carId) $($rental.startDate)->$($rental.endDate) Price:$($r.totalPrice)"
    } else {
        Write-Host "  OK: Rental created"
    }
}

Start-Sleep -Milliseconds 500
$allRentals = Invoke-Api "GET" "/api/rentals/getAll" $null $ADMIN_TOKEN
Write-Host "  Total rentals: $($allRentals.Count)"

# Create invoices
$idx = 1
foreach ($r in $allRentals) {
    if ($idx -gt 10) { break }
    $invNo = "INV-2024-" + "{0:D4}" -f $idx
    $disc = [float](Get-Random -Minimum 0 -Maximum 10)
    Invoke-Api "POST" "/api/invoices/add" @{
        invoiceNo=$invNo; totalPrice=[float]$r.totalPrice; discountRate=$disc; taxRate=[float]10; rentalId=$r.id
    } $ADMIN_TOKEN | Out-Null
    Write-Host "  OK: Invoice $invNo for Rental #$($r.id)"
    $idx++
}

# SUMMARY
Write-Host ""
Write-Host "=== SEEDING COMPLETE ===" -ForegroundColor Green
Write-Host "Accounts:" -ForegroundColor Cyan
Write-Host "  ADMIN : admin@autohub.vn / Admin@123"
Write-Host "  USER 1: vana@gmail.com / User@123"
Write-Host "  USER 2: bich@gmail.com / User@123"
Write-Host "  USER 3: vanc@gmail.com / User@123"
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Frontend : http://localhost:3000"
Write-Host "  Admin    : http://localhost:3000/admin/login"
Write-Host "  API Docs : http://localhost:8080/swagger-ui/"
