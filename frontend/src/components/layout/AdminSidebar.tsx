import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Car,
  LayoutDashboard,
  Users,
  Tag,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  ShieldCheck,
  ShoppingBag,
  MessageSquare,
  CalendarClock,
} from 'lucide-react';
import { useState } from 'react';
import { getEmailFromToken } from '../../utils/helpers';
import BrandLogo from '../ui/BrandLogo';

const navItems = [
  { label: 'Tổng quan', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Quản lý xe thuê', to: '/admin/cars/rent', icon: Car },
  { label: 'Quản lý xe bán', to: '/admin/cars/sale', icon: ShoppingBag },
  { label: 'Quản lý khách hàng', to: '/admin/users', icon: Users },
  { label: 'Quản lý GPLX', to: '/admin/kyc', icon: ShieldCheck },
  { label: 'Quản lý thương hiệu & model', to: '/admin/brands', icon: Tag },
  { label: 'Quản lý lịch xem xe', to: '/admin/viewing-appointments', icon: CalendarClock },
  { label: 'Quản lý đánh giá', to: '/admin/reviews', icon: MessageSquare },
  { label: 'Báo cáo doanh thu', to: '/admin/reports', icon: BarChart3 },
];

const ADMIN_USER_KEY = 'autohub_admin_user';
const ADMIN_TOKEN_KEY = 'autohub_admin_token';

function readAdminDisplayEmail(): string {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_USER_KEY) : null;
    if (raw) {
      const u = JSON.parse(raw) as { email?: string };
      if (u?.email) return u.email;
    }
  } catch {
    /* ignore */
  }
  const t = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
  return getEmailFromToken(t ?? '') ?? '';
}

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const adminEmail = readAdminDisplayEmail();

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    navigate('/admin/login');
  };

  const isActive = (item: { to: string; exact?: boolean }) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <aside
      className={`bg-navy min-h-screen flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'
        }`}
    >
      {/* Header — logo căn giữa; nút thu gọn absolute (mở rộng) hoặc dưới logo (thu gọn) */}
      <div
        className={`border-b border-navy-400 ${
          collapsed ? 'flex flex-col items-center gap-2 py-3 px-1' : 'relative px-3 py-4 sm:px-4'
        }`}
      >
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-navy-400 hover:text-white"
            aria-label="Thu gọn menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <div className={`flex justify-center ${collapsed ? '' : 'w-full pr-10'}`}>
          <BrandLogo to="/admin" size={collapsed ? 'sm' : 'lg'} variant="light" />
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-navy-400 hover:text-white"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Admin badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-navy-400">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Quản trị viên</p>
              <p className="text-sm text-white font-medium truncate">{adminEmail || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1 transition-all duration-200 group ${isActive(item)
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:bg-navy-400 hover:text-white'
              }`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 font-medium text-sm">{item.label}</span>
                {isActive(item) && <ChevronRight className="w-4 h-4" />}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-navy-400">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all duration-200"
          title={collapsed ? 'Đăng xuất' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
