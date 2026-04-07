import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Car, FileText, User, ArrowRight, TrendingUp } from 'lucide-react';
import { getRentalsByUserIdApi } from '../../api/rentals';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate, CAR_PLACEHOLDER } from '../../utils/helpers';
import type { RentalByUser } from '../../types';

const UserDashboard = () => {
  const { email } = useAuthStore();

  const { data: rentals = [], isLoading } = useQuery<RentalByUser[]>({
    queryKey: ['myRentals'],
    queryFn: getRentalsByUserIdApi,
  });

  const totalSpent = rentals.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const activeRentals = rentals.filter((r) => !r.returnDate).length;

  const stats = [
    { icon: Car, label: 'Tổng lần thuê', value: rentals.length, color: 'bg-blue-50 text-blue-600' },
    { icon: TrendingUp, label: 'Đang thuê', value: activeRentals, color: 'bg-green-50 text-green-600' },
    { icon: FileText, label: 'Tổng chi tiêu', value: formatCurrency(totalSpent), color: 'bg-primary/10 text-primary' },
  ];

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
            <p className="text-gray-500 text-sm">{email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">{stat.label}</p>
                <p className="font-heading font-bold text-xl text-navy">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent rentals */}
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
            {rentals.slice(0, 3).map((rental) => (
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
                  <span className={`badge text-xs ${
                    rental.returnDate
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {rental.returnDate ? 'Đã trả' : 'Đang thuê'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
