# Rent-A-Car Web Application Backend Project | Java Spring Boot Project

## Overview

This repository hosts the backend codebase for rent a car, a sophisticated Rent-A-Car web application crafted as a pivotal component of the [TOBETO](https://www.linkedin.com/company/tobeto/) Java-React Full-Stack Developer program. This meticulously engineered application empowers users to seamlessly peruse, explore, and lease vehicles from an extensive catalog within a virtual car rental ecosystem.

## Backend Operations

### Database Connection

The backend handles database operations using Java Spring Boot and Hibernate ORM. It connects to a SQL Server database (configurable), where vehicle information, user data, and rental history are stored.

### CRUD Operations

The backend facilitates basic CRUD (Create, Read, Update, Delete) operations to interact with the database:

- **Create**: Enables the addition of new vehicles, user accounts, and rental records.
- **Read**: Retrieves vehicle information, user details, and rental history.
- **Update**: Allows modification of vehicle details, user profiles, and rental information.
- **Delete**: Permits the removal of vehicles from the catalog, user accounts, and rental records.

These operations ensure the smooth functioning of the Rent-A-Car platform, providing users with a seamless experience while managing data efficiently.


For further insights, we invite you to explore the [frontend repository](https://github.com/EarthCaspian/project-rbride).

## Contributors
- [Hazar Akatay](https://github.com/EarthCaspian)
- [Senem Yılmaz](https://github.com/senemyilmazz)
- [Duygu Şen Tosunoğlu](https://github.com/duygusen)
- [İnci Gülçin Durak Yolcu](https://github.com/InciGulcinDY)

## N-Layered Architecture

Our project is structured with an N-layered architecture, meticulously designed to promote clean code and scalability. This architectural approach allows for the separation of concerns and modularization of components, ensuring ease of maintenance, extensibility, and testability.

### Key Layers:

- **Controller Layer**: Responsible for handling user interaction and interface rendering. It includes components such as controllers, views, and UI-related logic.

- **Business Layer**: Contains the core business logic and rules of the application. This layer orchestrates data processing, validation, and business workflows.

- **Data Access Layer**: Handles interactions with the database and data persistence. It encapsulates database operations and ensures data integrity and consistency.

- **Entity Layer**:  The Entity Layer represents the domain model of our application, encapsulating the business entities and their relationships. These entities are the building blocks of our data model and closely mirror the real-world objects and concepts our application deals with.

### Benefits:

- **Modularity**: Each layer is self-contained, promoting code reusability and maintainability. New features or changes can be implemented with minimal impact on other layers.

- **Scalability**: The architecture accommodates growth and evolution by allowing additional layers or components to be seamlessly integrated.

- **Clean Code**: Clear separation of concerns and well-defined boundaries between layers result in cleaner, more readable code. This fosters collaboration and simplifies debugging and troubleshooting.

- **Flexibility**: The layered structure facilitates the adoption of new technologies or frameworks. Adding new databases, integrating external services, or adopting microservices architecture becomes straightforward, thanks to the clear separation of concerns and modular design.

By adhering to this robust N-layered architecture, our project exemplifies a commitment to best practices, ensuring a solid foundation for current and future development endeavors.

## Technologies Used

### Development Tools
- Java
- Spring

### Database
- SQL Server (configurable in `application.properties`)

### Libraries
- JPA
- Hibernate
- Lombok
- Model Mapper
- Json Web Token

## Getting Started

### Prerequisites
Before proceeding, ensure you have the following installed on your system:
- Java Development Kit (JDK)
- Maven
- SQL Server (or adjust `application.properties` for your database)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/EarthCaspian/rentACar/tree/main
2. Navigate to the project directory:
    ```bash
    cd rent-a-car
3. Set up the database (this project uses **SQL Server** by default — see `backend/rentACar/src/main/resources/application.properties` for URL, username, and password).
4. Build and run the backend (default API port **8081** — see `backend/rentACar/src/main/resources/application.properties`):
    ```bash
    cd backend/rentACar
    mvn spring-boot:run
    ```
5. Install frontend dependencies:
    ```bash
    cd frontend
    npm install
    ```
6. Start the frontend dev server (Vite):
    ```bash
    npm run dev
    ```
7. Open the URL shown in the terminal (typically **http://localhost:5173**).

### Frontend environment (`VITE_API_URL`)

The React app reads the API base URL from Vite env vars (`src/config/api.ts`).

| Environment | What to set |
|-------------|----------------|
| Local dev | Optional. If omitted, the client defaults to `http://localhost:8081`. |
| Production / staging | Set **`VITE_API_URL`** to your deployed API origin, **no trailing slash**, e.g. `https://your-domain.com` or `https://api.your-domain.com`. |

Steps:

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Set `VITE_API_URL=https://...` to match where Spring Boot is reachable from the browser (same host/CORS as configured on the server).
3. Run `npm run build` and serve the `frontend/dist` folder with your static host (Nginx, Netlify, Vercel, etc.).

Rebuild the frontend whenever you change `VITE_API_URL`, because Vite inlines these values at build time.

### Backend CORS (`app.cors.allowed-origins`)

The API only accepts browser requests from origins listed in **`app.cors.allowed-origins`** (comma-separated, no spaces required after commas). Defaults include common local dev URLs (`http://localhost:5173`, etc.).

When you deploy the frontend to a public URL, add that **exact origin** (scheme + host + port, no path), for example:

```properties
app.cors.allowed-origins=http://localhost:5173,https://your-app.example.com
```

Restart the Spring Boot process after changing this file. The frontend origin must match what users open in the browser; it should correspond to the site built with `VITE_API_URL` pointing at this API.

### Production profile (`prod`) & environment variables

For deployment, run the API with **`SPRING_PROFILES_ACTIVE=prod`**. Settings in `backend/rentACar/src/main/resources/application-prod.properties` expect **secrets from the environment**, not committed files.

| Variable | Required (prod) | Purpose |
|----------|-------------------|---------|
| `SPRING_DATASOURCE_URL` | Yes | JDBC URL for SQL Server |
| `SPRING_DATASOURCE_USERNAME` | Yes | DB user |
| `SPRING_DATASOURCE_PASSWORD` | Yes | DB password |
| `JWT_KEY` | Yes | Base64 JWT secret (same rules as dev `jwt.key` in code) |
| `APP_CORS_ALLOWED_ORIGINS` | Yes | Comma-separated frontend origins (see CORS section above) |

Optional: `JWT_EXPIRATION`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `GEMINI_API_KEY`, `PORT`, `APP_UPLOAD_ROOT`, `JPA_DDL_AUTO` (first deploy may use `update`, then prefer `validate`).

Copy `backend/rentACar/env.example` as a checklist for your host.

### Docker Compose (SQL Server + API)

From the **repository root** (where `docker-compose.yml` lives):

1. Copy `docker-compose.env.example` to **`.env`** and set at least `MSSQL_SA_PASSWORD`, `JWT_KEY`, and `APP_CORS_ALLOWED_ORIGINS` (must match your frontend origin).
2. Run:

   ```bash
   docker compose up --build
   ```

Services:

- **`db`**: Microsoft SQL Server 2022 (`linux/amd64`), port **1433** by default (`MSSQL_PORT` in `.env` to change the host mapping).
- **`db-init`**: one-shot container that waits for SQL Server and runs `CREATE DATABASE rentacar` if missing (uses `docker/sqlserver-init`).
- **`api`**: Spring Boot on port **8081** (`API_PORT` to remap), profile **`prod`**, upload files under a Docker volume `uploads_data`.
- **`web`**: React build served by **Nginx** (default host port **8080** → `WEB_PORT`). Built with `VITE_API_URL` from `.env` (must be an URL your **browser** can reach — usually `http://localhost:8081` when API is published on the same machine).

**Frontend + API in Docker:** set `VITE_API_URL` to the API origin as seen from the browser (e.g. `http://localhost:8081` if `API_PORT` is 8081). Set `APP_CORS_ALLOWED_ORIGINS` to include the **exact** frontend origin you open (e.g. `http://localhost:8080` when `WEB_PORT=8080`). Rebuild `web` after changing `VITE_API_URL` (`docker compose build web --no-cache`).

**Frontend without Docker:** run `npm run dev` locally; default API URL stays `http://localhost:8081` unless `VITE_API_URL` is set.

**Notes:** SQL Server and the init image target **amd64** (`platform: linux/amd64`). On Apple Silicon this uses emulation and may be slower. If `db-init` fails (network to Microsoft apt repos), create the `rentacar` database manually and comment out the `depends_on` / `db-init` service in `docker-compose.yml` as a fallback.

Example (non-Docker prod):

```bash
cd backend/rentACar
set SPRING_PROFILES_ACTIVE=prod
set SPRING_DATASOURCE_URL=jdbc:sqlserver://...
set JWT_KEY=...
set APP_CORS_ALLOWED_ORIGINS=https://your-app.example.com
mvn spring-boot:run
```

(On Linux/macOS use `export` instead of `set`.)

### Usage
Once the application is running, you can sign up for an account, browse available vehicles, search for specific vehicles, reserve them for specific dates, and view your rental history.

### Additional Notes
Start the backend before the frontend so API calls succeed. Configure the database and JWT settings in `application.properties` (or profile-specific files) for your machine.

### Secrets & local overrides

Do **not** commit real API keys or mail passwords. The tracked `application.properties` uses environment variables (e.g. `MAIL_*`, `GEMINI_API_KEY`, `SPRING_DATASOURCE_*`, `JWT_KEY`) with safe dev defaults where appropriate. For overrides without exporting env vars, copy `application-local.properties.example` to `application-local.properties` under `backend/rentACar/src/main/resources/` (that filename is gitignored).

### CI

On push/PR to `main`, `master`, or `develop`, GitHub Actions runs backend `mvn compile` and frontend `npm run build` (see `.github/workflows/ci.yml`).

### Demo data (profile `demo`)

For grading / quick testing, run the API with **`SPRING_PROFILES_ACTIVE=demo`** (or `mvn spring-boot:run -Dspring-boot.run.profiles=demo`). On first boot, seed data creates:

- Roles **`user`** and **`admin`** (if missing).
- **`demo.admin@localhost`** / **`Demo@12345`** — admin.
- **`demo.user@localhost`** / **`Demo@12345`** — customer with **KYC APPROVED** (can rent without uploading KYC).
- One car **Toyota Vios**, plate **`HN-DEMO-01`**, **Hà Nội**.

Re-run is safe: users are skipped if emails already exist; the car is skipped if plate `HN-DEMO-01` exists.

**Do not** enable `demo` on production.

### Manual smoke test (checklist)

1. Backend + frontend (or Docker `web` + `api`).
2. Login as `demo.admin@localhost` → open admin area (cars, rentals, KYC).
3. Login as `demo.user@localhost` → browse cars → book a rental → payment flow if applicable.
4. (Optional) Register a new user and complete KYC flow.

## Acknowledgements
We extend our sincere appreciation to [Halit Enes Kalaycı](https://github.com/halitkalayci) for his invaluable guidance throughout the [TOBETO](https://www.linkedin.com/company/tobeto/) Java-React Full-Stack Developer program, conducted under the auspices of the [İstanbul Kodluyor Project](https://www.linkedin.com/in/istanbul-kodluyor-09b981288/).
