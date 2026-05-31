import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AUTH_UNAUTHORIZED_EVENT, type UnauthorizedEventDetail } from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';
import { clearAdminSession } from '../../utils/adminSession';
import { useToast } from '../ui/Toast';

/**
 * Lắng nghe sự kiện 401 do axiosInstance phát ra và điều hướng người dùng tới trang đăng nhập tương ứng
 * (admin hoặc khách) bằng react-router thay vì window.location.href — giữ được SPA state.
 *
 * Tránh vòng lặp redirect: bỏ qua nếu đã đứng ở trang login.
 */
const AuthSessionWatcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<UnauthorizedEventDetail>).detail;
      const scope = detail?.scope ?? 'user';
      const path = location.pathname;

      if (scope === 'admin') {
        if (path === '/admin/login') return;
        clearAdminSession();
        navigate('/admin/login', { replace: true });
        showToast('Phiên đăng nhập admin đã hết hạn. Vui lòng đăng nhập lại.', 'info');
        return;
      }

      logout();
      if (path === '/login' || path === '/register') return;
      navigate('/login', { replace: true, state: { from: location } });
      showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'info');
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handler);
  }, [navigate, location, showToast, logout]);

  return null;
};

export default AuthSessionWatcher;
