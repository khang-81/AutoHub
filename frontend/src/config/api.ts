/**
 * Base URL API.
 * - Dev (Vite): mặc định http://localhost:8081 hoặc VITE_API_URL trong frontend/.env
 * - Build Docker (Nginx): để trống → gọi /api/* cùng origin, Nginx proxy tới container api
 */
const viteApi = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
export const API_BASE_URL =
  viteApi !== undefined && viteApi !== ''
    ? viteApi
    : import.meta.env.DEV
      ? 'http://localhost:8081'
      : '';
