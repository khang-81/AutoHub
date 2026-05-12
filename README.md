# AutoHub

AutoHub is a full-stack car rental and sales platform with KYC, booking, payments, reviews, and admin operations.

## Tech Stack

- **Backend:** Spring Boot 3, Spring Security 6 (JWT), JPA/Hibernate, Flyway
- **Frontend:** React 19, Vite, TanStack Query, Tailwind CSS, Zustand
- **Database:** SQL Server (Docker local)
- **E2E Testing:** Playwright
- **Deployment:** Docker Compose (recommended), Render + Vercel (cloud)


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

- Admin: `admin@autohub.local` / `12345678`
- User: `user@autohub.local` / `12345678`

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

