#!/usr/bin/env bash
# update.sh — pull latest code, rebuild containers, clean up old images.
# Run from repo root: bash deploy/scripts/update.sh
set -euo pipefail
REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${REPO_DIR}"

echo "==> git pull"
git pull --ff-only

echo "==> Rebuild and restart"
docker compose up -d --build

echo "==> Health"
sleep 10
docker compose ps

echo "==> Prune dangling images"
docker image prune -f
