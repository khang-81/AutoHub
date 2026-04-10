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
    // Ưu tiên token admin khi đang ở /admin/*
    let token = localStorage.getItem('autohub_token');
    try {
      const isAdminRoute = typeof window !== 'undefined' && window.location?.pathname?.startsWith('/admin');
      if (isAdminRoute) {
        token = localStorage.getItem('autohub_admin_token') || token;
      }
    } catch { }
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
    if (error.response?.status === 401) {
      const isAdminRoute = typeof window !== 'undefined' && window.location?.pathname?.startsWith('/admin');
      if (isAdminRoute) {
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
