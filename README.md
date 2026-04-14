# Rent-A-Car (AutoHub)

Ứng dụng thuê xe full-stack: **Spring Boot** (API) + **React / Vite** (giao diện), SQL Server, JWT, KYC, đặt xe / cọc / đánh giá.

---

## Chạy toàn bộ bằng Docker (khuyến nghị)

Không cần cài Maven hay `npm install` trên máy — Docker build **backend** và **frontend** trong image.

### Yêu cầu

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (hoặc Docker Engine + Compose v2)

### Các bước

1. **Clone** repo và vào thư mục gốc (nơi có `docker-compose.yml`).

2. **Tạo file `.env`** từ mẫu:

   ```bash
   cp docker-compose.env.example .env
   ```

   Chỉnh tối thiểu:

   | Biến | Ý nghĩa |
   |------|---------|
   | `MSSQL_SA_PASSWORD` | Mật khẩu SA SQL Server (đủ mạnh theo yêu cầu Microsoft) |
   | `JWT_KEY` | Secret JWT dạng Base64 (giống `jwt.key` khi dev) |
   | `VITE_API_URL` | Chủ yếu cho **`npm run dev`** (file `frontend/.env`). Stack Docker: web image build với URL rỗng — trình duyệt gọi **`/api/...` trên cùng cổng** với Nginx (proxy tới container `api`) |
   | `APP_CORS_ALLOWED_ORIGINS` | Origin trang web (phải **trùng** URL bạn mở). Docker web mặc định cổng **3000** — nên có `http://localhost:3000` trong danh sách |

3. **Build và chạy**:

   ```bash
   docker compose up --build
   ```

4. **Mở ứng dụng**

   - Giao diện (Nginx / static build): **http://localhost:3000** (mặc định `WEB_PORT=3000`; **không** phải chỉ có khi chạy `npm run dev` — đó là cùng cổng mặc định). Đổi cổng bằng `WEB_PORT` trong `.env` nếu bị trùng app khác.
   - API: **http://localhost:8081** (đổi bằng `API_PORT`)

### Tài khoản admin (duyệt KYC, quản trị)

Sau khi `db-init` chạy script `docker/sqlserver-init/autohub-full-schema.sql`, đã có sẵn user **admin**:

| Trường | Giá trị |
|--------|---------|
| Email | `admin@autohub.local` |
| Mật khẩu | `12345678` |
| Vai trò | `admin` (bảng `users_roles`) |

Với **Docker Compose**, API mỗi lần khởi động đồng bộ lại admin theo `APP_ADMIN_SEED_EMAIL` / `APP_ADMIN_SEED_PASSWORD` (mặc định trong `docker-compose.yml`: `admin@autohub.local` / `12345678`). Production có thể đặt `APP_ADMIN_SEED_PASSWORD=` (rỗng) trong `.env` để tắt.

- Đăng nhập khu vực quản trị: **http://localhost:3000/admin/login** (hoặc đăng nhập tại `/login` bằng cùng tài khoản — hệ thống sẽ lưu phiên admin và chuyển tới `/admin`).
- Truy cập **http://localhost:3000/admin** khi chưa đăng nhập admin sẽ được chuyển tới `/admin/login`.

Tài khoản demo user thường: `user@autohub.local` / `12345678` (role `user`).

### Dịch vụ trong Compose

| Service | Mô tả |
|---------|--------|
| `db` | SQL Server 2022 (`linux/amd64`), cổng host mặc định **1433** |
| `db-init` | Chạy một lần: tạo database `autohub` và nạp `docker/sqlserver-init/autohub-full-schema.sql` nếu chưa có bảng |
| `api` | Spring Boot, profile **`prod`**, volume `uploads_data` cho file KYC |
| `web` | Static React + **Nginx** (SPA routing) |

**Sau khi sửa `nginx.conf` hoặc logic API URL:** build lại image web:

```bash
docker compose build web --no-cache && docker compose up -d
```

**Apple Silicon:** image dùng `platform: linux/amd64` — có thể chậm hơn do emulation.

