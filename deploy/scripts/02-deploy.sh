#!/usr/bin/env bash
# 02-deploy.sh — build & run docker stack, install nginx vhost, request SSL.
# Run from the repo root on the VPS:
#   cd /opt/apps/Do_An_Deploy/AutoHub
#   bash deploy/scripts/02-deploy.sh
#
# Prereqs:
#   - .env already populated (see deploy/env.production.example)
#   - autohub.id.vn DNS A-record points to this VPS IP
#   - User is in docker group (or run with sudo)
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
DOMAIN="autohub.id.vn"
EMAIL="admin@${DOMAIN}"
VHOST_SRC="${REPO_DIR}/deploy/nginx/${DOMAIN}.conf"
VHOST_DST="/etc/nginx/sites-available/${DOMAIN}.conf"
VHOST_LINK="/etc/nginx/sites-enabled/${DOMAIN}.conf"

echo "==> Repo dir: ${REPO_DIR}"
cd "${REPO_DIR}"

if [[ ! -f .env ]]; then
  echo "ERROR: .env not found at ${REPO_DIR}/.env"
  echo "       Copy deploy/env.production.example to .env and fill in secrets first."
  exit 1
fi
chmod 600 .env || true

echo "==> docker compose up -d --build"
docker compose pull --ignore-pull-failures || true
docker compose up -d --build

echo "==> Wait for API healthcheck (up to ~5 minutes)..."
for i in $(seq 1 60); do
  status="$(docker inspect -f '{{.State.Health.Status}}' rentacar-api-1 2>/dev/null || echo unknown)"
  if [[ "${status}" == "healthy" ]]; then
    echo "API is healthy."
    break
  fi
  printf '.'; sleep 5
done
docker compose ps

echo "==> Smoke test http://127.0.0.1:3000"
curl -sS -o /dev/null -w "web HTTP %{http_code}\n" http://127.0.0.1:3000/ || true
curl -sS -o /dev/null -w "api HTTP %{http_code}\n" http://127.0.0.1:3000/api/actuator/health || true

echo "==> Install nginx vhost for ${DOMAIN}"
sudo cp "${VHOST_SRC}" "${VHOST_DST}"
sudo ln -sf "${VHOST_DST}" "${VHOST_LINK}"
sudo rm -f /etc/nginx/sites-enabled/default
sudo mkdir -p /var/www/html
sudo nginx -t
sudo systemctl reload nginx

echo "==> Test HTTP access via domain (should be 200/301)"
curl -sS -o /dev/null -w "http://${DOMAIN}/ -> HTTP %{http_code}\n" "http://${DOMAIN}/" || true

echo "==> Request SSL certificate via Let's Encrypt"
echo "    (Skipped automatically if DNS not resolving yet.)"
if getent hosts "${DOMAIN}" >/dev/null; then
  sudo certbot --nginx \
    -d "${DOMAIN}" -d "www.${DOMAIN}" \
    --redirect --agree-tos -m "${EMAIL}" --no-eff-email --non-interactive
  echo "==> SSL installed. certbot will auto-renew via systemd timer."
  sudo systemctl status certbot.timer --no-pager | head -n 10 || true
else
  echo "WARN: ${DOMAIN} is NOT resolving from this VPS yet. Skipping certbot."
  echo "      After DNS propagates, run:"
  echo "      sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --redirect --agree-tos -m ${EMAIL} --no-eff-email"
fi

echo "==> Final smoke test"
curl -sS -o /dev/null -w "https://${DOMAIN}/ -> HTTP %{http_code}\n" "https://${DOMAIN}/" || true
echo "==> Done."
