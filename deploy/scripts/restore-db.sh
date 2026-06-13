#!/usr/bin/env bash
# restore-db.sh — restore SQL Server `autohub` from a .bak file (overwrites existing DB).
# Usage (on VPS, from repo root):
#   bash deploy/scripts/restore-db.sh /path/to/autohub-YYYY-MM-DD-HHMM.bak
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: bash $0 /path/to/autohub.bak"
  exit 1
fi

BAK_FILE="$(realpath "$1")"
if [[ ! -f "${BAK_FILE}" ]]; then
  echo "ERROR: file not found: ${BAK_FILE}"
  exit 1
fi

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
BAK_NAME="$(basename "${BAK_FILE}")"
CONTAINER_PATH="/var/opt/mssql/backup/${BAK_NAME}"
SQL_FILE="/tmp/restore-autohub.sql"

cd "${REPO_DIR}"

echo "==> Stop API (release DB connections)"
docker compose stop api

echo "==> Copy backup into sqlserver container"
docker compose exec -T sqlserver bash -c "mkdir -p /var/opt/mssql/backup"
docker compose cp "${BAK_FILE}" "sqlserver:${CONTAINER_PATH}"

cat > /tmp/restore-autohub.sql <<EOF
ALTER DATABASE autohub SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
RESTORE DATABASE autohub FROM DISK='${CONTAINER_PATH}' WITH REPLACE;
ALTER DATABASE autohub SET MULTI_USER;
EOF
docker compose cp /tmp/restore-autohub.sql "sqlserver:${SQL_FILE}"

echo "==> Restore database (REPLACE)"
docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -i '"${SQL_FILE}"

docker compose exec -T sqlserver bash -c "rm -f '${CONTAINER_PATH}' '${SQL_FILE}'" || true
rm -f /tmp/restore-autohub.sql || true

echo "==> Start API"
docker compose start api

echo "==> Done. Restored from ${BAK_FILE}"