**Lỗi `db-init`:** nếu không build được (mạng tới repo Microsoft), tạo DB `autohub` thủ công và chạy script SQL trong `docker/sqlserver-init/autohub-full-schema.sql`, rồi chỉnh `depends_on` trong `docker-compose.yml` nếu cần.

**Container `db` thoát mã 255 / log `Password validation failed`:** `MSSQL_SA_PASSWORD` trong `.env` quá yếu. Đặt mật khẩu đủ phức tạp (ví dụ giống dòng mẫu trong `docker-compose.env.example`), sau đó `docker compose down -v` (xóa volume DB cũ nếu lần đầu đã hỏng) rồi `docker compose up --build` lại.

**`db-init` exit 1 / Msg 904 / `Failed to open database autohub`:** thường do SQL Server chưa recovery xong nhưng init đã chạy. `entrypoint.sh` đã đợi `[autohub]` ONLINE và kiểm tra schema từ `[master]`. Nếu vẫn lỗi: `docker compose build db-init --no-cache` rồi `docker compose up` lại.

**`502 Bad Gateway` trên `/api/...` (qua Nginx):** container `api` chưa sẵn sàng hoặc đã thoát. Xem log: `docker compose logs api --tail 100`. Nếu lỗi Hibernate **validate**, thử `JPA_DDL_AUTO=update` trong `.env` rồi `docker compose up -d api`. Stack hiện đợi `api` **healthy** trước khi chạy `web`.

**API exit 1 / `missing sequence [roles_seq]`:** entity `Role` phải dùng `GenerationType.IDENTITY` cho khớp bảng `roles` trong script SQL (đã sửa trong code). Build lại: `docker compose build api --no-cache && docker compose up -d`.

---

## CORS & bảo mật API

- Trên server thật, thêm origin frontend vào **`app.cors.allowed-origins`** (khi không dùng Compose: `application.properties` / env).
- Với Compose, dùng **`APP_CORS_ALLOWED_ORIGINS`** trong `.env` (đã map vào container `api`).

---

## Chạy API production không Docker (tùy chọn)

Khi không dùng Compose, set **`SPRING_PROFILES_ACTIVE=prod`** và các biến trong `backend/rentACar/application-prod.properties` / `env.example`.

---

## Phát triển local (không Docker)

Chỉ dùng khi sửa code và cần hot-reload.

