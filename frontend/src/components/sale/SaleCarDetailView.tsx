import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import {
  ChevronRight,
  Star,
  Phone,
  MessageSquare,
  Clock3,
  Info,
  CalendarClock,
  Shield,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import type { ReviewDto } from '../../api/reviews';
import type { Car } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import {
  formatPriceMillions,
  estimateOnRoadPrice,
  getFuelLabel,
  getTransmissionLabel,
  inferBodyStyle,
  getConditionLabel,
  buildSaleDescriptionSections,
  SALE_PURCHASE_TERMS,
  isSaleCarSold,
} from '../../utils/saleCarHelpers';
import SaleDealerCard from './SaleDealerCard';
import CarCard from '../ui/CarCard';
import CarGallery from '../ui/CarGallery';

export interface SaleCarDetailViewProps {
  car: Car;
  reviews: ReviewDto[];
  reviewsLoading: boolean;
  relatedCars: Car[];
  isAuthenticated: boolean;
  salePaymentMethod: 'CASH' | 'BANK_TRANSFER';
  setSalePaymentMethod: (v: 'CASH' | 'BANK_TRANSFER') => void;
  onBuy: () => void;
  buyPending: boolean;
  viewingDate: Date | null;
  setViewingDate: (d: Date | null) => void;
  viewingPhone: string;
  setViewingPhone: (v: string) => void;
  viewingNote: string;
  setViewingNote: (v: string) => void;
  onViewingBook: () => void;
  viewingPending: boolean;
  canBuy: boolean;
  canScheduleViewing: boolean;
  forcedMode: 'buy' | 'view' | null;
}

function SalePriceBlock({
  title,
  salePrice,
  onRoad,
  compact,
}: {
  title: string;
  salePrice: number;
  onRoad: number;
  compact?: boolean;
}) {
  return (
    <div className={compact ? '' : 'sale-price-card'}>
      <h1 className={`font-heading font-bold leading-snug text-navy ${compact ? 'text-xl' : 'text-[1.35rem]'}`}>
        {title}
      </h1>
      <div className={`sale-price-row ${compact ? 'mt-3' : 'mt-4'}`}>
        <span className="sale-price-main">{formatPriceMillions(salePrice)}</span>
        <span className="sale-price-divider">|</span>
        <span className="sale-price-onroad">
          Giá lăn bánh: <strong>{formatPriceMillions(onRoad)}</strong>
        </span>
      </div>
      {!compact && (
        <p className="mt-1.5 text-xs text-gray-400">
          {formatCurrency(salePrice)} · Ước tính lăn bánh {formatCurrency(onRoad)}
        </p>
      )}
    </div>
  );
}

const SaleCarDetailView = ({
  car,
  reviews,
  reviewsLoading,
  relatedCars,
  isAuthenticated,
  salePaymentMethod,
  setSalePaymentMethod,
  onBuy,
  buyPending,
  viewingDate,
  setViewingDate,
  viewingPhone,
  setViewingPhone,
  viewingNote,
  setViewingNote,
  onViewingBook,
  viewingPending,
  canBuy,
  canScheduleViewing,
  forcedMode,
}: SaleCarDetailViewProps) => {
  const sold = isSaleCarSold(car);
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'buy' | 'view'>(
    forcedMode === 'view' ? 'view' : 'buy'
  );

  const brand = car.model?.brand?.name ?? '';
  const model = car.model?.name ?? '';
  const title = `${brand} ${model} ${car.modelYear}`;
  const salePrice = car.salePrice ?? 0;
  const onRoad = estimateOnRoadPrice(salePrice);
  const descriptionSections = buildSaleDescriptionSections(car);
  const condition = getConditionLabel(car.kilometer, car.modelYear);

  const specRows = useMemo(
    () => [
      { label: 'Năm SX', value: String(car.modelYear) },
      { label: 'Nhiên liệu', value: getFuelLabel(car.fuelType) },
      { label: 'Kiểu dáng', value: inferBodyStyle(car) },
      { label: 'Tình trạng', value: condition },
      { label: 'Hộp số', value: getTransmissionLabel(car.transmission) },
      { label: 'Số km', value: `${(car.kilometer / 1000).toFixed(0)}.000 km` },
      { label: 'Màu sắc', value: car.color?.name ?? '—' },
      { label: 'Xuất xứ', value: brand === 'VinFast' ? 'Trong nước' : 'Nhập khẩu / lắp ráp' },
      { label: 'Tỉnh thành', value: car.serviceCity ?? 'Hà Nội' },
      ...(car.plate ? [{ label: 'Biển số', value: car.plate }] : []),
    ],
    [car, brand, condition]
  );

  const buyPanel = sold ? (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-5 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-gray-600">Đã bán</p>
      <p className="mt-2 text-sm text-gray-500">
        Xe này đã có người mua. Bạn có thể xem các tin tương tự bên dưới hoặc quay lại danh sách.
      </p>
      <Link
        to="/cars/mua"
        className="mt-4 inline-flex rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
      >
        Xem xe khác
      </Link>
    </div>
  ) : (
    <>
      {!forcedMode && canScheduleViewing && canBuy && (
        <div className="mb-4 flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => setSidebarTab('buy')}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
              sidebarTab === 'buy' ? 'bg-white text-navy shadow-sm' : 'text-gray-500'
            }`}
          >
            Đặt mua
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab('view')}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
              sidebarTab === 'view' ? 'bg-white text-navy shadow-sm' : 'text-gray-500'
            }`}
          >
            Đặt lịch xem
          </button>
        </div>
      )}

      {(forcedMode === 'buy' || (!forcedMode && sidebarTab === 'buy')) && canBuy && (
        <div className="space-y-3">
          <div>
            <label className="sale-field-label">Phương thức thanh toán</label>
            <select
              value={salePaymentMethod}
              onChange={(e) => setSalePaymentMethod(e.target.value as 'CASH' | 'BANK_TRANSFER')}
              className="sale-field-input"
            >
              <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
              <option value="CASH">Tiền mặt khi giao xe</option>
            </select>
          </div>
          <button
            type="button"
            onClick={onBuy}
            disabled={buyPending || !canBuy}
            className="sale-btn-primary w-full disabled:opacity-60"
          >
            {buyPending ? 'Đang xử lý…' : 'Đặt mua xe'}
          </button>
          {!isAuthenticated && (
            <p className="text-center text-xs text-gray-400">
              <Link to="/login" className="font-semibold text-orange-700 hover:underline">
                Đăng nhập
              </Link>{' '}
              để đặt mua
            </p>
          )}
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            Giao dịch minh bạch · Hỗ trợ thủ tục đăng ký
          </p>
        </div>
      )}

      {(forcedMode === 'view' || (!forcedMode && sidebarTab === 'view')) && canScheduleViewing && canBuy && (
        <div className="space-y-3">
          <p className="flex items-start gap-2 text-xs text-gray-600">
            <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
            Chọn khung giờ đến showroom xem xe trước khi quyết định mua.
          </p>
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-[11px] text-gray-500 space-y-1">
            <p className="flex items-center gap-1.5">
              <Clock3 className="h-3 w-3" /> 08:00 – 17:30 (T2–T7)
            </p>
            <p className="flex items-center gap-1.5">
              <Info className="h-3 w-3" /> Đặt trước ít nhất 2 giờ
            </p>
          </div>
          <div>
            <label className="sale-field-label">Thời gian xem xe</label>
            <DatePicker
              selected={viewingDate}
              onChange={(d: Date | null) => setViewingDate(d)}
              showTimeSelect
              timeIntervals={30}
              timeCaption="Giờ"
              dateFormat="dd/MM/yyyy HH:mm"
              minDate={new Date()}
              filterDate={(date) => date.getDay() !== 0}
              filterTime={(time) => {
                const candidate = new Date(time);
                if (candidate.getDay() === 0) return false;
                const min = new Date(Date.now() + 2 * 60 * 60 * 1000);
                if (candidate < min) return false;
                const h = candidate.getHours();
                const m = candidate.getMinutes();
                if (h < 8 || h > 17) return false;
                if (h === 17 && m > 30) return false;
                return true;
              }}
              placeholderText="Chọn ngày và giờ"
              className="sale-field-input w-full"
            />
          </div>
          <div>
            <label className="sale-field-label flex items-center gap-1">
              <Phone className="h-3 w-3" /> Số điện thoại
            </label>
            <input
              type="tel"
              value={viewingPhone}
              onChange={(e) => setViewingPhone(e.target.value)}
              placeholder="0912345678"
              className="sale-field-input w-full"
              maxLength={32}
            />
          </div>
          <div>
            <label className="sale-field-label flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Ghi chú
            </label>
            <textarea
              value={viewingNote}
              onChange={(e) => setViewingNote(e.target.value)}
              placeholder="Ví dụ: Muốn xem nội thất và thử lái"
              className="sale-field-input min-h-[72px] w-full resize-none"
              maxLength={500}
            />
          </div>
          <button
            type="button"
            onClick={onViewingBook}
            disabled={viewingPending}
            className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
          >
            {viewingPending ? 'Đang gửi…' : 'Gửi lịch hẹn xem xe'}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="sale-detail-page min-h-screen bg-[#eceef1]">
      <nav className="sale-breadcrumb">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-1 px-4 py-2.5 text-[13px] text-gray-500 sm:px-5">
          <Link to="/cars/mua" className="hover:text-orange-700">
            Mua xe
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <Link to={`/cars/mua?brand=${car.model?.brand?.id ?? ''}`} className="hover:text-orange-700">
            {brand}
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className="text-gray-400">{model}</span>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className="font-medium text-navy">{car.modelYear}</span>
        </div>
      </nav>

      <div className="mx-auto max-w-[1180px] px-4 py-5 sm:px-5">
        {sold && (
          <div className="mb-4 rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700">
            Tin rao này đã được bán — không thể đặt mua hoặc đặt lịch xem.
          </div>
        )}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
          {/* ── Nội dung chính ── */}
          <div className="min-w-0 space-y-4">
            <CarGallery car={car} title={title} />

            {/* Tiêu đề + giá — mobile */}
            <div className="sale-panel lg:hidden">
              <SalePriceBlock title={title} salePrice={salePrice} onRoad={onRoad} compact />
            </div>

            {/* Tư vấn — mobile (giống oto: ngay dưới giá) */}
            <SaleDealerCard carLabel={title} className="lg:hidden" />

            {/* Tình trạng xe — một bảng duy nhất */}
            <section className="sale-panel">
              <h2 className="sale-section-title">Thông số & tình trạng</h2>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specRows.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2.5"
                  >
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                      {row.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold leading-snug text-navy">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="sale-panel">
              <h2 className="sale-section-title">Mô tả chi tiết</h2>
              <div className="space-y-5">
                {descriptionSections.map((section) => (
                  <div key={section.title}>
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-navy/80">
                      {section.title}
                    </h3>
                    {section.paragraphs?.map((p) => (
                      <p key={p.slice(0, 40)} className="mb-2 text-[15px] leading-[1.75] text-gray-700 last:mb-0">
                        {p}
                      </p>
                    ))}
                    {section.bullets && (
                      <ul className="space-y-2">
                        {section.bullets.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-gray-700">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              <p className="sale-disclaimer">
                Thông tin mang tính tham khảo tại thời điểm niêm yết. Vui lòng liên hệ chuyên viên AutoHub để nhận báo
                giá chính thức và lịch xem xe phù hợp.
              </p>
            </section>

            <section className="sale-panel">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <h2 className="sale-section-title mb-0">Điều khoản dịch vụ mua xe</h2>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">
                Bằng việc đặt mua hoặc đặt lịch xem xe trên AutoHub, bạn đồng ý với các điều khoản dưới đây. Xem thêm{' '}
                <Link to="/terms" className="font-semibold text-orange-700 hover:underline">
                  Điều khoản dịch vụ chung
                </Link>
                .
              </p>
              <div className="space-y-4">
                {(termsExpanded ? SALE_PURCHASE_TERMS : SALE_PURCHASE_TERMS.slice(0, 2)).map((group) => (
                  <div key={group.title} className="rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3">
                    <h3 className="mb-2 text-sm font-bold text-navy">{group.title}</h3>
                    <ul className="space-y-1.5">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-gray-600">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-orange-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {SALE_PURCHASE_TERMS.length > 2 && (
                <button
                  type="button"
                  onClick={() => setTermsExpanded((v) => !v)}
                  className="mt-3 text-sm font-medium text-orange-700 hover:underline"
                >
                  {termsExpanded ? 'Thu gọn điều khoản' : 'Xem đầy đủ điều khoản mua xe'}
                </button>
              )}
            </section>

            <section className="sale-panel">
              <h2 className="sale-section-title">
                Đánh giá
                {car.reviewCount != null && car.reviewCount > 0 && car.averageRating != null && (
                  <span className="ml-2 text-sm font-bold text-orange-600">
                    {car.averageRating.toFixed(1)}★ ({car.reviewCount})
                  </span>
                )}
              </h2>
              {reviewsLoading ? (
                <p className="text-sm text-gray-400">Đang tải…</p>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có đánh giá.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {reviews.map((rev) => (
                    <li key={rev.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="inline h-3.5 w-3.5 fill-amber-500" />
                          ))}
                        </span>
                        <span className="text-xs text-gray-500">{rev.authorLabel}</span>
                        <span className="text-xs text-gray-400">{formatDate(rev.createdDate)}</span>
                      </div>
                      {rev.comment && <p className="text-sm text-gray-600">{rev.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {relatedCars.length > 0 && (
              <section className="sale-panel">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                  <h2 className="sale-section-title mb-0">Xe {brand} khác</h2>
                  <Link
                    to={`/cars/mua?brand=${car.model?.brand?.id ?? ''}`}
                    className="text-sm font-semibold text-orange-700 hover:underline"
                  >
                    Xem tất cả →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedCars.map((c) => (
                    <CarCard key={c.id} car={c} variant="sale" />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="sale-sidebar-sticky space-y-4">
            <div className="sale-panel hidden lg:block">
              <SalePriceBlock title={title} salePrice={salePrice} onRoad={onRoad} />
            </div>

            <SaleDealerCard carLabel={title} className="hidden lg:block" />

            <div className="sale-panel">{buyPanel}</div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SaleCarDetailView;
