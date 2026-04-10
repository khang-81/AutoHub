/** Base URL API — production: set VITE_API_URL in .env */
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8081';
