#!/usr/bin/env bash
# update.sh — sync repo to remote, rebuild containers, clean up old images.
# Run from repo root: bash deploy/scripts/update.sh
#
# Uses fetch + reset --hard to match origin (no merge commits). Any local
# edits to tracked files on the VPS are discarded — intentional for deploy
# clones; .env and other gitignored paths are untouched.
set -euo pipefail
REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${REPO_DIR}"

BRANCH="$(git symbolic-ref -q --short HEAD || true)"
if [[ -z "${BRANCH}" ]]; then
  echo "ERROR: not on a branch (detached HEAD). Run: git checkout main   (or dev)"
  exit 1
fi

echo "==> git fetch + reset to origin/${BRANCH}"
git fetch origin
git reset --hard "origin/${BRANCH}"

echo "==> Rebuild and restart"
docker compose up -d --build

echo "==> Health"
sleep 10
docker compose ps

echo "==> Prune dangling images"
docker image prune -f
