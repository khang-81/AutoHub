# AutoHub

Modern full-stack car rental and vehicle marketplace platform.

## Features

- Car rental & vehicle listings
- JWT authentication & role-based access
- Booking & invoice management
- Bank transfer payment flow
- Reviews & admin dashboard

## Tech Stack

- **Backend:** Spring Boot 3, Spring Security, JWT, JPA/Hibernate, Flyway
- **Frontend:** React 19, Vite, Tailwind CSS, Zustand
- **Database:** SQL Server 2022
- **Deployment:** Docker Compose + Nginx + Let's Encrypt SSL

## Production

Deployed on VPS with custom domain:

🌐 [autohub.id.vn](https://autohub.id.vn)

## Infrastructure

- Dockerized full-stack application
- Host Nginx reverse proxy
- HTTPS with Let's Encrypt
- SQL Server running in Docker
- CI-friendly deployment scripts

## Quick Start

### Run locally

```bash
cp docker-compose.env.example .env
docker compose up --build -d
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8080

## Project Structure

```
backend/           # Spring Boot API
frontend/          # React frontend
deploy/            # VPS deployment scripts & Nginx config
docker-compose.yml
```

## VPS Deployment

```bash
bash deploy/scripts/01-bootstrap-vps.sh
bash deploy/scripts/02-deploy.sh
```

## Update Production

```bash
bash deploy/scripts/update.sh
```

## Database Backup

```bash
bash deploy/scripts/backup-db.sh
```
