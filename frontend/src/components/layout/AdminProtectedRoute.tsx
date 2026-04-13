import { Navigate, useLocation } from 'react-router-dom';
import { isJwtExpired } from '../../utils/helpers';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const ADMIN_TOKEN_KEY = 'autohub_admin_token';
const ADMIN_USER_KEY = 'autohub_admin_user';

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const location = useLocation();
  const raw =
    typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
  const adminToken = raw?.trim() ?? '';
  const blocked = !adminToken || isJwtExpired(adminToken);

  if (blocked && typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  }

  if (blocked) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
