import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, Car, FileText, Users, Download } from 'lucide-react';
import { getAllRentalsApi } from '../../api/rentals';
import { getAllCarsApi } from '../../api/cars';
import { getAllUsersApi } from '../../api/users';
import { getAllBrandsApi } from '../../api/brands';
import { getAllSaleOrdersApi } from '../../api/saleOrders';
import { formatCurrency } from '../../utils/helpers';
import type { Rental, Car as CarType, SaleOrder } from '../../types';
import { format, parseISO, startOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

const COLORS = ['#C9A227', '#1B2A4A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const ManageReports = () => {
  const { data: rentals = [] } = useQuery<Rental[]>({ queryKey: ['rentals'], queryFn: getAllRentalsApi });
  const { data: saleOrders = [] } = useQuery<SaleOrder[]>({
    queryKey: ['saleOrders'],
    queryFn: getAllSaleOrdersApi,
  });
  const { data: cars = [] } = useQuery<CarType[]>({ queryKey: ['cars'], queryFn: getAllCarsApi });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: getAllUsersApi });
  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: getAllBrandsApi });

  // Monthly revenue data
  const monthlyData = (() => {
    const map = new Map<string, { month: string; revenue: number; count: number }>();
    rentals.forEach((r) => {
      if (!r.startDate) return;
      try {
        const monthKey = format(startOfMonth(parseISO(r.startDate)), 'yyyy-MM');
        const label = format(startOfMonth(parseISO(r.startDate)), 'MM/yyyy', { locale: vi });
        const existing = map.get(monthKey) || { month: label, revenue: 0, count: 0 };
        map.set(monthKey, {
          month: label,
          revenue: existing.revenue + (r.totalPrice || 0),
          count: existing.count + 1,
        });
      } catch { /* skip invalid dates */ }
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([, v]) => v);
  })();

  // Brand distribution
  const brandData = (Array.isArray(brands) ? brands : []).map((b: { id: number; name: string }) => ({
    name: b.name,
    value: cars.filter((c) => c.model?.brand?.id === b.id).length,
  })).filter((b) => b.value > 0);

  // Status breakdown
  const returned = rentals.filter((r) => r.returnDate).length;
  const active = rentals.length - returned;
  const statusData = [
    { name: 'Đang thuê', value: active },
    { name: 'Đã trả', value: returned },
  ];

  const totalRevenue = rentals.reduce((s, r) => s + (r.totalPrice || 0), 0);
  const usersCount = Array.isArray(users) ? users.length : 0;

  const stats = [
    { icon: TrendingUp, label: 'Tổng doanh thu', value: formatCurrency(totalRevenue), color: 'text-primary bg-primary/10' },
    { icon: FileText, label: 'Tổng đơn thuê', value: rentals.length, color: 'text-blue-600 bg-blue-50' },
    { icon: Car, label: 'Tổng xe', value: cars.length, color: 'text-green-600 bg-green-50' },
    { icon: Users, label: 'Người dùng', value: usersCount, color: 'text-purple-600 bg-purple-50' },
  ];

  const downloadCsv = (filename: string, header: string[], rows: (string | number)[][]) => {
    const csv = [header.map(csvCell), ...rows.map((r) => r.map(csvCell))].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const header = ['Tháng', 'Doanh thu (VNĐ)', 'Số đơn'];
    const rows = monthlyData.map((m) => [m.month, m.revenue, m.count]);
    downloadCsv('revenue-report.csv', header, rows);
  };

  const handleExportRentalsDetailCSV = () => {
    const header = [
      'Mã đơn',
      'Ngày bắt đầu',
      'Ngày kết thúc',
      'Tổng tiền (VNĐ)',
      'Trạng thái thuê',
      'Trạng thái thanh toán',
      'Email khách',
      'Biển số',
    ];
    const rows = rentals.map((r) => [
      r.id,
      r.startDate ?? '',
      r.endDate ?? '',
      r.totalPrice ?? 0,
      r.rentalStatus ?? '',
      r.paymentStatus ?? '',
      r.user?.email ?? '',
      r.car?.plate ?? '',
    ]);
    downloadCsv('don-thue-chi-tiet.csv', header, rows);
  };

  const handleExportSaleOrdersCSV = () => {
    const header = [
      'Mã đơn',
      'Tổng tiền (VNĐ)',
      'Trạng thái đơn',
      'Trạng thái thanh toán',
      'Email khách',
      'Biển số',
    ];
    const rows = saleOrders.map((o) => [
      o.id,
      o.totalPrice ?? 0,
      o.orderStatus ?? '',
      o.paymentStatus ?? '',
      o.user?.email ?? '',
      o.car?.plate ?? '',
    ]);
    downloadCsv('don-mua-xe.csv', header, rows);
  };

  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-navy">Báo cáo & Thống kê</h1>
          <p className="text-gray-400 text-sm mt-1">Phân tích doanh thu và hoạt động hệ thống</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            CSV doanh thu theo tháng
          </button>
          <button
            type="button"
            onClick={handleExportRentalsDetailCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-navy hover:bg-navy/90 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            CSV đơn thuê chi tiết
          </button>
          <button
            type="button"
            onClick={handleExportSaleOrdersCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-navy text-navy hover:bg-navy/5 font-semibold rounded-xl transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            CSV đơn mua xe
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="font-heading font-bold text-xl text-navy">{stat.value}</p>
            <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly revenue bar chart */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-heading font-semibold text-navy text-lg mb-6">Doanh thu theo tháng</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: unknown) => [formatCurrency(Number(value)), 'Doanh thu']}
                labelFormatter={(label: unknown) => `Tháng ${String(label)}`}
              />
              <Bar dataKey="revenue" fill="#C9A227" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>Chưa có dữ liệu doanh thu</p>
          </div>
        )}
      </div>

      {/* Rental count area chart */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-heading font-semibold text-navy text-lg mb-6">Số lượng đơn thuê theo tháng</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B2A4A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1B2A4A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: unknown) => [Number(value), 'Số đơn']} />
              <Area type="monotone" dataKey="count" stroke="#1B2A4A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-52 flex items-center justify-center text-gray-400">
            <p>Chưa có dữ liệu</p>
          </div>
        )}
      </div>

      {/* Pie charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Brand distribution */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-heading font-semibold text-navy text-lg mb-6">Phân bố xe theo thương hiệu</h2>
          {brandData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={brandData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {brandData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value: unknown) => [`${value} xe`, '']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400">
              <p>Chưa có dữ liệu</p>
            </div>
          )}
        </div>

        {/* Rental status */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-heading font-semibold text-navy text-lg mb-6">Trạng thái đơn thuê</h2>
          {rentals.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#6B7280" />
                  </Pie>
                  <Tooltip formatter={(value: unknown) => [`${value} đơn`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{active}</p>
                  <p className="text-xs text-green-700 mt-1">Đang thuê</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gray-600">{returned}</p>
                  <p className="text-xs text-gray-500 mt-1">Đã trả</p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400">
              <p>Chưa có dữ liệu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageReports;
