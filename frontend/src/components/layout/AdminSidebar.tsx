import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Car,
  LayoutDashboard,
  Users,
  FileText,
  Tag,
  Cpu,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Receipt,
  BarChart3,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { label: 'Tổng quan', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Quản lý xe', to: '/admin/cars', icon: Car },
  { label: 'Quản lý người dùng', to: '/admin/users', icon: Users },
  { label: 'Duyệt KYC', to: '/admin/kyc', icon: ShieldCheck },
  { label: 'Thương hiệu & Model', to: '/admin/brands', icon: Tag },
  { label: 'Quản lý đơn thuê', to: '/admin/rentals', icon: FileText },
  { label: 'Đơn mua xe', to: '/admin/sale-orders', icon: ShoppingBag },
  { label: 'Quản lý hóa đơn', to: '/admin/invoices', icon: Receipt },
  { label: 'Báo cáo', to: '/admin/reports', icon: BarChart3 },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-navy-400">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-white">
              Auto<span className="text-primary">Hub</span>
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-navy-400 transition-colors ml-auto"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-navy-400">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Quản trị viên</p>
              <p className="text-sm text-white font-medium truncate">{email}</p>
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
