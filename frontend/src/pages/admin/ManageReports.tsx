import { useMemo } from 'react';
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
import {
  TrendingUp,
  Car,
  FileText,
  Users,
  Download,
  ShoppingBag,
  Wallet,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { getAllRentalsApi } from '../../api/rentals';
import { getAllCarsApi } from '../../api/cars';
import { getAllUsersApi } from '../../api/users';
import { getAllBrandsApi } from '../../api/brands';
import { getAllSaleOrdersApi } from '../../api/saleOrders';
import axiosInstance from '../../api/axiosInstance';
import { formatCurrency } from '../../utils/helpers';
import type { Rental, Car as CarType, SaleOrder } from '../../types';
import { format, parseISO, startOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const COLORS = ['#C9A227', '#1B2A4A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const RENT_COLOR = '#C9A227';
const SALE_COLOR = '#1B2A4A';

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function isRentalCancelled(r: Rental): boolean {
  return (r.rentalStatus || '').toUpperCase() === 'CANCELLED';
}

function isSaleCancelled(o: SaleOrder): boolean {
  if (o.cancelledAt) return true;
  return (o.orderStatus || '').toUpperCase() === 'CANCELLED';
}

type MonthRow = {
  monthKey: string;
  month: string;
  rentalRevenue: number;
  saleRevenue: number;
  totalRevenue: number;
  rentalCount: number;
  saleCount: number;
};

const ManageReports = () => {
  const { data: rentals = [], isLoading: loadRentals } = useQuery<Rental[]>({
    queryKey: ['rentals'],
    queryFn: getAllRentalsApi,
  });
  const { data: saleOrders = [], isLoading: loadSales } = useQuery<SaleOrder[]>({
    queryKey: ['saleOrders'],
    queryFn: getAllSaleOrdersApi,
  });
  const { data: cars = [], isLoading: loadCars } = useQuery<CarType[]>({
    queryKey: ['cars'],
    queryFn: getAllCarsApi,
  });
  const { data: users = [], isLoading: loadUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsersApi,
  });
  const { data: brands = [], isLoading: loadBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: getAllBrandsApi,
  });

  const isLoading = loadRentals || loadSales || loadCars || loadUsers || loadBrands;

  const eligibleRentals = useMemo(
    () => rentals.filter((r) => !isRentalCancelled(r)),
    [rentals]
  );
  const eligibleSales = useMemo(
    () => saleOrders.filter((o) => !isSaleCancelled(o)),
    [saleOrders]
  );

  const rentalRevenueTotal = useMemo(
    () => eligibleRentals.reduce((s, r) => s + (r.totalPrice || 0), 0),
    [eligibleRentals]
  );
  const saleRevenueTotal = useMemo(
    () => eligibleSales.reduce((s, o) => s + (o.totalPrice || 0), 0),
    [eligibleSales]
  );
  const totalRevenueCombined = rentalRevenueTotal + saleRevenueTotal;

  const monthlyData = useMemo((): MonthRow[] => {
    const map = new Map<
      string,
      { month: string; rentalRevenue: number; saleRevenue: number; rentalCount: number; saleCount: number }
    >();

    const ensure = (monthKey: string, label: string) => {
      if (!map.has(monthKey)) {
        map.set(monthKey, {
          month: label,
          rentalRevenue: 0,
          saleRevenue: 0,
          rentalCount: 0,
          saleCount: 0,
        });
      }
      return map.get(monthKey)!;
    };

    eligibleRentals.forEach((r) => {
      if (!r.startDate) return;
      try {
        const d = parseISO(r.startDate);
        const monthKey = format(startOfMonth(d), 'yyyy-MM');
        const label = format(startOfMonth(d), 'MM/yyyy', { locale: vi });
        const row = ensure(monthKey, label);
        row.rentalRevenue += r.totalPrice || 0;
        row.rentalCount += 1;
      } catch {
        /* skip */
      }
    });

    eligibleSales.forEach((o) => {
      const raw = o.createdDate;
      if (!raw) return;
      try {
        const d = parseISO(raw.length > 10 ? raw : `${raw}T12:00:00`);
        const monthKey = format(startOfMonth(d), 'yyyy-MM');
        const label = format(startOfMonth(d), 'MM/yyyy', { locale: vi });
        const row = ensure(monthKey, label);
        row.saleRevenue += o.totalPrice || 0;
        row.saleCount += 1;
      } catch {
        /* skip */
      }
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([monthKey, v]) => ({
        monthKey,
        month: v.month,
        rentalRevenue: v.rentalRevenue,
        saleRevenue: v.saleRevenue,
        totalRevenue: v.rentalRevenue + v.saleRevenue,
        rentalCount: v.rentalCount,
        saleCount: v.saleCount,
      }));
  }, [eligibleRentals, eligibleSales]);

  const revenueMixData = useMemo(() => {
    const items = [
      { name: 'Dịch vụ thuê xe', value: rentalRevenueTotal, color: RENT_COLOR },
      { name: 'Bán xe', value: saleRevenueTotal, color: SALE_COLOR },
    ];
    return items.filter((x) => x.value > 0);
  }, [rentalRevenueTotal, saleRevenueTotal]);

  const brandData = (Array.isArray(brands) ? brands : []).map((b: { id: number; name: string }) => ({
    name: b.name,
    value: cars.filter((c) => c.model?.brand?.id === b.id).length,
  })).filter((b) => b.value > 0);

  const returned = rentals.filter((r) => r.returnDate).length;
  const active = rentals.length - returned;
  const statusData = [
    { name: 'Đang thuê', value: active },
    { name: 'Đã trả', value: returned },
  ];

  const saleStatusMap = useMemo(() => {
    const m = new Map<string, number>();
    saleOrders.forEach((o) => {
      const k = o.orderStatus?.trim() || '—';
      m.set(k, (m.get(k) || 0) + 1);
    });
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [saleOrders]);

  const usersCount = Array.isArray(users) ? users.length : 0;

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

  const handleExportMonthlyCombined = () => {
    const header = [
      'Tháng',
      'Doanh thu thuê (VNĐ)',
      'Doanh thu bán xe (VNĐ)',
      'Tổng (VNĐ)',
      'Số đơn thuê',
      'Số đơn mua',
    ];
    const rows = monthlyData.map((m) => [
      m.month,
      m.rentalRevenue,
      m.saleRevenue,
      m.totalRevenue,
      m.rentalCount,
      m.saleCount,
    ]);
    downloadCsv('bao-cao-doanh-thu-theo-thang.csv', header, rows);
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
      'Ngày tạo',
      'Tổng tiền (VNĐ)',
      'Trạng thái đơn',
      'Trạng thái thanh toán',
      'Email khách',
      'Biển số',
    ];
    const rows = saleOrders.map((o) => [
      o.id,
      o.createdDate ?? '',
      o.totalPrice ?? 0,
      o.orderStatus ?? '',
      o.paymentStatus ?? '',
      o.user?.email ?? '',
      o.car?.plate ?? '',
    ]);
    downloadCsv('don-mua-xe-chi-tiet.csv', header, rows);
  };

  const handleExportExcel = async () => {
    const res = await axiosInstance.get('/api/reports/rentals/excel', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bao-cao-thue-xe.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    const res = await axiosInstance.get('/api/reports/rentals/pdf', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bao-cao-thue-xe.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return String(value);
  };

  const tooltipMoney = (value: unknown) => formatCurrency(Number(value));

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Đang tải báo cáo..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-navy">Báo cáo doanh thu</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-xl">
            Tổng hợp doanh thu từ <span className="font-medium text-navy">cho thuê xe</span> và{' '}
            <span className="font-medium text-navy">bán xe</span>. Đơn đã hủy không tính vào doanh thu.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportMonthlyCombined}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
          >
            <Download className="w-4 h-4" />
            CSV theo tháng (thuê + mua)
          </button>
          <button
            type="button"
            onClick={handleExportRentalsDetailCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-navy hover:bg-navy/90 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            CSV đơn thuê
          </button>
          <button
            type="button"
            onClick={handleExportSaleOrdersCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-navy/20 text-navy hover:bg-navy/5 font-semibold rounded-xl transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            CSV đơn mua
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            Excel
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Primary KPI — tổng doanh thu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 bg-gradient-to-br from-navy to-[#243654] rounded-2xl shadow-md p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <Wallet className="w-9 h-9 text-primary mb-4 relative" />
          <p className="text-sm text-white/70 font-medium">Tổng doanh thu (ước tính hợp đồng)</p>
          <p className="font-heading font-bold text-3xl mt-2 tracking-tight">{formatCurrency(totalRevenueCombined)}</p>
          <p className="text-xs text-white/50 mt-3">
            Thuê: {formatCurrency(rentalRevenueTotal)} · Bán: {formatCurrency(saleRevenueTotal)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Car className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Doanh thu thuê xe</p>
            <p className="font-heading font-bold text-xl text-navy">{formatCurrency(rentalRevenueTotal)}</p>
            <p className="text-xs text-gray-400 mt-1">{eligibleRentals.length} đơn (không tính hủy)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-7 h-7 text-navy" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Doanh thu bán xe</p>
            <p className="font-heading font-bold text-xl text-navy">{formatCurrency(saleRevenueTotal)}</p>
            <p className="text-xs text-gray-400 mt-1">{eligibleSales.length} đơn (không tính hủy)</p>
          </div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-blue-600 bg-blue-50">
            <FileText className="w-5 h-5" />
          </div>
          <p className="font-heading font-bold text-xl text-navy">{rentals.length}</p>
          <p className="text-gray-500 text-sm mt-1">Tổng đơn thuê (mọi TT)</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-emerald-600 bg-emerald-50">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="font-heading font-bold text-xl text-navy">{saleOrders.length}</p>
          <p className="text-gray-500 text-sm mt-1">Tổng đơn mua</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-green-600 bg-green-50">
            <Car className="w-5 h-5" />
          </div>
          <p className="font-heading font-bold text-xl text-navy">{cars.length}</p>
          <p className="text-gray-500 text-sm mt-1">Xe trong hệ thống</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-violet-600 bg-violet-50">
            <Users className="w-5 h-5" />
          </div>
          <p className="font-heading font-bold text-xl text-navy">{usersCount}</p>
          <p className="text-gray-500 text-sm mt-1">Người dùng</p>
        </div>
      </div>

      {/* Doanh thu theo tháng — grouped bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="font-heading font-semibold text-navy text-lg">Doanh thu theo tháng</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              So sánh thu từ thuê xe (theo ngày bắt đầu thuê) và bán xe (theo ngày tạo đơn)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: RENT_COLOR }} />
              Thuê xe
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: SALE_COLOR }} />
              Bán xe
            </span>
          </div>
        </div>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={monthlyData} margin={{ top: 8, right: 16, left: 4, bottom: 8 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <Tooltip
                formatter={(value: unknown, name?: string | number) => {
                  const n = String(name ?? '');
                  return [tooltipMoney(value), n === 'rentalRevenue' ? 'Thuê xe' : n === 'saleRevenue' ? 'Bán xe' : n];
                }}
                labelFormatter={(label) => `Tháng ${label}`}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value) => (value === 'rentalRevenue' ? 'Thuê xe' : value === 'saleRevenue' ? 'Bán xe' : value)}
              />
              <Bar dataKey="rentalRevenue" name="rentalRevenue" fill={RENT_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} />
              <Bar dataKey="saleRevenue" name="saleRevenue" fill={SALE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
            <TrendingUp className="w-10 h-10 opacity-40" />
            <p>Chưa có dữ liệu theo tháng</p>
            <p className="text-xs text-center max-w-md">
              Đơn mua cần có ngày tạo đơn từ hệ thống; đơn thuê cần ngày bắt đầu thuê.
            </p>
          </div>
        )}
      </div>

      {/* Trend tổng + đơn */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-heading font-semibold text-navy text-lg mb-1">Xu hướng tổng doanh thu</h2>
          <p className="text-sm text-gray-500 mb-6">Thuê + bán theo tháng</p>
          {monthlyData.some((m) => m.totalRevenue > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={RENT_COLOR} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={RENT_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: unknown) => [tooltipMoney(v), 'Tổng']} labelFormatter={(l) => `Tháng ${l}`} />
                <Area
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke={RENT_COLOR}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#totalRevGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Không có dữ liệu</div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-heading font-semibold text-navy text-lg mb-1">Số đơn theo tháng</h2>
          <p className="text-sm text-gray-500 mb-6">Đơn thuê và đơn mua (đơn hợp lệ, không hủy)</p>
          {monthlyData.some((m) => m.rentalCount + m.saleCount > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: unknown, n?: string | number) => {
                    const key = String(n ?? '');
                    const label = key === 'rentalCount' ? 'Đơn thuê' : key === 'saleCount' ? 'Đơn mua' : key;
                    return [String(v ?? ''), label];
                  }}
                  labelFormatter={(l) => `Tháng ${l}`}
                />
                <Legend formatter={(v) => (v === 'rentalCount' ? 'Đơn thuê' : 'Đơn mua')} />
                <Bar dataKey="rentalCount" name="rentalCount" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="saleCount" name="saleCount" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Không có dữ liệu</div>
          )}
        </div>
      </div>

      {/* Cơ cấu doanh thu + phân bố */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-navy" />
            <h2 className="font-heading font-semibold text-navy text-lg">Cơ cấu doanh thu</h2>
          </div>
          {revenueMixData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={revenueMixData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {revenueMixData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: unknown) => [tooltipMoney(v), '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                <div className="rounded-xl bg-amber-50/80 p-3 border border-amber-100">
                  <p className="text-amber-800/80 text-xs">Thuê xe</p>
                  <p className="font-semibold text-navy">
                    {totalRevenueCombined > 0
                      ? `${((rentalRevenueTotal / totalRevenueCombined) * 100).toFixed(1)}%`
                      : '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-100/80 p-3 border border-slate-200">
                  <p className="text-slate-600 text-xs">Bán xe</p>
                  <p className="font-semibold text-navy">
                    {totalRevenueCombined > 0
                      ? `${((saleRevenueTotal / totalRevenueCombined) * 100).toFixed(1)}%`
                      : '—'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Chưa có doanh thu</div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 xl:col-span-2">
          <h2 className="font-heading font-semibold text-navy text-lg mb-6">Phân bố xe theo thương hiệu</h2>
          {brandData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={brandData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={100}
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
            <div className="h-52 flex items-center justify-center text-gray-400">Chưa có dữ liệu</div>
          )}
        </div>
      </div>

      {/* Trạng thái đơn */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-heading font-semibold text-navy text-lg mb-6">Trạng thái đơn thuê (tổng quan)</h2>
          {rentals.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#94a3b8" />
                  </Pie>
                  <Tooltip formatter={(value: unknown) => [`${value} đơn`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-700">{active}</p>
                  <p className="text-xs text-emerald-800/80 mt-1">Chưa trả / đang xử lý</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <p className="text-2xl font-bold text-slate-600">{returned}</p>
                  <p className="text-xs text-slate-500 mt-1">Đã trả xe</p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400">Chưa có đơn thuê</div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-heading font-semibold text-navy text-lg mb-6">Trạng thái đơn mua</h2>
          {saleStatusMap.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={saleStatusMap}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={95}
                  dataKey="value"
                  label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''}: ${value}`}
                >
                  {saleStatusMap.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: unknown) => [`${value} đơn`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400">Chưa có đơn mua</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageReports;
