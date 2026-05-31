#!/usr/bin/env bash
# 01-bootstrap-vps.sh — install Docker, Nginx, Certbot, UFW on a fresh Ubuntu 22.04 host.
# Usage: sudo bash deploy/scripts/01-bootstrap-vps.sh
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run with sudo: sudo bash $0"
  exit 1
fi

TARGET_USER="${SUDO_USER:-khangtd}"

echo "==> apt update + base tools"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  ca-certificates curl gnupg lsb-release ufw nginx certbot python3-certbot-nginx git dnsutils

echo "==> Install Docker Engine + compose plugin (idempotent)"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

echo "==> Add user '${TARGET_USER}' to docker group"
if id "${TARGET_USER}" >/dev/null 2>&1; then
  usermod -aG docker "${TARGET_USER}"
fi

echo "==> Configure UFW (allow OpenSSH/80/443)"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
yes | ufw enable || true
ufw status

echo "==> Versions"
docker --version
docker compose version
nginx -v
certbot --version

echo "==> Done. Log out & back in (or run 'newgrp docker') so '${TARGET_USER}' picks up the docker group."
