#!/usr/bin/env bash
# restore-uploads.sh — restore /app/uploads from a tar.gz archive.
# Usage (on VPS, from repo root):
#   bash deploy/scripts/restore-uploads.sh /path/to/uploads-YYYY-MM-DD-HHMM.tar.gz
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: bash $0 /path/to/uploads.tar.gz"
  exit 1
fi

ARCHIVE="$(realpath "$1")"
if [[ ! -f "${ARCHIVE}" ]]; then
  echo "ERROR: file not found: ${ARCHIVE}"
  exit 1
fi

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${REPO_DIR}"

echo "==> Stop API"
docker compose stop api || true

echo "==> Restore /app/uploads (override entrypoint, no Spring Boot)"
docker compose run --rm --no-deps --entrypoint sh \
  -v "${ARCHIVE}:/tmp/uploads-restore.tar.gz:ro" \
  api -c "rm -rf /app/uploads/* && tar xzf /tmp/uploads-restore.tar.gz -C /app/uploads"

echo "==> Start API"
docker compose start api

echo "==> Done. Restored uploads from ${ARCHIVE}"
