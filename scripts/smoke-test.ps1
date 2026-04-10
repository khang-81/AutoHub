# Smoke test API (PowerShell). Chạy khi backend đã bật (mặc định http://127.0.0.1:8081).

param(
    [string] $BaseUrl = "http://127.0.0.1:8081",
    [string] $LoginEmail = "",
    [string] $LoginPassword = ""
)

$ErrorActionPreference = "Stop"

function Test-Get($path) {
    $r = Invoke-WebRequest -Uri "$BaseUrl$path" -Method GET -UseBasicParsing
    Write-Host "GET $path -> $($r.StatusCode)"
}

Write-Host "=== Smoke test $BaseUrl ==="

Test-Get "/api/cars/getAll"
Test-Get "/api/rentals/insurance-options"

if ($LoginEmail -and $LoginPassword) {
    $loginBody = "{`"email`":`"$LoginEmail`",`"password`":`"$LoginPassword`",`"id`":0}"
    try {
        $r = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json; charset=utf-8" -UseBasicParsing
        Write-Host "POST /api/auth/login -> $($r.StatusCode)"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "POST /api/auth/login -> HTTP $code"
    }
} else {
    Write-Host "POST /api/auth/login — bỏ qua (truyền -LoginEmail và -LoginPassword để thử đăng nhập)"
}

Write-Host "=== Xong ==="
