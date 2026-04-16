# AutoHub 

AutoHub is a full-stack car rental and sales platform with KYC, booking, payments, reviews, and admin operations.

## Tech Stack

- Backend: Spring Boot, Spring Security (JWT), JPA/Hibernate
- Frontend: React, Vite, TanStack Query, Tailwind CSS
- Database: SQL Server (Docker local), PostgreSQL-compatible setup supported for cloud
- Deployment: Docker Compose (recommended)

## Quick Start (Docker)

1. Copy environment template:

```bash
cp docker-compose.env.example .env
```

2. Update required values in `.env` (at least `MSSQL_SA_PASSWORD`, `JWT_KEY`).

3. Build and start:

```bash
docker compose up --build
```

4. Open:

- Web: `http://localhost:3000`
- API: `http://localhost:8081`

## Default Accounts (Seed Data)

- Admin: `admin@autohub.local` / `12345678`
- User: `user@autohub.local` / `12345678`

## Local Development (Without Docker)

- Backend:

```bash
cd backend/rentACar
mvn spring-boot:run
```

- Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Environment Notes

- Do not commit secrets.
- Docker Compose reads variables from root `.env`.
- For OTP email delivery, set `MAIL_USERNAME` and `MAIL_PASSWORD` (Gmail App Password recommended).
- `FRONTEND_URL` should match the web URL used by users (used in password reset email flow).

## Common Commands

```bash
# Rebuild only API
docker compose build api --no-cache

# Rebuild only web
docker compose build web --no-cache

# Stop and remove containers
docker compose down
```

## Contributors

- [Hazar Akatay](https://github.com/EarthCaspian)
- [Senem Yılmaz](https://github.com/senemyilmazz)
- [Duygu Şen Tosunoğlu](https://github.com/duygusen)
- [İnci Gülçin Durak Yolcu](https://github.com/InciGulcinDY)
