import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  ShieldCheck,
  IdCard,
  ShoppingBag,
  CalendarClock,
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const navItems = [
  { label: 'Tổng quan', to: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Hồ sơ của tôi', to: '/dashboard/profile', icon: User },
  { label: 'Xác minh GPLX', to: '/dashboard/kyc', icon: IdCard },
  { label: 'Lịch sử thuê xe', to: '/dashboard/rentals', icon: FileText },
  { label: 'Đơn mua xe', to: '/dashboard/sale-orders', icon: ShoppingBag },
  { label: 'Lịch xem xe', to: '/dashboard/viewing-appointments', icon: CalendarClock },
  { label: 'Đổi mật khẩu', to: '/dashboard/change-password', icon: ShieldCheck },
];

const UserLayout = () => {
  const location = useLocation();

  const isActive = (item: { to: string; exact?: boolean }) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 pt-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item)
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

            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserLayout;
