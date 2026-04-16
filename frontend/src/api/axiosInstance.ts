import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete (config.headers as Record<string, string>)['Content-Type'];
    }
    // Khu vực admin (trừ trang đăng nhập): chỉ gửi autohub_admin_token — không fallback user token.
    let token: string | null = null;
    try {
      const path = typeof window !== 'undefined' ? window.location?.pathname ?? '' : '';
      const isAdminApp = path.startsWith('/admin') && path !== '/admin/login';
      if (isAdminApp) {
        token = localStorage.getItem('autohub_admin_token');
      } else {
        token = localStorage.getItem('autohub_token');
      }
    } catch {
      token = localStorage.getItem('autohub_token');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle 401 globally
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
      if (isAdminApp) {
        localStorage.removeItem('autohub_admin_token');
        localStorage.removeItem('autohub_admin_user');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('autohub_token');
        localStorage.removeItem('autohub_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
