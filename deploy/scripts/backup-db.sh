#!/usr/bin/env bash
# backup-db.sh — dump SQL Server `autohub` DB into a .bak file with date stamp.
# Schedule via cron: 0 3 * * * /opt/apps/Do_An_Deploy/AutoHub/deploy/scripts/backup-db.sh >> /var/log/autohub-backup.log 2>&1
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/autohub}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%F-%H%M)"

cd "${REPO_DIR}"
mkdir -p "${BACKUP_DIR}"

# Load env to pick up MSSQL_SA_PASSWORD
set -a; . ./.env; set +a

# Backup inside the container, then copy out
docker compose exec -T sqlserver bash -c "mkdir -p /var/opt/mssql/backup && \
  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P \"\$MSSQL_SA_PASSWORD\" -C \
  -Q \"BACKUP DATABASE autohub TO DISK='/var/opt/mssql/backup/autohub-${STAMP}.bak' WITH INIT, COMPRESSION, FORMAT;\""

docker compose cp "sqlserver:/var/opt/mssql/backup/autohub-${STAMP}.bak" "${BACKUP_DIR}/autohub-${STAMP}.bak"
docker compose exec -T sqlserver bash -c "rm -f /var/opt/mssql/backup/autohub-${STAMP}.bak"

# Retention
find "${BACKUP_DIR}" -name 'autohub-*.bak' -mtime "+${KEEP_DAYS}" -delete

echo "Backup OK: ${BACKUP_DIR}/autohub-${STAMP}.bak"
