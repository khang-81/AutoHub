import { useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Download, FileText, Car, ShoppingBag, Wallet } from 'lucide-react';
import { getAllRentalsApi } from '../../api/rentals';
import { getAllSaleOrdersApi } from '../../api/saleOrders';
import axiosInstance from '../../api/axiosInstance';
import { formatCurrency, formatDate, getRentalBadgeDisplay } from '../../utils/helpers';
import {
  buildDailyRevenueRows,
  computeRevenueForMonth,
  computeRevenueTotals,
  filterRentalsInMonth,
  filterSalesInMonth,
  getSaleRevenueDayKey,
} from '../../utils/revenueStats';
import type { DailyRevenueRow } from '../../utils/revenueStats';
import type { Rental, SaleOrder } from '../../types';
import { format, parseISO, eachDayOfInterval, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const RENT_COLOR = '#C9A227';
const SALE_COLOR = '#1B2A4A';

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function formatYAxis(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

const tooltipMoney = (value: unknown) => formatCurrency(Number(value));

function paymentMethodLabel(method?: string | null) {
  if (method === 'CASH') return 'Tiền mặt';
  if (method === 'BANK_TRANSFER') return 'Chuyển khoản';
  return method || '—';
}

function saleOrderStatusLabel(status?: string | null) {
  const s = (status || '').toUpperCase();
  const map: Record<string, string> = {
    COMPLETED: 'Hoàn tất',
    PENDING_ADMIN_CONFIRM: 'Chờ xác nhận',
    PENDING_PAYMENT: 'Chờ thanh toán',
    CANCELLED: 'Đã hủy',
  };
  return map[s] || status || '—';
}

function carLabel(car?: Rental['car'] | SaleOrder['car']) {
  if (!car) return '—';
  const brand = car.model?.brand?.name ?? '';
  const model = car.model?.name ?? '';
  const name = `${brand} ${model}`.trim();
  return name || '—';
}

type KpiCardProps = {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  accent: string;
  highlight?: boolean;
};

function KpiCard({ label, value, sub, icon, accent, highlight }: KpiCardProps) {
  if (highlight) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-navy to-[#243654] p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-primary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${accent}`}>
          {icon}
        </div>
        <p className="text-sm text-white/70 font-medium">{label}</p>
        <p className="font-heading font-bold text-2xl sm:text-3xl mt-1 tracking-tight">{value}</p>
        <p className="text-xs text-white/50 mt-2">{sub}</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${accent}`}>{icon}</div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="font-heading font-bold text-xl sm:text-2xl text-navy mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-2">{sub}</p>
    </div>
  );
}

type DailyChartProps = {
  title: string;
  subtitle: string;
  data: DailyRevenueRow[];
  dataKey: 'rentalRevenue' | 'saleRevenue';
  color: string;
  monthSuffix: string;
  emptyText: string;
};

function DailyRevenueChart({
  title,
  subtitle,
  data,
  dataKey,
  color,
  monthSuffix,
  emptyText,
}: DailyChartProps) {
  const hasData = data.some((d) => d[dataKey] > 0);
  return (
    <div className="rounded-xl border border-gray-100 bg-slate-50/50 p-5">
      <h3 className="font-heading font-semibold text-navy">{title}</h3>
      <p className="text-xs text-gray-500 mt-0.5 mb-4">{subtitle}</p>
      {hasData ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="dayNum"
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval={0}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} width={48} />
            <Tooltip
              formatter={(value: unknown) => [tooltipMoney(value), title]}
              labelFormatter={(label) => `Ngày ${label}/${monthSuffix}`}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-52 flex flex-col items-center justify-center text-gray-400 gap-2 text-sm">
          <TrendingUp className="w-8 h-8 opacity-40" />
          <p>{emptyText}</p>
        </div>
      )}
    </div>
  );
}

const ManageReports = () => {
  const [reportMonth, setReportMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  const { data: rentals = [], isLoading: loadRentals } = useQuery<Rental[]>({
    queryKey: ['rentals'],
    queryFn: getAllRentalsApi,
  });
  const { data: saleOrders = [], isLoading: loadSales } = useQuery<SaleOrder[]>({
    queryKey: ['saleOrders'],
    queryFn: getAllSaleOrdersApi,
  });

  const isLoading = loadRentals || loadSales;

  const allTime = useMemo(() => computeRevenueTotals(rentals, saleOrders), [rentals, saleOrders]);
  const monthStats = useMemo(
    () => computeRevenueForMonth(rentals, saleOrders, reportMonth),
    [rentals, saleOrders, reportMonth]
  );

  const dailyRevenueInSelectedMonth = useMemo(() => {
    const monthStart = parseISO(`${reportMonth}-01T12:00:00`);
    const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(monthStart) });
    return buildDailyRevenueRows(rentals, saleOrders, days);
  }, [reportMonth, rentals, saleOrders]);

  const rentalsInMonth = useMemo(
    () =>
      filterRentalsInMonth(rentals, reportMonth).sort((a, b) =>
        (b.startDate || '').localeCompare(a.startDate || '')
      ),
    [rentals, reportMonth]
  );

  const salesInMonth = useMemo(
    () =>
      filterSalesInMonth(saleOrders, reportMonth).sort((a, b) =>
        (getSaleRevenueDayKey(b) || '').localeCompare(getSaleRevenueDayKey(a) || '')
      ),
    [saleOrders, reportMonth]
  );

  const monthLabel = useMemo(() => {
    try {
      return format(parseISO(`${reportMonth}-01T12:00:00`), 'MMMM yyyy', { locale: vi });
    } catch {
      return reportMonth;
    }
  }, [reportMonth]);

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

  const handleExportMonthDetail = () => {
    const rentalHeader = [
      'Mã đơn',
      'Ngày bắt đầu',
      'Ngày kết thúc',
      'Ngày trả',
      'Email khách',
      'Xe',
      'Biển số',
      'Tổng tiền (VNĐ)',
      'Phương thức TT',
      'TT thanh toán',
      'TT đơn thuê',
    ];
    const rentalRows = rentalsInMonth.map((r) => [
      r.id,
      r.startDate ?? '',
      r.endDate ?? '',
      r.returnDate ?? '',
      r.user?.email ?? '',
      carLabel(r.car),
      r.car?.plate ?? '',
      r.totalPrice ?? 0,
      paymentMethodLabel(r.paymentMethod),
      r.paymentStatus ?? '',
      getRentalBadgeDisplay(r).label,
    ]);

    const saleHeader = [
      'Mã đơn',
      'Ngày tạo',
      'Email khách',
      'Xe',
      'Biển số',
      'Tổng tiền (VNĐ)',
      'Phương thức TT',
      'TT thanh toán',
      'TT đơn mua',
      'Đã đánh giá',
    ];
    const saleRows = salesInMonth.map((o) => [
      o.id,
      o.createdDate ?? '',
      o.user?.email ?? '',
      carLabel(o.car),
      o.car?.plate ?? '',
      o.totalPrice ?? 0,
      paymentMethodLabel(o.paymentMethod),
      o.paymentStatus ?? '',
      saleOrderStatusLabel(o.orderStatus),
      o.hasReview ? 'Có' : 'Chưa',
    ]);

    downloadCsv(`chi-tiet-thang-${reportMonth}.csv`, rentalHeader, rentalRows);
    downloadCsv(`chi-tiet-mua-thang-${reportMonth}.csv`, saleHeader, saleRows);
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
          
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

      {/* KPI lũy kế — khớp Tổng quan */}
      <section>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            highlight
            label="Tổng doanh thu"
            value={formatCurrency(allTime.totalRevenue)}
            sub={`${allTime.rentalCount + allTime.saleCount} đơn hợp lệ`}
            icon={<Wallet className="w-5 h-5 text-primary" />}
            accent="bg-white/10"
          />
          <KpiCard
            label="Doanh thu thuê xe"
            value={formatCurrency(allTime.rentalRevenue)}
            sub={`${allTime.rentalCount} đơn thuê`}
            icon={<Car className="w-5 h-5 text-amber-600" />}
            accent="bg-amber-50"
          />
          <KpiCard
            label="Doanh thu bán xe"
            value={formatCurrency(allTime.saleRevenue)}
            sub={`${allTime.saleCount} đơn mua`}
            icon={<ShoppingBag className="w-5 h-5 text-navy" />}
            accent="bg-slate-100"
          />
        </div>
      </section>

      {/* Biểu đồ chi tiết theo ngày — chọn tháng tại đây */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="font-heading font-semibold text-navy text-lg">Chi tiết theo ngày</h2>
            <p className="text-sm text-gray-500 mt-0.5">Hai biểu đồ riêng cho thuê xe và bán xe</p>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="report-month" className="text-xs text-gray-500 font-medium">
              Tháng báo cáo
            </label>
            <input
              id="report-month"
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="input-field w-auto min-w-[180px]"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Tổng tháng {monthLabel}</p>
            <p className="font-heading font-bold text-lg text-navy">{formatCurrency(monthStats.totalRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Thuê xe ({monthStats.rentalCount} đơn)</p>
            <p className="font-semibold text-amber-700">{formatCurrency(monthStats.rentalRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Bán xe ({monthStats.saleCount} đơn)</p>
            <p className="font-semibold text-navy">{formatCurrency(monthStats.saleRevenue)}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <DailyRevenueChart
            title="Doanh thu thuê xe"
            subtitle="Theo ngày bắt đầu đơn thuê"
            data={dailyRevenueInSelectedMonth}
            dataKey="rentalRevenue"
            color={RENT_COLOR}
            monthSuffix={reportMonth.slice(5)}
            emptyText="Không có doanh thu thuê trong tháng"
          />
          <DailyRevenueChart
            title="Doanh thu bán xe"
            subtitle="Theo ngày tạo đơn mua"
            data={dailyRevenueInSelectedMonth}
            dataKey="saleRevenue"
            color={SALE_COLOR}
            monthSuffix={reportMonth.slice(5)}
            emptyText="Không có doanh thu bán trong tháng"
          />
        </div>
      </div>

      {/* Bảng chi tiết đơn trong tháng */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading font-semibold text-navy text-lg">
            Chi tiết đơn trong tháng {monthLabel}
          </h2>
          <button
            type="button"
            onClick={handleExportMonthDetail}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
          >
            <Download className="w-4 h-4" />
            Xuất CSV chi tiết
          </button>
        </div>

        {/* Đơn thuê */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Car className="w-5 h-5 text-amber-600" />
            <h3 className="font-heading font-semibold text-navy">
              Đơn thuê xe ({rentalsInMonth.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            {rentalsInMonth.length > 0 ? (
              <table className="w-full text-sm min-w-[960px]">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Mã</th>
                    <th className="px-4 py-3 font-medium">Ngày bắt đầu</th>
                    <th className="px-4 py-3 font-medium">Ngày kết thúc</th>
                    <th className="px-4 py-3 font-medium">Ngày trả</th>
                    <th className="px-4 py-3 font-medium">Khách hàng</th>
                    <th className="px-4 py-3 font-medium">Xe</th>
                    <th className="px-4 py-3 font-medium">Biển số</th>
                    <th className="px-4 py-3 font-medium text-right">Tổng tiền</th>
                    <th className="px-4 py-3 font-medium">Thanh toán</th>
                    <th className="px-4 py-3 font-medium">TT thanh toán</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rentalsInMonth.map((r) => {
                    const badge = getRentalBadgeDisplay(r);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 text-slate-400 font-mono">#{r.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.startDate ? formatDate(r.startDate) : '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.endDate ? formatDate(r.endDate) : '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {r.returnDate ? formatDate(r.returnDate) : '—'}
                        </td>
                        <td className="px-4 py-3 max-w-[180px] truncate" title={r.user?.email}>
                          {r.user?.email ?? '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{carLabel(r.car)}</td>
                        <td className="px-4 py-3 font-mono text-xs">{r.car?.plate ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-navy tabular-nums">
                          {formatCurrency(r.totalPrice ?? 0)}
                        </td>
                        <td className="px-4 py-3">{paymentMethodLabel(r.paymentMethod)}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{r.paymentStatus ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-amber-50/60 font-semibold text-navy border-t border-amber-100">
                    <td colSpan={7} className="px-4 py-3">
                      Tổng {rentalsInMonth.length} đơn thuê
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(monthStats.rentalRevenue)}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p className="px-6 py-10 text-center text-gray-400 text-sm">Không có đơn thuê trong tháng này</p>
            )}
          </div>
        </div>

        {/* Đơn mua */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-navy" />
            <h3 className="font-heading font-semibold text-navy">
              Đơn mua xe ({salesInMonth.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            {salesInMonth.length > 0 ? (
              <table className="w-full text-sm min-w-[880px]">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Mã</th>
                    <th className="px-4 py-3 font-medium">Ngày tạo</th>
                    <th className="px-4 py-3 font-medium">Khách hàng</th>
                    <th className="px-4 py-3 font-medium">Xe</th>
                    <th className="px-4 py-3 font-medium">Biển số</th>
                    <th className="px-4 py-3 font-medium text-right">Tổng tiền</th>
                    <th className="px-4 py-3 font-medium">Thanh toán</th>
                    <th className="px-4 py-3 font-medium">TT thanh toán</th>
                    <th className="px-4 py-3 font-medium">Trạng thái đơn</th>
                    <th className="px-4 py-3 font-medium text-center">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {salesInMonth.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 text-slate-400 font-mono">#{o.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {o.createdDate ? formatDate(o.createdDate) : '—'}
                      </td>
                      <td className="px-4 py-3 max-w-[180px] truncate" title={o.user?.email}>
                        {o.user?.email ?? '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{carLabel(o.car)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{o.car?.plate ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-navy tabular-nums">
                        {formatCurrency(o.totalPrice ?? 0)}
                      </td>
                      <td className="px-4 py-3">{paymentMethodLabel(o.paymentMethod)}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{o.paymentStatus ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {saleOrderStatusLabel(o.orderStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs">
                        {o.hasReview ? (
                          <span className="text-emerald-600 font-medium">Đã đánh giá</span>
                        ) : (
                          <span className="text-slate-400">Chưa</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100/80 font-semibold text-navy border-t border-slate-200">
                    <td colSpan={5} className="px-4 py-3">
                      Tổng {salesInMonth.length} đơn mua
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(monthStats.saleRevenue)}
                    </td>
                    <td colSpan={4} />
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p className="px-6 py-10 text-center text-gray-400 text-sm">Không có đơn mua trong tháng này</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageReports;
