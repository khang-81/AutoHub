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

export interface SaleDescriptionSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface SalePurchaseTermGroup {
  title: string;
  items: string[];
}

/** Mô tả tin bán — nội dung có cấu trúc, phù hợp trang chi tiết. */
export function buildSaleDescriptionSections(car: Car): SaleDescriptionSection[] {
  const brand = car.model?.brand?.name ?? '';
  const model = car.model?.name ?? '';
  const year = car.modelYear;
  const km = car.kilometer;
  const kmLabel = `${(km / 1000).toFixed(0)}.000 km`;
  const color = car.color?.name ?? 'theo niêm yết';
  const fuel = getFuelLabel(car.fuelType);
  const trans = getTransmissionLabel(car.transmission);
  const body = inferBodyStyle(car);
  const condition = getConditionLabel(km, year);
  const city = car.serviceCity ?? 'Hà Nội';
  const seats = car.seats ?? 5;
  const title = `${brand} ${model} ${year}`.trim();

  const highlights: string[] = [
    `${condition} — odometer ${kmLabel}, phù hợp nhu cầu sử dụng thực tế`,
    `Dòng ${body}, ${seats} chỗ, hộp số ${trans.toLowerCase()}, ${fuel.toLowerCase()}`,
    `Màu ${color}${car.plate ? ` · biển số ${car.plate}` : ''}`,
    'Hồ sơ xe minh bạch, kiểm tra kỹ thuật trước khi niêm yết trên AutoHub',
    `Hỗ trợ tư vấn giá lăn bánh, vay trả góp và thủ tục sang tên tại ${city}`,
  ];

  if (String(car.fuelType ?? '').toUpperCase() === 'ELECTRIC') {
    highlights.push('Xe điện — chi phí vận hành tối ưu, phù hợp di chuyển nội đô');
  }

  return [
    {
      title: 'Tổng quan',
      paragraphs: [
        `AutoHub giới thiệu ${title} — phương tiện được tuyển chọn, kiểm định và niêm yết trực tiếp trên nền tảng. Tin rao công bố đầy đủ thông số kỹ thuật, tình trạng xe và mức giá tham khảo để khách hàng chủ động so sánh và quyết định.`,
        `Khách hàng có thể đặt lịch xem xe tại showroom, đặt mua trực tuyến hoặc liên hệ chuyên viên AutoHub để được báo giá chi tiết (giá xe, phí trước bạ, đăng ký và các khoản phát sinh nếu có).`,
      ],
    },
    {
      title: 'Điểm nổi bật',
      bullets: highlights,
    },
    {
      title: 'Cam kết từ AutoHub',
      bullets: [
        'Thông tin niêm yết được rà soát trước khi đăng tải; giá và ưu đãi có thể điều chỉnh theo thời điểm giao dịch.',
        'Hỗ trợ thủ tục mua bán, sang tên và tư vấn hình thức thanh toán (tiền mặt / chuyển khoản / trả góp).',
        'Đội ngũ tư vấn đồng hành từ khâu xem xe đến khi bàn giao — minh bạch, không phí ẩn.',
      ],
    },
  ];
}

/** Văn bản mô tả gộp (dùng khi cần preview ngắn). */
export function buildSaleDescription(car: Car): string {
  return buildSaleDescriptionSections(car)
    .flatMap((s) => [...(s.paragraphs ?? []), ...(s.bullets ?? [])])
    .join(' ');
}

/** Điều khoản dịch vụ mua xe — hiển thị tại trang chi tiết tin bán. */
export const SALE_PURCHASE_TERMS: SalePurchaseTermGroup[] = [
  {
    title: 'Điều kiện đặt mua',
    items: [
      'Khách hàng cần có tài khoản AutoHub đã xác minh GPLX (CCCD + giấy phép lái xe) theo quy định hệ thống.',
      'Đơn đặt mua chỉ được xử lý khi xe còn trạng thái niêm yết (AVAILABLE); mỗi tin bán chỉ gắn với một giao dịch hoàn tất.',
      'Giá niêm yết mang tính tham khảo; giá chốt và giá lăn bánh sẽ được xác nhận bởi chuyên viên trước khi thanh toán.',
    ],
  },
  {
    title: 'Thanh toán & đặt cọc',
    items: [
      'Hỗ trợ thanh toán chuyển khoản ngân hàng hoặc tiền mặt khi bàn giao — theo phương thức khách chọn trên đơn.',
      'Khách hàng chịu trách nhiệm nhập đúng nội dung chuyển khoản để đơn được admin xác nhận kịp thời.',
      'Số tiền cọc / tạm ứng (nếu có) và lịch thanh toán phần còn lại sẽ được thông báo rõ trên đơn mua và qua email.',
    ],
  },
  {
    title: 'Kiểm tra, bàn giao & thủ tục',
    items: [
      'Khách được khuyến khích đặt lịch xem xe trước khi quyết định; AutoHub hỗ trợ kiểm tra ngoại thất, nội thất và vận hành cơ bản.',
      'Thời gian và địa điểm bàn giao xe thống nhất sau khi đơn được xác nhận thanh toán.',
      'AutoHub hỗ trợ tư vấn thủ tục đăng ký, sang tên; chi phí trước bạ, đăng ký và bảo hiểm do khách thanh toán theo quy định nhà nước.',
    ],
  },
  {
    title: 'Hủy đơn & hoàn tiền',
    items: [
      'Khách có thể yêu cầu hủy đơn khi trạng thái còn cho phép (chờ thanh toán / chờ xác nhận) — chi tiết theo trạng thái đơn tại thời điểm hủy.',
      'AutoHub có quyền từ chối hoặc hủy đơn nếu phát hiện thông tin không trung thực hoặc vi phạm điều khoản.',
      'Mọi khoản hoàn tiền (nếu được chấp nhận) xử lý sau khi xác minh, trong thời gian hợp lý theo chính sách nội bộ.',
    ],
  },
];

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
