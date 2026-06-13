import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { resolveAuthTokenForRequest, resolveUserAuthToken } from '../utils/authToken';

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

let lastUnauthorizedDispatchAt = 0;
const UNAUTHORIZED_DEBOUNCE_MS = 2500;

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
    const token = resolveAuthTokenForRequest();
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

    const status = error.response?.status;
    const path = typeof window !== 'undefined' ? window.location?.pathname ?? '' : '';
    const hadAuth = !!error.config?.headers?.Authorization;
    const isLoginPage = path === '/login' || path === '/admin/login';
    const isAdminApp = path.startsWith('/admin') && path !== '/admin/login';

    // Chỉ 401 + đã gửi Bearer = token bị từ chối / hết hạn. 403 = thiếu quyền, không logout.
    const sessionExpired = status === 401 && hadAuth;
    if (sessionExpired && !isAuthEndpoint && !isLoginPage) {
      const hasStoredCredentials = isAdminApp
        ? !!localStorage.getItem(ADMIN_TOKEN_KEY)
        : !!resolveUserAuthToken();

      if (!hasStoredCredentials) {
        return Promise.reject(error);
      }

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

      const now = Date.now();
      if (now - lastUnauthorizedDispatchAt >= UNAUTHORIZED_DEBOUNCE_MS) {
        lastUnauthorizedDispatchAt = now;
        try {
          if (typeof window !== 'undefined') {
            const detail: UnauthorizedEventDetail = { scope: isAdminApp ? 'admin' : 'user' };
            window.dispatchEvent(new CustomEvent<UnauthorizedEventDetail>(AUTH_UNAUTHORIZED_EVENT, { detail }));
          }
        } catch {
          /* ignore */
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
