# AutoHub

AutoHub is a full-stack car rental and sales platform with KYC, booking, payments, reviews, and admin operations.

## Tech Stack

- **Backend:** Spring Boot 3, Spring Security 6 (JWT), JPA/Hibernate, Flyway
- **Frontend:** React 19, Vite, TanStack Query, Tailwind CSS, Zustand
- **Database:** SQL Server (Docker local)
- **E2E Testing:** Playwright
- **Deployment:** Docker Compose (recommended), Render + Vercel (cloud)

## Architecture

```
┌──────────────┐        ┌──────────────┐       ┌───────────┐
│  React SPA   │──API──▶│  Spring Boot │──JPA─▶│ SQL Server│
│  (Vite)      │        │  REST + JWT  │       └───────────┘
└──────────────┘        └──────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
               Flyway     Email     File Storage
```

## Project Structure

```
├── backend/rentACar/          # Spring Boot API
│   ├── src/main/java/com/tobeto/rentACar/
│   │   ├── controllers/       # REST endpoints
│   │   ├── entities/          # JPA entities
│   │   ├── repositories/      # Spring Data repos
│   │   ├── services/          # Business logic (abstracts + concretes)
│   │   └── core/              # Security, filters, config, utilities
│   └── src/main/resources/
│       ├── application.properties
│       └── db/migration/      # Flyway SQL migrations
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── api/               # Axios API clients
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages (admin/, user/, public/)
│   │   ├── store/             # Zustand stores
│   │   └── types/             # TypeScript interfaces
│   └── vite.config.ts
├── e2e/                       # Playwright E2E tests
│   ├── tests/
│   └── playwright.config.ts
└── docker-compose.yml
```

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

- Admin: `admin@autohub.id.vn` / `admin123@`
- User: `tester@gmail.com` / `123456`

## Local Development (Without Docker)

**Backend:**

```bash
cd backend/rentACar
mvn spring-boot:run
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## Testing

### E2E Tests (Playwright)

```bash
cd e2e
npm install
npx playwright install chromium
npx playwright test
```

Set `BASE_URL` env var to point to your running frontend (default: `http://localhost:3000`).

### Run headed (debug):

```bash
npx playwright test --headed
```

## API Highlights

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | POST | No | Register customer |
| `/api/auth/login` | POST | No | Login, returns JWT |
| `/api/cars/**` | GET | No | Browse cars |
| `/api/rentals` | POST | User | Create rental |
| `/api/viewing-appointments` | POST | User | Book viewing |
| `/api/reports/rentals/excel` | GET | Admin | Export report |
| `/api/reviews/admin/{id}/reply` | PUT | Admin | Reply to review |

## Security

- JWT authentication with token versioning
- Rate limiting on `/api/auth/**` (10 req/min per IP)
- CORS configured for frontend origin
- `/files/**` and `/api/ai/**` require authentication
- Passwords hashed with BCrypt

## Database Migrations

Flyway handles schema migrations in `backend/rentACar/src/main/resources/db/migration/`.

- `V1__add_performance_indexes.sql` — indexes for common queries

Add new migrations as `V{N}__{description}.sql`.

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

# Run E2E tests
cd e2e && npx playwright test
```

## Contributors

- [Hazar Akatay](https://github.com/EarthCaspian)
- [Senem Yılmaz](https://github.com/senemyilmazz)
- [Duygu Şen Tosunoğlu](https://github.com/duygusen)
- [İnci Gülçin Durak Yolcu](https://github.com/InciGulcinDY)
