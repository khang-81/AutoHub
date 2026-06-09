# Dev stack: API + DB (Docker) + Vite HMR (Docker)
# Usage: .\scripts\dev-up.ps1
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

docker rm -f rentacar-web-1 2>$null | Out-Null
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build @args
