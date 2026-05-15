#!/usr/bin/env bash
# Dong bo DB demo (tai khoan admin123@, 30 xe, don mau) khop local — chay tren VPS sau git pull.
# Usage: bash deploy/scripts/sync-db-demo.sh
set -euo pipefail
REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${REPO_DIR}"

echo "==> Rebuild db-init image (sync-demo-data.sql)"
docker compose build db-init

echo "==> Run one-shot sync (SQL Server must be up)"
docker compose run --rm --no-deps db-init

echo "==> Restart API to refresh connections"
docker compose restart api

echo "==> Done. Login: admin@autohub.id.vn / admin123@ (or APP_ADMIN_SEED_PASSWORD in .env)"
