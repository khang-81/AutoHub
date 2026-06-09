import type { Car, FuelType, Transmission } from '../types';

const FUEL_LABELS: Record<string, string> = {
  GASOLINE: 'Máy xăng',
  DIESEL: 'Máy dầu',
  HYBRID: 'Hybrid',
  ELECTRIC: 'Xe điện',
};

const TRANSMISSION_LABELS: Record<string, string> = {
  AUTO: 'Số tự động',
  MANUAL: 'Số sàn',
};

/** Giá dạng "510 triệu" như oto.com.vn */
export function formatPriceMillions(amount: number): string {
  const m = amount / 1_000_000;
  if (m >= 1000) {
    const t = m / 1000;
    const rounded = Math.round(t * 10) / 10;
    return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded} tỷ`;
  }
  const rounded = Math.round(m * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded} triệu`;
}

/** Ước tính giá lăn bánh (~12% phí trước bạ + đăng ký) */
export function estimateOnRoadPrice(salePrice: number): number {
  return Math.round(salePrice * 1.12 / 1_000_000) * 1_000_000;
}

export function getFuelLabel(fuel?: FuelType | string | null): string {
  if (!fuel) return '—';
  return FUEL_LABELS[String(fuel).toUpperCase()] ?? String(fuel);
}

export function getTransmissionLabel(trans?: Transmission | string | null): string {
  if (!trans) return '—';
  return TRANSMISSION_LABELS[String(trans).toUpperCase()] ?? String(trans);
}

export function inferBodyStyle(car: Car): string {
  const seats = car.seats ?? 5;
  const fuel = String(car.fuelType ?? '').toUpperCase();
  if (fuel === 'ELECTRIC') return seats >= 7 ? 'MPV điện' : 'Sedan / SUV điện';
  if (seats >= 9) return 'Xe khách';
  if (seats >= 7) return 'MPV / SUV';
  if (seats <= 4) return 'Hatchback';
  return 'Sedan';
}

export function getConditionLabel(km: number, modelYear: number): string {
  const currentYear = new Date().getFullYear();
  if (km < 100 && modelYear >= currentYear - 1) return 'Xe mới';
  if (km < 15_000) return 'Xe ít đi';
  if (km < 50_000) return 'Xe cũ';
  return 'Xe đã qua sử dụng';
}

export function buildSaleDescription(car: Car): string {
  const brand = car.model?.brand?.name ?? '';
  const model = car.model?.name ?? '';
  const year = car.modelYear;
  const km = car.kilometer;
  const color = car.color?.name ?? '';
  const fuel = getFuelLabel(car.fuelType);
  const trans = getTransmissionLabel(car.transmission);
  const city = car.serviceCity ?? 'Hà Nội';

  return (
    `${brand} ${model} ${year} — ${getConditionLabel(km, year).toLowerCase()}, màu ${color}, ` +
    `đã đi ${(km / 1000).toFixed(0)}.000 km. Nhiên liệu: ${fuel}, hộp số ${trans}. ` +
    `Xe được AutoHub kiểm định kỹ thuật, minh bạch lịch sử và hỗ trợ thủ tục đăng ký, ` +
    `vay trả góp tại ${city}. Liên hệ hotline hoặc Zalo để được tư vấn giá lăn bánh và ưu đãi trả góp.`
  );
}

/** Trả góp đều hàng tháng (gốc + lãi cố định) */
export function calcMonthlyInstallment(
  principal: number,
  annualRatePercent: number,
  months: number
): number {
  if (months <= 0 || principal <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return Math.round(principal / months);
  const factor = Math.pow(1 + r, months);
  return Math.round((principal * r * factor) / (factor - 1));
}

export function isSaleCarSold(car: Pick<Car, 'saleStatus'>): boolean {
  return (car.saleStatus ?? '').toUpperCase() === 'SOLD';
}

export function isSaleCarAvailable(car: Pick<Car, 'saleStatus' | 'salePrice' | 'listingType'>): boolean {
  const lt = (car.listingType ?? 'SALE_ONLY').toUpperCase();
  return (
    lt === 'SALE_ONLY' &&
    !isSaleCarSold(car) &&
    (car.saleStatus ?? 'AVAILABLE').toUpperCase() === 'AVAILABLE' &&
    (car.salePrice ?? 0) > 0
  );
}
