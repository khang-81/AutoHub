import { useQuery } from '@tanstack/react-query';
import {
  Car,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ShoppingBag,
  Tag,
  LayoutDashboard,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getAllCarsApi } from '../../api/cars';
import { getAllRentalsApi } from '../../api/rentals';
import { getAllSaleOrdersApi } from '../../api/saleOrders';
import { getAllUsersApi } from '../../api/users';
import { getAllBrandsApi } from '../../api/brands';
import { formatCurrency, formatDate, CAR_PLACEHOLDER } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import type { Car as CarType, Rental, SaleOrder } from '../../types';

const isRentListing = (c: CarType) =>
  !c.listingType || String(c.listingType).toUpperCase() === 'RENT_ONLY';

const isSaleListing = (c: CarType) => String(c.listingType || '').toUpperCase() === 'SALE_ONLY';

type StatDef = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint: string;
  link: string;
  iconWrap: string;
};

function StatCard({ stat }: { stat: StatDef }) {
  const Icon = stat.icon;
  return (
    <Link
      to={stat.link}
      className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-black/[0.02] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md md:p-6"
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-black/[0.04] shadow-inner ${stat.iconWrap}`}
      >
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <p className="font-heading text-2xl font-bold tracking-tight text-navy md:text-[1.65rem]">{stat.value}</p>
      <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">{stat.hint}</p>
      <span className="pointer-events-none absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-300 transition-all group-hover:bg-primary/10 group-hover:text-primary">
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

function SectionLabel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4 flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-heading text-lg font-semibold text-navy">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

const AdminDashboard = () => {
  const { data: cars = [] } = useQuery<CarType[]>({ queryKey: ['cars'], queryFn: getAllCarsApi });
  const { data: rentals = [] } = useQuery<Rental[]>({ queryKey: ['rentals'], queryFn: getAllRentalsApi });
  const { data: saleOrders = [] } = useQuery<SaleOrder[]>({
    queryKey: ['saleOrders'],
    queryFn: getAllSaleOrdersApi,
  });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: getAllUsersApi });
  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: getAllBrandsApi });

  const carsRent = cars.filter(isRentListing);
  const carsSale = cars.filter(isSaleListing);
  const saleCarsAvailable = carsSale.filter((c) => (c.saleStatus || 'AVAILABLE').toUpperCase() !== 'SOLD');

  const rentalRevenue = rentals.reduce((sum: number, r: Rental) => sum + (r.totalPrice || 0), 0);
  const saleRevenue = saleOrders.reduce((sum: number, o: SaleOrder) => sum + (o.totalPrice || 0), 0);
  const totalRevenue = rentalRevenue + saleRevenue;

  const recentRentals = rentals.slice(-5).reverse();
  const recentSaleOrders = saleOrders.slice(-5).reverse();
  const latestCar = cars.length > 0 ? cars[cars.length - 1] : null;

  const rentStats: StatDef[] = [
    {
      icon: Car,
      label: 'Xe cho thuê',
      value: carsRent.length,
      hint: `${cars.length} xe trong danh mục (thuê + bán)`,
      link: '/admin/cars',
      iconWrap: 'bg-gradient-to-br from-sky-50 to-blue-50 text-blue-600',
    },
    {
      icon: FileText,
      label: 'Đơn thuê',
      value: rentals.length,
      hint: 'Theo dõi thanh toán, trả xe và khiếu nại',
      link: '/admin/rentals',
      iconWrap: 'bg-gradient-to-br from-emerald-50 to-teal-50 text-teal-700',
    },
    {
      icon: Users,
      label: 'Người dùng',
      value: Array.isArray(users) ? users.length : 0,
      hint: 'Tài khoản khách và phân quyền',
      link: '/admin/users',
      iconWrap: 'bg-gradient-to-br from-violet-50 to-purple-50 text-violet-700',
    },
    {
      icon: TrendingUp,
      label: 'Doanh thu thuê',
      value: formatCurrency(rentalRevenue),
      hint: 'Tổng giá trị các đơn thuê',
      link: '/admin/reports',
      iconWrap: 'bg-gradient-to-br from-primary/15 to-primary/5 text-primary',
    },
  ];

  const saleStats: StatDef[] = [
    {
      icon: Tag,
      label: 'Xe đang rao bán',
      value: saleCarsAvailable.length,
      hint: `${carsSale.length} niêm yết (gồm đã bán)`,
      link: '/admin/cars',
      iconWrap: 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-800',
    },
    {
      icon: ShoppingBag,
      label: 'Đơn mua xe',
      value: saleOrders.length,
      hint: 'Chuyển khoản, xác nhận và giao xe',
      link: '/admin/sale-orders',
      iconWrap: 'bg-gradient-to-br from-cyan-50 to-sky-50 text-cyan-800',
    },
    {
      icon: Wallet,
      label: 'Doanh thu bán',
      value: formatCurrency(saleRevenue),
      hint: 'Tổng giá trị đơn mua xe',
      link: '/admin/reports',
      iconWrap: 'bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-800',
    },
  ];

  return (
    <div className="space-y-10 pb-4">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy-500 to-navy-700 px-6 py-10 shadow-xl sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-96 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-200">
              <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
              Bảng điều khiển
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Tổng quan vận hành
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-300 sm:text-lg">
              Theo dõi tồn kho, đơn thuê, đơn bán và người dùng — giao diện tập trung cho quản trị hằng ngày.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <div className="min-w-[160px] rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-4 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tổng doanh thu</p>
              <p className="mt-1 font-heading text-2xl font-bold text-primary sm:text-3xl">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="mt-1 text-xs text-slate-400">Thuê + bán</p>
            </div>
            <div className="min-w-[120px] rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-4 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Đơn hàng</p>
              <p className="mt-1 font-heading text-2xl font-bold text-white sm:text-3xl">
                {rentals.length + saleOrders.length}
              </p>
              <p className="mt-1 text-xs text-slate-400">Thuê + mua</p>
            </div>
          </div>
        </div>
      </header>

      {/* Thuê xe */}
      <section>
        <SectionLabel title="Dịch vụ thuê xe" subtitle="Tồn kho cho thuê, đơn hàng và doanh thu thuê" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {rentStats.map((s) => (
            <StatCard key={s.label} stat={s} />
          ))}
        </div>
      </section>

      {/* Mua bán */}
      <section>
        <SectionLabel title="Mua & bán xe" subtitle="Niêm yết bán, đơn mua và doanh thu bán hàng" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {saleStats.map((s) => (
            <StatCard key={s.label} stat={s} />
          ))}
        </div>
      </section>

      {/* Bảng hoạt động */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-heading text-base font-semibold text-navy">Đơn thuê gần đây</h2>
              <p className="text-xs text-slate-500">5 đơn mới nhất</p>
            </div>
            <Link
              to="/admin/rentals"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              Xem tất cả
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto px-1">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 sm:px-5">#</th>
                  <th className="px-2 py-3">Xe</th>
                  <th className="px-2 py-3">Ngày thuê</th>
                  <th className="px-2 py-3 text-right">Giá</th>
                  <th className="px-4 py-3 text-right sm:px-5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRentals.map((rental: Rental) => (
                  <tr key={rental.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-400 sm:px-5">#{rental.id}</td>
                    <td className="px-2 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={rental.car?.imagePath || CAR_PLACEHOLDER}
                          alt=""
                          className="h-9 w-12 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
                          }}
                        />
                        <span className="font-medium text-navy line-clamp-2 max-w-[140px]">
                          {rental.car?.model?.brand?.name} {rental.car?.model?.name}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3.5 text-slate-600">{formatDate(rental.startDate)}</td>
                    <td className="whitespace-nowrap px-2 py-3.5 text-right font-semibold tabular-nums text-primary">
                      {formatCurrency(rental.totalPrice)}
                    </td>
                    <td className="px-4 py-3.5 text-right sm:px-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          rental.returnDate
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100'
                        }`}
                      >
                        {rental.returnDate ? 'Đã trả' : 'Đang thuê'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentRentals.length === 0 && (
              <p className="px-6 py-12 text-center text-sm text-slate-400">Chưa có đơn thuê</p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-heading text-base font-semibold text-navy">Đơn mua xe gần đây</h2>
              <p className="text-xs text-slate-500">5 đơn mới nhất</p>
            </div>
            <Link
              to="/admin/sale-orders"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              Xem tất cả
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto px-1">
            <table className="w-full min-w-[440px] text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 sm:px-5">#</th>
                  <th className="px-2 py-3">Xe</th>
                  <th className="px-2 py-3">Khách</th>
                  <th className="px-2 py-3 text-right">Giá</th>
                  <th className="px-4 py-3 text-right sm:px-5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSaleOrders.map((o: SaleOrder) => (
                  <tr key={o.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-400 sm:px-5">#{o.id}</td>
                    <td className="px-2 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={o.car?.imagePath || CAR_PLACEHOLDER}
                          alt=""
                          className="h-9 w-12 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
                          }}
                        />
                        <span className="font-medium text-navy line-clamp-2 max-w-[120px]">
                          {o.car?.model?.brand?.name} {o.car?.model?.name}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[140px] truncate px-2 py-3.5 text-slate-600" title={o.user?.email}>
                      {o.user?.email ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3.5 text-right font-semibold tabular-nums text-primary">
                      {formatCurrency(o.totalPrice)}
                    </td>
                    <td className="px-4 py-3.5 text-right sm:px-5">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80">
                        {o.orderStatus ?? '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentSaleOrders.length === 0 && (
              <p className="px-6 py-12 text-center text-sm text-slate-400">Chưa có đơn mua xe</p>
            )}
          </div>
        </div>
      </div>

      {/* Thương hiệu + spotlight */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-3">
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <Car className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-heading text-base font-semibold text-navy">Phân bổ thương hiệu</h2>
                <p className="text-xs text-slate-500">Theo tổng số xe trong hệ thống</p>
              </div>
            </div>
          </div>
          <div className="space-y-5 p-5 sm:p-6">
            {(Array.isArray(brands) ? brands : []).slice(0, 8).map((brand: { id: number; name: string }) => {
              const brandCarCount = cars.filter((c) => c.model?.brand?.id === brand.id).length;
              const pct = cars.length ? Math.round((brandCarCount / cars.length) * 100) : 0;
              return (
                <div key={brand.id}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{brand.name}</span>
                    <span className="tabular-nums text-slate-500">
                      {brandCarCount} xe <span className="text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary-500 transition-all duration-500"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!Array.isArray(brands) || brands.length === 0) && (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu thương hiệu</p>
            )}
          </div>
        </div>

        {latestCar && (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
            <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h2 className="font-heading text-base font-semibold text-navy">Xe mới nhất</h2>
                  <p className="text-xs text-slate-500">Bản ghi cuối trong danh mục</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <img
                  src={latestCar.imagePath || CAR_PLACEHOLDER}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="font-heading text-lg font-semibold leading-snug">
                    {latestCar.model?.brand?.name} {latestCar.model?.name}
                  </p>
                  <p className="mt-1 text-sm text-white/85">
                    {isSaleListing(latestCar)
                      ? `Giá niêm yết: ${formatCurrency(latestCar.salePrice ?? 0)}`
                      : `Giá thuê: ${formatCurrency(latestCar.dailyPrice ?? 0)} / ngày`}
                  </p>
                  <Link
                    to="/admin/cars"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-200 hover:text-primary"
                  >
                    Mở quản lý xe
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