| Thành phần | Lệnh |
|-------------|------|
| Backend | `cd backend/rentACar` → `mvn spring-boot:run` (cần SQL Server local, xem `application.properties`) |
| Frontend | `cd frontend` → `npm install` → `npm run dev` (Vite mặc định **http://localhost:3000**; nếu cổng bận Vite tự thử cổng khác) |

`VITE_API_URL` trong `frontend/.env` trỏ tới API (mặc định code: `http://localhost:8081`).

**Gỡ lỗi:** Nếu DevTools báo file kiểu `Cars.js` và gọi `http://localhost:4000/carType` — đó **không phải** frontend AutoHub (repo này dùng `CarListing.tsx` và API `/api/cars/...` trên cổng **8081**). Đóng app khác trên **:3000**, chạy `npm run dev` trong `frontend/`, mở đúng URL mà terminal in ra, bật API **8081**. Với Docker API, thêm origin dev vào `APP_CORS_ALLOWED_ORIGINS` (xem `docker-compose.env.example`).

---

## Cấu hình & bí mật

- Không commit API key / mật khẩu thật. Xem `backend/rentACar/env.example`, `docker-compose.env.example`, `application-local.properties.example` (file `application-local.properties` đã gitignore).

---

## Kiểm thử & CI

- **CI (GitHub Actions):** `mvn compile` + `npm run build` — `.github/workflows/ci.yml`
- **Smoke API (khi API đã chạy):** `powershell -File scripts/smoke-test.ps1` — thêm `-LoginEmail` / `-LoginPassword` để thử đăng nhập

---

## Deploy: Vercel + Render + Supabase (PostgreSQL)

Stack cloud này dùng **PostgreSQL (Supabase)** thay cho SQL Server. Backend đọc driver/dialect qua biến môi trường (`SPRING_DATASOURCE_DRIVER_CLASS_NAME`, `SPRING_JPA_DATABASE_PLATFORM`); Docker Compose local **không đổi** (vẫn SQL Server).

### 1. Supabase

1. Tạo project tại [supabase.com](https://supabase.com).
2. **Settings → Database**: lấy chuỗi kết nối **direct** (cổng **5432**), bật SSL.
3. JDBC (đặt trên Render):  
   `jdbc:postgresql://db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require`  
   User: `postgres`, password: mật khẩu database trong Supabase.

### 2. Render (API)

1. [render.com](https://render.com) → **New → Blueprint** (hoặc **Web Service**), chọn repo, dùng `render.yaml` ở gốc repo (Dockerfile: `backend/rentACar/Dockerfile`).
2. **Environment** (bổ sung biến không có trong blueprint):

   | Biến | Giá trị |
   |------|--------|
   | `SPRING_DATASOURCE_URL` | JDBC ở bước Supabase |
   | `SPRING_DATASOURCE_USERNAME` | `postgres` |
   | `SPRING_DATASOURCE_PASSWORD` | Mật khẩu DB |
   | `SPRING_DATASOURCE_DRIVER_CLASS_NAME` | `org.postgresql.Driver` |
   | `SPRING_JPA_DATABASE_PLATFORM` | `org.hibernate.dialect.PostgreSQLDialect` |
   | `JWT_KEY` | Base64 (giống `JWT_KEY` trong Docker; đủ dài cho HS256) |
   | `APP_CORS_ALLOWED_ORIGINS` | URL Vercel, ví dụ `https://ten-app.vercel.app` (không có `/` cuối) |
   | `JPA_DDL_AUTO` | Lần đầu: `update`; sau khi schema ổn có thể `validate` |
   | `APP_ADMIN_SEED_PASSWORD` | (Tuỳ chọn) Mật khẩu admin sau deploy — cần có role `admin` (được tạo tự động lần đầu) |

3. Free tier có **cold start**; lần đầu mở link có thể chờ ~1 phút.

**Lưu ý:** File upload KYC lưu trên disk container Render — **có thể mất khi redeploy**. Đồ án có thể chấp nhận; production thật nên dùng object storage (S3, Supabase Storage).

### 3. Vercel (Frontend)

1. **New Project** → import repo, **Root Directory**: `frontend`.
2. **Environment Variables** (Build + Production):  
   `VITE_API_URL` = URL gốc API Render, ví dụ `https://rentacar-api.onrender.com` (**không** có `/` cuối).
3. Build: `npm run build`, output: `dist` (mặc định Vite). SPA fallback: `frontend/vercel.json`.

Sau khi deploy, cập nhật lại `APP_CORS_ALLOWED_ORIGINS` trên Render nếu Vercel đổi domain preview.

---

## Kiến trúc & công nghệ

- **Backend:** Spring Boot, JPA/Hibernate, SQL Server (Docker) hoặc PostgreSQL (Supabase), JWT, Lombok, ModelMapper  
- **Frontend:** React 19, Vite, TanStack Query, Tailwind  
- **Deploy:** Docker Compose (SQL Server + API + Nginx) hoặc Vercel + Render + Supabase

---

## Contributors

- [Hazar Akatay](https://github.com/EarthCaspian)
- [Senem Yılmaz](https://github.com/senemyilmazz)
- [Duygu Şen Tosunoğlu](https://github.com/duygusen)
- [İnci Gülçin Durak Yolcu](https://github.com/InciGulcinDY)

## Acknowledgements

Thanks to [Halit Enes Kalaycı](https://github.com/halitkalayci) and the [TOBETO](https://www.linkedin.com/company/tobeto/) / [İstanbul Kodluyor](https://www.linkedin.com/in/istanbul-kodluyor-09b981288/) program.
