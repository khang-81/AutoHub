import { useQuery } from '@tanstack/react-query';
import { Car, Users, FileText, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { getAllCarsApi } from '../../api/cars';
import { getAllRentalsApi } from '../../api/rentals';
import { getAllUsersApi } from '../../api/users';
import { getAllBrandsApi } from '../../api/brands';
import { formatCurrency, formatDate, CAR_PLACEHOLDER } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import type { Car as CarType, Rental } from '../../types';

const AdminDashboard = () => {
  const { data: cars = [] } = useQuery<CarType[]>({ queryKey: ['cars'], queryFn: getAllCarsApi });
  const { data: rentals = [] } = useQuery<Rental[]>({ queryKey: ['rentals'], queryFn: getAllRentalsApi });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: getAllUsersApi });
  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: getAllBrandsApi });

  const totalRevenue = rentals.reduce((sum: number, r: Rental) => sum + (r.totalPrice || 0), 0);
  const recentRentals = rentals.slice(-5).reverse();

  const stats = [
    {
      icon: Car,
      label: 'Tổng xe',
      value: cars.length,
      change: '+5 tháng này',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      link: '/admin/cars',
    },
    {
      icon: FileText,
      label: 'Đơn thuê',
      value: rentals.length,
      change: '+12 tháng này',
      color: 'bg-green-50 text-green-600 border-green-100',
      link: '/admin/rentals',
    },
    {
      icon: Users,
      label: 'Người dùng',
      value: Array.isArray(users) ? users.length : 0,
      change: '+8 tháng này',
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      link: '/admin/users',
    },
    {
      icon: TrendingUp,
      label: 'Doanh thu',
      value: formatCurrency(totalRevenue),
      change: '+15% tháng này',
      color: 'bg-primary/10 text-primary border-primary/20',
      link: '/admin/rentals',
    },
  ];

  return (
    <div>
      {/* Page title */}
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-navy">Tổng quan hệ thống</h1>
        <p className="text-gray-400 mt-1">Chào mừng trở lại, Admin!</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className={`bg-white rounded-2xl shadow-sm p-5 border hover:shadow-md transition-shadow group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
            </div>
            <p className="font-heading font-bold text-2xl text-navy">{stat.value}</p>
            <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            <p className="text-green-500 text-xs mt-1">{stat.change}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent rentals */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-navy">Đơn thuê gần đây</h2>
            <Link to="/admin/rentals" className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Xem tất cả <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-3 font-medium">#</th>
                  <th className="text-left pb-3 font-medium">Xe</th>
                  <th className="text-left pb-3 font-medium">Ngày thuê</th>
                  <th className="text-right pb-3 font-medium">Giá</th>
                  <th className="text-right pb-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentRentals.map((rental: Rental) => (
                  <tr key={rental.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 text-gray-400">{rental.id}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rental.car?.imagePath || CAR_PLACEHOLDER}
                          alt="car"
                          className="w-10 h-8 object-cover rounded-lg"
                          onError={(e) => { (e.target as HTMLImageElement).src = CAR_PLACEHOLDER; }}
                        />
                        <span className="font-medium text-navy truncate max-w-[120px]">
                          {rental.car?.model?.brand?.name} {rental.car?.model?.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-500">{formatDate(rental.startDate)}</td>
                    <td className="py-3 text-right font-semibold text-primary">
                      {formatCurrency(rental.totalPrice)}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`badge text-xs ${
                        rental.returnDate ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                      }`}>
                        {rental.returnDate ? 'Đã trả' : 'Đang thuê'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentRentals.length === 0 && (
              <p className="text-gray-400 text-center py-8">Chưa có đơn thuê</p>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="space-y-5">
          {/* Brand breakdown */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <Car className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-semibold text-navy">Thương hiệu</h2>
            </div>
            <div className="space-y-3">
              {(Array.isArray(brands) ? brands : []).slice(0, 5).map((brand: { id: number; name: string }) => {
                const brandCarCount = cars.filter((c) => c.model?.brand?.id === brand.id).length;
                const pct = cars.length ? Math.round((brandCarCount / cars.length) * 100) : 0;
                return (
                  <div key={brand.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{brand.name}</span>
                      <span className="font-medium text-navy">{brandCarCount} xe</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Latest car */}
          {cars.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-heading font-semibold text-navy">Xe mới nhất</h2>
              </div>
              <div className="flex items-center gap-4">
                <img
                  src={cars[cars.length - 1]?.imagePath || CAR_PLACEHOLDER}
                  alt="latest car"
                  className="w-16 h-12 object-cover rounded-xl"
                  onError={(e) => { (e.target as HTMLImageElement).src = CAR_PLACEHOLDER; }}
                />
                <div>
                  <p className="font-semibold text-navy text-sm">
                    {cars[cars.length - 1]?.model?.brand?.name} {cars[cars.length - 1]?.model?.name}
                  </p>
                  <p className="text-primary font-bold text-sm">
                    {formatCurrency(cars[cars.length - 1]?.dailyPrice)}/ngày
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
