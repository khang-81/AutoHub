import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { getUserRolesApi } from '../../api/users';
import { getUserIdFromToken, isJwtExpired } from '../../utils/helpers';
import { ADMIN_TOKEN_KEY, clearAdminSession } from '../../utils/adminSession';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Chỉ cho vào layout admin khi JWT trong autohub_admin_token còn hạn và user có role admin (xác minh qua API).
 */
const AdminSessionGate = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const token =
    typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY)?.trim() ?? '' : '';
  const userId = token ? getUserIdFromToken(token) : null;

  const { data: roles, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['adminGateRoles', userId],
    queryFn: () => getUserRolesApi(userId!),
    enabled: Boolean(userId && token && !isJwtExpired(token)),
    retry: false,
  });

  const clearAdminSessionLocal = () => {
    clearAdminSession();
  };

  if (!token || isJwtExpired(token)) {
    clearAdminSessionLocal();
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!userId) {
    clearAdminSessionLocal();
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status === 401) {
      clearAdminSessionLocal();
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-700 mb-4">
            Không thể xác minh phiên admin. Kiểm tra kết nối mạng hoặc thử lại sau.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium disabled:opacity-60"
          >
            {isFetching ? 'Đang thử lại...' : 'Thử lại'}
          </button>
        </div>
      </div>
    );
  }

  if (!roles) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  const isAdmin = roles.some((r) => r.name?.toLowerCase().includes('admin'));
  if (!isAdmin) {
    clearAdminSessionLocal();
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminSessionGate;
