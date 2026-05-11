import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  Receipt,
  LogOut,
  ShieldCheck,
  IdCard,
  ShoppingBag,
  CalendarClock,
  CircleUserRound,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import BrandLogo from '../ui/BrandLogo';

const navItems = [
  { label: 'Tổng quan', to: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Hồ sơ của tôi', to: '/dashboard/profile', icon: User },
  { label: 'Xác minh danh tính', to: '/dashboard/kyc', icon: IdCard },
  { label: 'Lịch sử thuê xe', to: '/dashboard/rentals', icon: FileText },
  { label: 'Đơn mua xe', to: '/dashboard/sale-orders', icon: ShoppingBag },
  { label: 'Lịch xem xe', to: '/dashboard/viewing-appointments', icon: CalendarClock },
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
      {/* Top bar — logo lớn, dễ nhận diện */}
      <div className="bg-navy text-white px-4 py-3 sm:py-4 flex items-center justify-between gap-4 border-b border-navy-400/80">
        <BrandLogo to="/" size="xl" variant="light" />
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/dashboard/profile"
            className="flex items-center justify-center rounded-full border-2 border-white/25 bg-white/10 p-0.5 shadow-sm transition hover:border-primary/70 hover:bg-white/15"
            title={email || 'Hồ sơ tài khoản'}
            aria-label={email ? `Mở hồ sơ — ${email}` : 'Mở hồ sơ tài khoản'}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-amber-600 text-white">
              <CircleUserRound className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
            </span>
          </Link>
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
