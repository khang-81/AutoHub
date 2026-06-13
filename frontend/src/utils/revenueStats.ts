import { format, parseISO, startOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Rental, SaleOrder } from '../types';

/** Đơn hủy không tính vào doanh thu — dùng chung cho Tổng quan & Báo cáo. */
export function isRentalCancelled(r: Rental): boolean {
  return (r.rentalStatus || '').toUpperCase() === 'CANCELLED';
}

export function isSaleCancelled(o: SaleOrder): boolean {
  if (o.cancelledAt) return true;
  return (o.orderStatus || '').toUpperCase() === 'CANCELLED';
}

export function filterEligibleRentals(rentals: Rental[]): Rental[] {
  return rentals.filter((r) => !isRentalCancelled(r));
}

export function filterEligibleSales(saleOrders: SaleOrder[]): SaleOrder[] {
  return saleOrders.filter((o) => !isSaleCancelled(o));
}

/** Có ngày ghi nhận doanh thu — dùng cho lũy kế (khớp tổng các tháng). */
export function isRentalRevenueEligible(r: Rental): boolean {
  return !isRentalCancelled(r) && getRentalRevenueDayKey(r) != null;
}

export function isSaleRevenueEligible(o: SaleOrder): boolean {
  return !isSaleCancelled(o) && getSaleRevenueDayKey(o) != null;
}

export function filterRevenueEligibleRentals(rentals: Rental[]): Rental[] {
  return rentals.filter(isRentalRevenueEligible);
}

export function filterRevenueEligibleSales(saleOrders: SaleOrder[]): SaleOrder[] {
  return saleOrders.filter(isSaleRevenueEligible);
}

export type RevenueTotals = {
  rentalRevenue: number;
  saleRevenue: number;
  totalRevenue: number;
  rentalCount: number;
  saleCount: number;
};

export function computeRevenueTotals(rentals: Rental[], saleOrders: SaleOrder[]): RevenueTotals {
  const eligibleRentals = filterRevenueEligibleRentals(rentals);
  const eligibleSales = filterRevenueEligibleSales(saleOrders);
  const rentalRevenue = eligibleRentals.reduce((s, r) => s + (r.totalPrice || 0), 0);
  const saleRevenue = eligibleSales.reduce((s, o) => s + (o.totalPrice || 0), 0);
  return {
    rentalRevenue,
    saleRevenue,
    totalRevenue: rentalRevenue + saleRevenue,
    rentalCount: eligibleRentals.length,
    saleCount: eligibleSales.length,
  };
}

/** Thuê: theo ngày bắt đầu đơn. */
export function getRentalRevenueDayKey(r: Rental): string | null {
  if (!r.startDate) return null;
  try {
    return format(parseISO(r.startDate), 'yyyy-MM-dd');
  } catch {
    return null;
  }
}

/** Mua: theo ngày tạo đơn. */
export function getSaleRevenueDayKey(o: SaleOrder): string | null {
  const raw = o.createdDate;
  if (!raw) return null;
  try {
    const d = parseISO(raw.length > 10 ? raw : `${raw}T12:00:00`);
    return format(d, 'yyyy-MM-dd');
  } catch {
    return null;
  }
}

export function computeRevenueForMonth(
  rentals: Rental[],
  saleOrders: SaleOrder[],
  monthKey: string
): RevenueTotals {
  let rentalRevenue = 0;
  let saleRevenue = 0;
  let rentalCount = 0;
  let saleCount = 0;

  filterRevenueEligibleRentals(rentals).forEach((r) => {
    const dayKey = getRentalRevenueDayKey(r);
    if (dayKey?.startsWith(monthKey)) {
      rentalRevenue += r.totalPrice || 0;
      rentalCount += 1;
    }
  });

  filterRevenueEligibleSales(saleOrders).forEach((o) => {
    const dayKey = getSaleRevenueDayKey(o);
    if (dayKey?.startsWith(monthKey)) {
      saleRevenue += o.totalPrice || 0;
      saleCount += 1;
    }
  });

  return {
    rentalRevenue,
    saleRevenue,
    totalRevenue: rentalRevenue + saleRevenue,
    rentalCount,
    saleCount,
  };
}

export type MonthRevenueRow = {
  monthKey: string;
  month: string;
  rentalRevenue: number;
  saleRevenue: number;
  totalRevenue: number;
  rentalCount: number;
  saleCount: number;
};

export function buildMonthlyRevenueRows(
  rentals: Rental[],
  saleOrders: SaleOrder[],
  maxMonths = 12
): MonthRevenueRow[] {
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

  filterRevenueEligibleRentals(rentals).forEach((r) => {
    const dayKey = getRentalRevenueDayKey(r);
    if (!dayKey) return;
    try {
      const d = parseISO(dayKey);
      const monthKey = format(startOfMonth(d), 'yyyy-MM');
      const label = format(startOfMonth(d), 'MM/yyyy', { locale: vi });
      const row = ensure(monthKey, label);
      row.rentalRevenue += r.totalPrice || 0;
      row.rentalCount += 1;
    } catch {
      /* skip */
    }
  });

  filterRevenueEligibleSales(saleOrders).forEach((o) => {
    const dayKey = getSaleRevenueDayKey(o);
    if (!dayKey) return;
    try {
      const d = parseISO(dayKey);
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
    .slice(-maxMonths)
    .map(([monthKey, v]) => ({
      monthKey,
      month: v.month,
      rentalRevenue: v.rentalRevenue,
      saleRevenue: v.saleRevenue,
      totalRevenue: v.rentalRevenue + v.saleRevenue,
      rentalCount: v.rentalCount,
      saleCount: v.saleCount,
    }));
}

export type DailyRevenueRow = {
  dayNum: string;
  dayKey: string;
  rentalRevenue: number;
  saleRevenue: number;
  totalRevenue: number;
};

export function filterRentalsInMonth(rentals: Rental[], monthKey: string): Rental[] {
  return filterRevenueEligibleRentals(rentals).filter((r) => {
    const dayKey = getRentalRevenueDayKey(r);
    return dayKey?.startsWith(monthKey);
  });
}

export function filterSalesInMonth(saleOrders: SaleOrder[], monthKey: string): SaleOrder[] {
  return filterRevenueEligibleSales(saleOrders).filter((o) => {
    const dayKey = getSaleRevenueDayKey(o);
    return dayKey?.startsWith(monthKey);
  });
}

export function buildDailyRevenueRows(
  rentals: Rental[],
  saleOrders: SaleOrder[],
  days: Date[]
): DailyRevenueRow[] {
  return days.map((day) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    let rentalRevenue = 0;
    let saleRevenue = 0;

    filterRevenueEligibleRentals(rentals).forEach((r) => {
      if (getRentalRevenueDayKey(r) === dayKey) {
        rentalRevenue += r.totalPrice || 0;
      }
    });

    filterRevenueEligibleSales(saleOrders).forEach((o) => {
      if (getSaleRevenueDayKey(o) === dayKey) {
        saleRevenue += o.totalPrice || 0;
      }
    });

    return {
      dayNum: format(day, 'd'),
      dayKey,
      rentalRevenue,
      saleRevenue,
      totalRevenue: rentalRevenue + saleRevenue,
    };
  });
}
