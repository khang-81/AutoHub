import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays, parseISO } from 'date-fns';
import { API_BASE_URL } from '../config/api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'VND') {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString: string) {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Local datetime cho API (LocalDateTime), ví dụ 2026-04-20T14:30:00 */
export function formatDateTimeForApi(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

export function formatDateTime(dateString: string) {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
  } catch {
    return dateString;
  }
}

export function calculateRentalDays(startDate: Date, endDate: Date): number {
  const days = differenceInDays(endDate, startDate);
  return Math.max(days, 1);
}

export function calculateTotalPrice(dailyPrice: number, startDate: Date, endDate: Date): number {
  const days = calculateRentalDays(startDate, endDate);
  return dailyPrice * days;
}

export function formatKilometer(km: number): string {
  return new Intl.NumberFormat('vi-VN').format(km) + ' km';
}

/** JWT dùng Base64URL, không padding — `atob` trên trình duyệt cần padding đúng bội 4. */
function decodeJwtPayloadSegment(base64Url: string): string {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLen);
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export function getRoleFromToken(token: string): string[] {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return [];
    const jsonPayload = decodeJwtPayloadSegment(base64Url);
    const payload = JSON.parse(jsonPayload);
    return payload.roles || payload.authorities || [];
  } catch {
    return [];
  }
}

export function getUserIdFromToken(token: string): number | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const jsonPayload = decodeJwtPayloadSegment(base64Url);
    const payload = JSON.parse(jsonPayload);
    const raw = payload.id ?? payload.userId;
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function getEmailFromToken(token: string): string | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const jsonPayload = decodeJwtPayloadSegment(base64Url);
    const payload = JSON.parse(jsonPayload);
    return payload.sub || payload.email || null;
  } catch {
    return null;
  }
}

/** true nếu JWT hết hạn (theo claim `exp`, giây UTC) hoặc payload không đọc được */
export function isJwtExpired(token: string): boolean {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    const jsonPayload = decodeJwtPayloadSegment(base64Url);
    const payload = JSON.parse(jsonPayload);
    const exp = payload.exp;
    if (typeof exp !== 'number') return false;
    return exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

/** Lấy message từ body lỗi Axios/Spring (message hoặc field đầu tiên). */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { message?: string } | Record<string, string> } };
  const d = e?.response?.data;
  if (d && typeof d === 'object' && 'message' in d && typeof (d as { message?: unknown }).message === 'string') {
    return (d as { message: string }).message;
  }
  if (d && typeof d === 'object') {
    const first = Object.values(d).find((v) => typeof v === 'string');
    if (first) return first as string;
  }
  return fallback;
}

export const CAR_PLACEHOLDER = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80';

/** URL hiển thị ảnh: https trực tiếp hoặc `/files/...` trên cùng origin API.
 *  BUGFIX #2: Tự build prefix `/files/public/` cho ảnh car/brand (file công khai).
 *  File KYC dùng `fetchKycFileAsBlobUrl()` riêng (cần Authorization header). */
export function resolveMediaUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = API_BASE_URL.replace(/\/+$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  // Ảnh đã có sẵn prefix /files/... (vd khi admin upload trả url mới) — giữ nguyên.
  if (path.startsWith('/files/')) {
    return base ? `${base}${path}` : path;
  }
  // Relative path như "cars/car_5/uuid.jpg" — thêm /files/public/ để match static handler.
  const publicPath = path.startsWith('/') ? path : `/${path}`;
  const finalPath = publicPath.startsWith('/files/public/')
    ? publicPath
    : `/files/public${publicPath}`;
  return base ? `${base}${finalPath}` : finalPath;
}

/** Badge trạng thái đơn thuê trên lịch sử / dashboard khách. */
export function getRentalBadgeDisplay(rental: {
  returnDate?: string | null;
  rentalStatus?: string | null;
  paymentStatus?: string | null;
}): { label: string; className: string } {
  const status = (rental.rentalStatus ?? '').trim().toUpperCase();
  const ps = (rental.paymentStatus ?? '').trim().toUpperCase();
  const canReturnCar = !rental.returnDate && status === 'CONFIRMED';

  if (rental.returnDate) {
    return { label: '✓ Đã trả xe', className: 'bg-gray-100 text-gray-500' };
  }
  if (status === 'PENDING_RETURN') {
    return {
      label: '⏳ Chờ admin xác nhận trả xe',
      className: 'border border-amber-300 bg-amber-100 font-semibold text-amber-900',
    };
  }
  if (canReturnCar) {
    return {
      label: '🚗 Đang thuê — có thể trả xe',
      className: 'border border-emerald-300 bg-emerald-100 font-semibold text-emerald-900',
    };
  }
  if (status === 'PENDING_ADMIN_CONFIRM' || ps === 'PENDING_CONFIRM') {
    return { label: '⏳ Chờ xác nhận', className: 'bg-amber-100 text-amber-800 font-semibold' };
  }
  if (status === 'PENDING_PAYMENT' || ps === 'PENDING_TRANSFER') {
    return { label: 'Chờ thanh toán', className: 'bg-blue-100 text-blue-700' };
  }
  if (status === 'CANCELLED') {
    return { label: 'Đã hủy', className: 'bg-gray-100 text-gray-500' };
  }
  if (status === 'COMPLETED') {
    return { label: '✓ Đã hoàn tất', className: 'bg-gray-100 text-gray-500' };
  }
  return { label: '🚗 Đang thuê', className: 'bg-green-100 text-green-700' };
}

/** Ngày trả mặc định: không muộn hơn ngày kết thúc hợp đồng nếu chuyến đã qua. */
export function suggestRentalReturnDate(rental: { endDate?: string | null }): string {
  const today = format(new Date(), 'yyyy-MM-dd');
  const end = rental.endDate?.slice(0, 10);
  if (!end) return today;
  return end <= today ? end : today;
}

export type RentalBalanceBreakdown = {
  contractRemainder: number;
  lateFee: number;
  overKmFee: number;
  missingFuelFee: number;
  incidentals: number;
  deposit: number;
  totalDue: number;
  paidFullContractUpfront: boolean;
};

/** Giải thích số tiền còn phải thanh toán sau trả xe (khớp công thức backend). */
export function getRentalBalanceBreakdown(rental: {
  totalPrice: number;
  depositAmount?: number | null;
  paymentStatus?: string | null;
  balanceDueAtReturn?: number | null;
  lateFeeAmount?: number | null;
  overKmFee?: number | null;
  missingFuelFee?: number | null;
  returnAdditionalFees?: number | null;
}): RentalBalanceBreakdown | null {
  const totalDue = rental.balanceDueAtReturn ?? 0;
  if (totalDue <= 0) return null;

  const deposit = rental.depositAmount ?? 0;
  const ps = (rental.paymentStatus ?? '').trim().toUpperCase();
  const paidFullContractUpfront = ps === 'PAID';
  const lateFee = rental.lateFeeAmount ?? 0;
  const overKmFee = rental.overKmFee ?? 0;
  const missingFuelFee = rental.missingFuelFee ?? 0;
  const incidentals = rental.returnAdditionalFees ?? 0;
  const contractRemainder = paidFullContractUpfront ? 0 : Math.max(0, rental.totalPrice - deposit);

  return {
    contractRemainder,
    lateFee,
    overKmFee,
    missingFuelFee,
    incidentals,
    deposit,
    totalDue,
    paidFullContractUpfront,
  };
}
