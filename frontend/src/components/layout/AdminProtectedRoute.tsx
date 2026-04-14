import AdminSessionGate from './AdminSessionGate';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

/** Cổng admin: token riêng + xác minh role admin qua API (xem AdminSessionGate). */
const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  return <AdminSessionGate>{children}</AdminSessionGate>;
};

export default AdminProtectedRoute;
