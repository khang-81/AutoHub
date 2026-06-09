import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import {
  ChevronRight,
  Share2,
  Heart,
  Star,
  Phone,
  MessageSquare,
  Clock3,
  Info,
  CalendarClock,
  Shield,
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
  buildSaleDescription,
  isSaleCarSold,
} from '../../utils/saleCarHelpers';
import SaleDealerCard from './SaleDealerCard';
import SaleLoanCalculator from './SaleLoanCalculator';
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
  saved,
  onToggleSave,
  onShare,
  compact,
}: {
  title: string;
  salePrice: number;
  onRoad: number;
  saved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
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
      <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3 text-sm text-gray-500">
        <button type="button" onClick={onShare} className="inline-flex items-center gap-1.5 hover:text-navy">
          <Share2 className="h-4 w-4" /> Chia sẻ
        </button>
        <button
          type="button"
          onClick={onToggleSave}
          className={`inline-flex items-center gap-1.5 hover:text-navy ${saved ? 'text-red-500' : ''}`}
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-red-500' : ''}`} />
          {saved ? 'Đã lưu' : 'Lưu tin'}
        </button>
      </div>
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
  const [descExpanded, setDescExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'buy' | 'view'>(
    forcedMode === 'view' ? 'view' : 'buy'
  );

  const brand = car.model?.brand?.name ?? '';
  const model = car.model?.name ?? '';
  const title = `${brand} ${model} ${car.modelYear}`;
  const salePrice = car.salePrice ?? 0;
  const onRoad = estimateOnRoadPrice(salePrice);
  const description = buildSaleDescription(car);
  const descPreview = description.length > 400 ? `${description.slice(0, 400)}…` : description;
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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* fallback */
      }
    }
    await navigator.clipboard.writeText(url);
  };

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
          <span className="font-medium text-gray-700">Mã tin {car.plate || car.id}</span>
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
              <SalePriceBlock
                title={title}
                salePrice={salePrice}
                onRoad={onRoad}
                saved={saved}
                onToggleSave={() => setSaved((v) => !v)}
                onShare={handleShare}
                compact
              />
            </div>

            {/* Tư vấn — mobile (giống oto: ngay dưới giá) */}
            <SaleDealerCard carLabel={title} className="lg:hidden" />

            {/* Tình trạng xe — một bảng duy nhất */}
            <section className="sale-panel">
              <h2 className="sale-section-title">Tình trạng xe</h2>
              <ul className="sale-spec-list">
                {specRows.map((row) => (
                  <li key={row.label} className="sale-spec-list__row">
                    <span className="sale-spec-list__label">{row.label}</span>
                    <span className="sale-spec-list__value">{row.value}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="sale-panel">
              <h2 className="sale-section-title">Mô tả</h2>
              <div className="text-[15px] leading-[1.7] text-gray-700">
                {descExpanded ? description : descPreview}
              </div>
              {description.length > 400 && (
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-3 text-sm font-medium text-orange-700 hover:underline"
                >
                  {descExpanded ? 'Thu gọn' : 'Hiển thị thêm'}
                </button>
              )}
              <p className="sale-disclaimer">
                * Lưu ý: Thông tin tin rao do người đăng tin đăng tải. Giá và ưu đãi có thể thay đổi — vui lòng liên
                hệ chuyên viên để được báo giá chính xác.
              </p>
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
                <h2 className="sale-section-title">Xe {brand} khác</h2>
                <div className="space-y-3">
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
              <SalePriceBlock
                title={title}
                salePrice={salePrice}
                onRoad={onRoad}
                saved={saved}
                onToggleSave={() => setSaved((v) => !v)}
                onShare={handleShare}
              />
            </div>

            <SaleDealerCard carLabel={title} className="hidden lg:block" />

            <div className="sale-panel">{buyPanel}</div>

            <SaleLoanCalculator carPrice={salePrice} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SaleCarDetailView;
