# Deploy AutoHub trên VPS (Docker + Nginx + Let's Encrypt)

Bộ file này dùng để triển khai AutoHub lên VPS Ubuntu 22.04 với domain `autohub.id.vn`.

## Cấu trúc

- `nginx/autohub.id.vn.conf` — vhost Nginx host (đặt cùng máy, làm reverse proxy + endpoint cho SSL)
- `env.production.example` — mẫu `.env` production (sao vào `/opt/apps/Do_An_Deploy/AutoHub/.env`)
- `scripts/01-bootstrap-vps.sh` — cài Docker, Nginx, Certbot, UFW
- `scripts/02-deploy.sh` — build + chạy compose, cài vhost, xin SSL
- `scripts/update.sh` — `git pull` + rebuild
- `scripts/backup-db.sh` — backup DB hằng ngày (gọi qua cron)

## Quy trình lần đầu

```bash
# 1) Trên trang quản lý domain: tạo A-record @ và www → IP VPS (165.99.16.29). Verify:
dig +short autohub.id.vn @8.8.8.8

# 2) SSH vào VPS với quyền sudo
ssh khangtd@165.99.16.29
cd /opt/apps/Do_An_Deploy/AutoHub
git pull

# 3) Bootstrap (1 lần)
sudo bash deploy/scripts/01-bootstrap-vps.sh
newgrp docker        # hoặc logout + login lại

# 4) Tạo .env production
cp deploy/env.production.example .env
openssl rand -base64 48     # paste làm JWT_KEY
openssl rand -base64 18     # paste làm MSSQL_SA_PASSWORD (nhớ thêm ký tự hoa+thường+số+đặc biệt)
nano .env
chmod 600 .env

# 5) Build, chạy stack, cài vhost, xin SSL
bash deploy/scripts/02-deploy.sh
```

## Update code mới

```bash
cd /opt/apps/Do_An_Deploy/AutoHub
bash deploy/scripts/update.sh
```

## Backup DB

```bash
# Test thủ công
sudo bash deploy/scripts/backup-db.sh

# Schedule daily 3 AM
sudo crontab -e
# Thêm dòng:
# 0 3 * * * /opt/apps/Do_An_Deploy/AutoHub/deploy/scripts/backup-db.sh >> /var/log/autohub-backup.log 2>&1
```

## Troubleshooting nhanh

```bash
docker compose ps
docker compose logs -f api
sudo nginx -t
sudo journalctl -u nginx -f
sudo certbot certificates
```
