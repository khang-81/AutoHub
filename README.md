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

- **Web:** http://localhost:3000
- **API:** http://localhost:8088

## Default Accounts

- Admin: `admin@autohub.id.vn` / `admin123@`
- User: `user@autohub.id.vn` / `admin123@`

## Regenerate car seed (optional)

```bash
python scripts/build_car_catalog_35.py
node scripts/gen-car-seed.js
python scripts/patch_autohub_schema_cars.py
```
