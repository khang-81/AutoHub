import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAuthHydrated } from '../../hooks/useAuthHydrated';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const hydrated = useAuthHydrated();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const location = useLocation();

  if (!hydrated) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Prevent admin session from opening user dashboard pages (it causes empty user-specific data).
  if (!requireAdmin && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
