import axios from 'axios';
import { API_BASE_URL } from '../config/api';

/**
 * Sự kiện custom phát ra khi server trả 401 (token cũ / hết hạn / bị token-version vô hiệu).
 * Component AuthSessionWatcher (mount ở App) lắng nghe và dùng react-router để chuyển trang
 * mà không cần full reload (giữ SPA state, scroll, v.v.).
 */
export const AUTH_UNAUTHORIZED_EVENT = 'autohub:unauthorized';

export interface UnauthorizedEventDetail {
  scope: 'admin' | 'user';
}

const ADMIN_TOKEN_KEY = 'autohub_admin_token';
const ADMIN_USER_KEY = 'autohub_admin_user';
const USER_TOKEN_KEY = 'autohub_token';
const USER_DISPLAY_KEY = 'autohub_user';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete (config.headers as Record<string, string>)['Content-Type'];
    }
    let token: string | null = null;
    try {
      const path = typeof window !== 'undefined' ? window.location?.pathname ?? '' : '';
      const isAdminApp = path.startsWith('/admin') && path !== '/admin/login';
      if (isAdminApp) {
        token = localStorage.getItem(ADMIN_TOKEN_KEY);
      } else {
        token = localStorage.getItem(USER_TOKEN_KEY);
      }
    } catch {
      token = localStorage.getItem(USER_TOKEN_KEY);
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const reqUrl = String(error.config?.url ?? '');
    const isAuthEndpoint =
      reqUrl.includes('/api/auth/login') ||
      reqUrl.includes('/api/auth/register') ||
      reqUrl.includes('/api/auth/forgot-password') ||
      reqUrl.includes('/api/auth/reset-password');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      const path = typeof window !== 'undefined' ? window.location?.pathname ?? '' : '';
      const isAdminApp = path.startsWith('/admin') && path !== '/admin/login';
      try {
        if (isAdminApp) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          localStorage.removeItem(ADMIN_USER_KEY);
        } else {
          localStorage.removeItem(USER_TOKEN_KEY);
          localStorage.removeItem(USER_DISPLAY_KEY);
        }
      } catch {
        /* ignore storage errors */
      }
      // Phát sự kiện cho AuthSessionWatcher (router-aware) thay vì window.location.href.
      try {
        if (typeof window !== 'undefined') {
          const detail: UnauthorizedEventDetail = { scope: isAdminApp ? 'admin' : 'user' };
          window.dispatchEvent(new CustomEvent<UnauthorizedEventDetail>(AUTH_UNAUTHORIZED_EVENT, { detail }));
        }
      } catch {
        /* ignore */
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
