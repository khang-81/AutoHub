import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, FileText, LogOut, Car, Receipt, ShieldCheck, IdCard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { label: 'Tổng quan', to: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Hồ sơ của tôi', to: '/dashboard/profile', icon: User },
  { label: 'Xác minh danh tính', to: '/dashboard/kyc', icon: IdCard },
  { label: 'Lịch sử thuê xe', to: '/dashboard/rentals', icon: FileText },
  { label: 'Hóa đơn', to: '/dashboard/invoices', icon: Receipt },
  { label: 'Đổi mật khẩu', to: '/dashboard/change-password', icon: ShieldCheck },
];

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (item: { to: string; exact?: boolean }) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-navy text-white px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          <span className="font-heading font-bold">Auto<span className="text-primary">Hub</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300 hidden sm:block">{email}</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-primary transition-colors">
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item)
                      ? 'bg-primary text-white font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
