import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Car,
  FileText,
  User,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  ShoppingBag,
  Timer,
  Receipt,
  Undo2,
} from 'lucide-react';
import { getRentalsByUserIdApi } from '../../api/rentals';
import { getMySaleOrdersApi } from '../../api/saleOrders';
import { getProfileApi } from '../../api/users';
import { getMyKycDocumentsApi } from '../../api/kyc';
import { useAuthStore } from '../../store/authStore';
import { isKycApproved } from '../../utils/kycStatus';
import { resolveUserAuthToken } from '../../utils/authToken';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate, CAR_PLACEHOLDER, getRentalBadgeDisplay } from '../../utils/helpers';
import type { RentalByUser, SaleOrder } from '../../types';

const saleStatusLabel: Record<string, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PENDING_ADMIN_CONFIRM: 'Chờ xác nhận',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

const UserDashboard = () => {
  const { email, isAuthenticated } = useAuthStore();
  const hasToken = !!resolveUserAuthToken();

  const { data: rentals = [], isLoading: rentalsLoading } = useQuery<RentalByUser[]>({
    queryKey: ['myRentals'],
    queryFn: getRentalsByUserIdApi,
    enabled: isAuthenticated && hasToken,
    refetchOnMount: 'always',
  });

  const { data: saleOrders = [], isLoading: saleOrdersLoading } = useQuery<SaleOrder[]>({
    queryKey: ['mySaleOrders'],
    queryFn: getMySaleOrdersApi,
    enabled: isAuthenticated && hasToken,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfileApi,
    enabled: isAuthenticated && hasToken,
    refetchOnMount: 'always',
  });

  const { data: kycDocs = [] } = useQuery({
    queryKey: ['kycMy'],
    queryFn: getMyKycDocumentsApi,
    enabled: isAuthenticated && hasToken,
    refetchOnMount: 'always',
  });

  const kycApproved = isKycApproved(profile, kycDocs);

  const totalSpent = rentals.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const activeRentals = rentals.filter((r) => !r.returnDate).length;
  const hasReturnableRental = rentals.some(
    (r) => !r.returnDate && r.rentalStatus === 'CONFIRMED'
  );

  const pendingSaleCount = saleOrders.filter(
    (o) => o.orderStatus === 'PENDING_PAYMENT' || o.orderStatus === 'PENDING_ADMIN_CONFIRM'
  ).length;
  const totalPurchaseValue = saleOrders
    .filter((o) => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const rentalStats = [
    { icon: Car, label: 'Tổng lần thuê', value: String(rentals.length), color: 'bg-blue-50 text-blue-600' },
    { icon: TrendingUp, label: 'Đang thuê', value: String(activeRentals), color: 'bg-green-50 text-green-600' },
    { icon: FileText, label: 'Tổng chi tiêu thuê', value: formatCurrency(totalSpent), color: 'bg-primary/10 text-primary' },
  ];

  const saleStats = [
    { icon: ShoppingBag, label: 'Tổng đơn mua', value: String(saleOrders.length), color: 'bg-violet-50 text-violet-600' },
    {
      icon: Timer,
      label: 'Đơn chờ xử lý',
      value: String(pendingSaleCount),
      color: 'bg-amber-50 text-amber-700',
    },
    {
      icon: Receipt,
      label: 'Giá trị đơn mua (chưa hủy)',
      value: formatCurrency(totalPurchaseValue),
      color: 'bg-emerald-50 text-emerald-700',
    },
  ];

  const recentSales = [...saleOrders].sort((a, b) => b.id - a.id).slice(0, 3);

  const isLoading = rentalsLoading || saleOrdersLoading;

  return (
    <div>
      {/* Welcome */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl text-navy">Xin chào! 👋</h1>
            <p className="text-gray-500 text-sm" title={email || undefined}>
              Tài khoản thành viên
            </p>
          </div>
        </div>
      </div>

      {profile && !kycApproved && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Hoàn tất xác minh GPLX</p>
              <p className="text-amber-800/90 text-xs mt-0.5">
                Bạn cần được duyệt giấy tờ trước khi thuê hoặc mua xe.
              </p>
            </div>
          </div>
          <Link to="/dashboard/kyc" className="btn-primary text-sm py-2 px-4 whitespace-nowrap text-center">
            Đi tới xác minh
          </Link>
        </div>
      )}

      {/* Stats — Thuê */}
      <div className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Thuê xe</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {rentalStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-400 text-xs">{stat.label}</p>
                <p className="font-heading font-bold text-xl text-navy truncate">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasReturnableRental && (
        <div className="mb-6 -mt-2 flex flex-col gap-3 rounded-2xl border-2 border-emerald-500/70 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 shadow-md shadow-emerald-600/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Undo2 className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Trả xe</p>
              <p className="font-heading text-sm font-semibold text-navy sm:text-base">
                Bạn có đơn đang thuê — gửi yêu cầu trả xe (ngày và km), admin sẽ xác nhận.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/rentals"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700"
          >
            Đến trả xe
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Stats — Mua */}
      <div className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Mua xe</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {saleStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-400 text-xs leading-snug">{stat.label}</p>
                <p className="font-heading font-bold text-xl text-navy truncate">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-navy">Lần thuê gần đây</h2>
            <Link
              to="/dashboard/rentals"
              className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : rentals.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">Bạn chưa thuê xe nào</p>
              <Link to="/cars" className="btn-primary mt-4 inline-block text-sm">Thuê xe ngay</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {rentals.slice(0, 3).map((rental) => {
                const rentalBadge = getRentalBadgeDisplay(rental);
                return (
                  <div key={rental.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <img
                      src={rental.car?.imagePath || CAR_PLACEHOLDER}
                      alt="car"
                      className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = CAR_PLACEHOLDER; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy text-sm truncate">
                        {rental.car?.model?.brand?.name} {rental.car?.model?.name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {formatDate(rental.startDate)} → {formatDate(rental.endDate)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-primary text-sm">{formatCurrency(rental.totalPrice)}</p>
                      <span className={`badge text-xs ${rentalBadge.className}`}>
                        {rentalBadge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-navy">Đơn mua gần đây</h2>
            <Link
              to="/dashboard/sale-orders"
              className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : recentSales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">Bạn chưa có đơn mua xe</p>
              <Link to="/cars/mua" className="btn-primary mt-4 inline-block text-sm">
                Xem xe đang bán
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSales.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={order.car?.imagePath || CAR_PLACEHOLDER}
                    alt=""
                    className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy text-sm truncate">
                      {order.car?.model?.brand?.name} {order.car?.model?.name}
                    </p>
                    <p className="text-gray-400 text-xs">Đơn #{order.id}</p>
                  </div>
                  <div className="text-right flex-shrink-0 max-w-[42%]">
                    <p className="font-semibold text-primary text-sm">{formatCurrency(order.totalPrice)}</p>
                    <span
                      className={`badge text-xs mt-0.5 inline-block max-w-full truncate ${order.orderStatus === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : order.orderStatus === 'CANCELLED'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      title={saleStatusLabel[order.orderStatus || ''] || order.orderStatus}
                    >
                      {saleStatusLabel[order.orderStatus || ''] || order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
