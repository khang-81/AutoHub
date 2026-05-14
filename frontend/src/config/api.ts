/**
 * Base URL API.
 * - Dev (Vite): mặc định để trống → gọi /api/* cùng origin, Vite proxy (vite.config.ts) chuyển tới backend (mặc định :8088 khớp docker-compose).
 *   Chỉ đặt VITE_API_URL khi cần gọi thẳng URL khác (vd. API trên server).
 * - Build Docker (Nginx): để trống → /api/* qua Nginx proxy tới container api.
 */
const viteApi = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
export const API_BASE_URL =
  viteApi !== undefined && viteApi !== ''
    ? viteApi
    : '';
