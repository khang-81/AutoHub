import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserRolesApi } from '../../api/users';
import { getUserIdFromToken, isJwtExpired } from '../../utils/helpers';
import LoadingSpinner from '../ui/LoadingSpinner';

const ADMIN_TOKEN_KEY = 'autohub_admin_token';
const ADMIN_USER_KEY = 'autohub_admin_user';

/**
 * Chỉ cho vào layout admin khi JWT trong autohub_admin_token còn hạn và user có role admin (xác minh qua API).
 */
const AdminSessionGate = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const token =
    typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY)?.trim() ?? '' : '';
  const userId = token ? getUserIdFromToken(token) : null;

  const { data: roles, isLoading, isError } = useQuery({
    queryKey: ['adminGateRoles', userId],
    queryFn: () => getUserRolesApi(userId!),
    enabled: Boolean(userId && token && !isJwtExpired(token)),
    retry: false,
  });

  const clearAdminSession = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  };

  if (!token || isJwtExpired(token)) {
    clearAdminSession();
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!userId) {
    clearAdminSession();
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !roles) {
    clearAdminSession();
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const isAdmin = roles.some((r) => r.name?.toLowerCase().includes('admin'));
  if (!isAdmin) {
    clearAdminSession();
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminSessionGate;
