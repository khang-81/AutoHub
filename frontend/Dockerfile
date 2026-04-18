# Build static assets (VITE_* nhúng lúc build) → phục vụ bằng Nginx
# Ghim digest: tránh dùng nhầm tag local (vd. sau khi Compose tag image web trùng tên `node:*` → mất npm).
FROM node:22-bookworm-slim@sha256:f3a68cf41a855d227d1b0ab832bed9749469ef38cf4f58182fb8c893bc462383 AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Rỗng = same-origin /api → Nginx proxy (xem nginx.conf). Chỉ set URL đầy đủ khi build đặc biệt.
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
