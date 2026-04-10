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
   | `VITE_API_URL` | URL API mà **trình duyệt** gọi — local thường là `http://localhost:8081` |
   | `APP_CORS_ALLOWED_ORIGINS` | Origin trang web, phân cách bằng dấu phẩy — với Nginx mặc định: `http://localhost:8080,http://127.0.0.1:8080` |

3. **Build và chạy**:

   ```bash
   docker compose up --build
   ```

4. **Mở ứng dụng**

   - Giao diện: **http://localhost:8080** (đổi bằng `WEB_PORT` trong `.env` nếu cần)
   - API: **http://localhost:8081** (đổi bằng `API_PORT`)

### Dịch vụ trong Compose

| Service | Mô tả |
|---------|--------|
| `db` | SQL Server 2022 (`linux/amd64`), cổng host mặc định **1433** |
| `db-init` | Chạy một lần: tạo database `rentacar` nếu chưa có |
| `api` | Spring Boot, profile **`prod`**, volume `uploads_data` cho file KYC |
| `web` | Static React + **Nginx** (SPA routing) |

**Đổi `VITE_API_URL`:** phải build lại image web:

```bash
docker compose build web --no-cache && docker compose up -d
```

**Apple Silicon:** image dùng `platform: linux/amd64` — có thể chậm hơn do emulation.

**Lỗi `db-init`:** nếu không build được (mạng tới repo Microsoft), tạo DB `rentacar` thủ công rồi chỉnh `depends_on` trong `docker-compose.yml` (xem comment trong file).

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
| Frontend | `cd frontend` → `npm install` → `npm run dev` (Vite, thường cổng 3000/5173 tùy cấu hình) |

`VITE_API_URL` trong `frontend/.env` trỏ tới API (mặc định code: `http://localhost:8081`).

---

## Cấu hình & bí mật

- Không commit API key / mật khẩu thật. Xem `backend/rentACar/env.example`, `docker-compose.env.example`, `application-local.properties.example` (file `application-local.properties` đã gitignore).

---

## Kiểm thử & CI

- **CI (GitHub Actions):** `mvn compile` + `npm run build` — `.github/workflows/ci.yml`
- **Smoke API (khi API đã chạy):** `powershell -File scripts/smoke-test.ps1` — thêm `-LoginEmail` / `-LoginPassword` để thử đăng nhập

---

## Kiến trúc & công nghệ

- **Backend:** Spring Boot, JPA/Hibernate, SQL Server, JWT, Lombok, ModelMapper  
- **Frontend:** React 19, Vite, TanStack Query, Tailwind  
- **Deploy:** Docker Compose (SQL Server + API + Nginx)

---

## Contributors

- [Hazar Akatay](https://github.com/EarthCaspian)
- [Senem Yılmaz](https://github.com/senemyilmazz)
- [Duygu Şen Tosunoğlu](https://github.com/duygusen)
- [İnci Gülçin Durak Yolcu](https://github.com/InciGulcinDY)

## Acknowledgements

Thanks to [Halit Enes Kalaycı](https://github.com/halitkalayci) and the [TOBETO](https://www.linkedin.com/company/tobeto/) / [İstanbul Kodluyor](https://www.linkedin.com/in/istanbul-kodluyor-09b981288/) program.
