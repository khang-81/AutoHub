import { Link } from 'react-router-dom';
import { Calendar, Gauge, Hash, Star, ArrowUpRight, KeyRound, Tag, Cog } from 'lucide-react';
import type { Car } from '../../types';
import { formatCurrency, CAR_PLACEHOLDER, resolveMediaUrl } from '../../utils/helpers';
import { formatPriceMillions, getTransmissionLabel, isSaleCarSold } from '../../utils/saleCarHelpers';

/** Ngữ cảnh danh sách: thuê và mua tách giao diện; `all` dùng trang chủ / mixed. */
export type CarCardListingVariant = 'rent' | 'sale' | 'all';

export interface CarCardProps {
  car: Car;
  variant?: CarCardListingVariant;
}

function listingFlags(car: Car) {
  const lt = (car.listingType || 'RENT_ONLY').toUpperCase();
  const rentCapable = lt === 'RENT_ONLY';
  const saleCapable = lt === 'SALE_ONLY';
  const saleOk = saleCapable && car.saleStatus === 'AVAILABLE' && (car.salePrice ?? 0) > 0;
  return { lt, rentCapable, saleCapable, saleOk };
}

function resolveDisplay(car: Car, variant: CarCardListingVariant) {
  const { rentCapable, saleCapable, saleOk } = listingFlags(car);

  if (variant === 'rent') {
    return {
      mode: 'rent' as const,
      showRentBadge: true,
      showSaleBadge: false,
      showRentPrice: rentCapable && car.dailyPrice > 0,
      showSalePrice: false,
      cta: 'Xem & đặt thuê',
      overlayClass:
        'bg-gradient-to-t from-emerald-950/90 via-navy-900/35 to-navy-900/10 opacity-[0.92]',
      pricePanelClass: 'from-emerald-50/90 to-navy-50/80 ring-emerald-100/70',
    };
  }
  if (variant === 'sale') {
    return {
      mode: 'sale' as const,
      showRentBadge: false,
      showSaleBadge: true,
      showRentPrice: false,
      showSalePrice: saleCapable && (car.salePrice ?? 0) > 0,
      cta: 'Xem chi tiết',
      overlayClass: 'bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80',
      pricePanelClass: 'from-white to-white ring-gray-100',
    };
  }
  // all — theo loại xe thật: chỉ thuê / chỉ bán / cả hai
  return {
    mode: 'all' as const,
    showRentBadge: rentCapable,
    showSaleBadge: saleCapable,
    showRentPrice: rentCapable && car.dailyPrice > 0,
    showSalePrice: saleCapable && (car.salePrice ?? 0) > 0,
    cta: 'Xem chi tiết',
    overlayClass: 'bg-gradient-to-t from-navy-900/85 via-navy-900/20 to-transparent opacity-90',
    pricePanelClass: 'from-navy-50/80 to-gray-50/80 ring-navy-100/60',
    saleOk,
  };
}

const CarCard = ({ car, variant = 'all' }: CarCardProps) => {
  const d = resolveDisplay(car, variant);
  const { saleOk } = listingFlags(car);
  const isSaleCard = d.mode === 'sale';

  if (isSaleCard) {
    const trans = getTransmissionLabel(car.transmission);
    const sold = isSaleCarSold(car);
    const cardBody = (
      <div className={`flex flex-col sm:flex-row ${sold ? 'cursor-not-allowed' : ''}`}>
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gray-100 sm:aspect-auto sm:h-36 sm:w-44 md:h-40 md:w-48">
          <img
            src={resolveMediaUrl(car.imagePath) || CAR_PLACEHOLDER}
            alt=""
            className={`h-full w-full object-cover transition duration-500 ${sold ? 'opacity-60 grayscale-[0.35]' : 'group-hover:scale-105'}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
            }}
          />
          {sold ? (
            <span className="absolute left-2 top-2 rounded bg-gray-800 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Đã bán
            </span>
          ) : (
            car.kilometer < 100 && (
              <span className="absolute left-2 top-2 rounded bg-orange-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Xe mới
              </span>
            )
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
          <div>
            <h3 className={`font-heading text-base font-bold leading-snug md:text-lg ${sold ? 'text-gray-500' : 'text-navy'}`}>
              {car.modelYear} — {car.model?.brand?.name} {car.model?.name}
            </h3>
            <p className="mt-1 line-clamp-1 text-sm text-gray-500">
              {car.color?.name}
              {car.plate ? ` · ${car.plate}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
              {car.kilometer > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1">
                  <Gauge className="h-3 w-3" />
                  {(car.kilometer / 1000).toFixed(0)}.000 km
                </span>
              )}
              {trans !== '—' && (
                <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1">
                  <Cog className="h-3 w-3" />
                  {trans}
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2 border-t border-gray-100 pt-3">
            {d.showSalePrice && (
              <span className={`text-xl font-extrabold md:text-2xl ${sold ? 'text-gray-400 line-through' : 'text-red-600'}`}>
                {formatPriceMillions(car.salePrice!)}
              </span>
            )}
            <span className={`text-sm font-semibold ${sold ? 'text-gray-500' : 'text-orange-700 group-hover:underline'}`}>
              {sold ? 'Đã bán' : `${d.cta} →`}
            </span>
          </div>
        </div>
      </div>
    );
    return (
      <article
        className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
          sold ? 'border-gray-200 opacity-90' : 'border-gray-200 transition hover:border-orange-200 hover:shadow-md group'
        }`}
      >
        {sold ? cardBody : <Link to={`/cars/${car.id}`}>{cardBody}</Link>}
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-xl hover:ring-primary/10">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-navy-100 to-gray-100">
        <img
          src={resolveMediaUrl(car.imagePath) || CAR_PLACEHOLDER}
          alt={`${car.model?.brand?.name} ${car.model?.name}`}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
          }}
        />
        <div className={`absolute inset-0 ${d.overlayClass}`} />
        <div className="absolute left-3 top-3 right-14 flex flex-wrap gap-1.5">
          <span className="rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-navy shadow-sm backdrop-blur-sm">
            {car.model?.brand?.name}
          </span>
          {d.showRentBadge && (
            <span className="rounded-lg bg-emerald-600/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
              Cho thuê
            </span>
          )}
          {d.showSaleBadge && (
            <span
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm ${
                car.saleStatus === 'SOLD'
                  ? 'bg-gray-600/95'
                  : saleOk
                    ? 'bg-orange-600/95'
                    : 'bg-amber-800/90'
              }`}
            >
              {car.saleStatus === 'SOLD' ? 'Đã bán' : 'Niêm yết bán'}
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3">
          <div className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 shadow-md backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="text-xs font-bold text-navy">
              {car.reviewCount != null && car.reviewCount > 0 && car.averageRating != null
                ? car.averageRating.toFixed(1)
                : '—'}
            </span>
            {car.reviewCount != null && car.reviewCount > 0 && (
              <span className="text-[10px] font-medium text-gray-500">({car.reviewCount})</span>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8">
          <h3 className="font-heading text-lg font-bold leading-tight text-white drop-shadow-sm md:text-xl">
            {car.model?.brand?.name} {car.model?.name}
          </h3>
          <p className="mt-0.5 text-sm text-white/85">
            {car.color?.name} · {car.modelYear}
            {car.plate ? ` · ${car.plate}` : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-3">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy-50 px-2.5 py-1.5 text-xs font-medium text-navy-600">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            {car.modelYear}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy-50 px-2.5 py-1.5 text-xs font-medium text-navy-600">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            {car.kilometer != null ? `${(Number(car.kilometer) / 1000).toFixed(0)}k km` : '—'}
          </span>
          {car.plate && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy-50 px-2.5 py-1.5 text-xs font-medium text-navy-600">
              <Hash className="h-3.5 w-3.5 text-primary" />
              {car.plate}
            </span>
          )}
        </div>

        <div
          className={`mb-4 space-y-2 rounded-xl bg-gradient-to-br p-3 ring-1 ${d.pricePanelClass}`}
        >
          {d.showRentPrice && (
            <div className="flex items-end justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <KeyRound className="h-3 w-3 text-emerald-600" />
                Giá thuê
              </span>
              <div className="text-right">
                <span className="font-heading text-lg font-bold text-primary md:text-xl">
                  {formatCurrency(car.dailyPrice)}
                </span>
                <span className="text-xs font-medium text-gray-400">/ngày</span>
              </div>
            </div>
          )}
          {d.showSalePrice && (
            <div
              className={`flex items-end justify-between gap-2 ${d.showRentPrice ? 'border-t border-navy-100/80 pt-2' : ''}`}
            >
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <Tag className="h-3 w-3 text-orange-600" />
                Giá mua
              </span>
              <span className="font-heading text-lg font-bold text-orange-700 md:text-xl">
                {formatCurrency(car.salePrice!)}
              </span>
            </div>
          )}
        </div>

        <Link
          to={`/cars/${car.id}`}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-navy-400 hover:shadow-lg"
        >
          {d.cta}
          <ArrowUpRight className="h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
};

/** Hàng ngang cho chế độ danh sách */
export function CarListRow({ car, variant = 'all' }: CarCardProps) {
  const d = resolveDisplay(car, variant);
  const { rentCapable, saleCapable } = listingFlags(car);

  if (d.mode === 'sale') {
    const trans = getTransmissionLabel(car.transmission);
    const sold = isSaleCarSold(car);
    const rowBody = (
      <div className={`flex gap-4 md:gap-5 ${sold ? 'cursor-not-allowed' : ''}`}>
        <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-32 sm:w-48">
          <img
            src={resolveMediaUrl(car.imagePath) || CAR_PLACEHOLDER}
            alt=""
            className={`h-full w-full object-cover ${sold ? 'opacity-60 grayscale-[0.35]' : 'transition duration-500 group-hover:scale-105'}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
            }}
          />
          {sold && (
            <span className="absolute left-2 top-2 rounded bg-gray-800 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Đã bán
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <h3 className={`font-heading text-base font-bold md:text-lg ${sold ? 'text-gray-500' : 'text-navy'}`}>
            {car.modelYear} — {car.model?.brand?.name} {car.model?.name}
          </h3>
          <p className="text-sm text-gray-500">
            {car.color?.name}
            {car.plate ? ` · ${car.plate}` : ''}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
            {car.kilometer > 0 && <span>{(car.kilometer / 1000).toFixed(0)}.000 km</span>}
            {trans !== '—' && <span>{trans}</span>}
          </div>
        </div>
        <div className="hidden shrink-0 flex-col items-end justify-center gap-1 self-center sm:flex">
          {d.showSalePrice && (
            <span className={`text-2xl font-extrabold ${sold ? 'text-gray-400 line-through' : 'text-red-600'}`}>
              {formatPriceMillions(car.salePrice!)}
            </span>
          )}
          <span className={`text-sm font-semibold ${sold ? 'text-gray-500' : 'text-orange-700'}`}>
            {sold ? 'Đã bán' : 'Chi tiết →'}
          </span>
        </div>
      </div>
    );
    return (
      <div
        className={`rounded-xl border bg-white p-3 shadow-sm md:p-4 ${
          sold ? 'border-gray-200 opacity-90' : 'border-gray-200 transition hover:border-orange-200 hover:shadow-md group'
        }`}
      >
        {sold ? rowBody : (
          <Link to={`/cars/${car.id}`} className="block">
            {rowBody}
          </Link>
        )}
      </div>
    );
  }

  return (
    <Link
      to={`/cars/${car.id}`}
      className="group flex gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm ring-1 ring-black/[0.03] transition-all hover:border-primary/25 hover:shadow-md md:gap-5 md:p-4"
    >
      <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-32 sm:w-44">
        <img
          src={resolveMediaUrl(car.imagePath) || CAR_PLACEHOLDER}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
          }}
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {d.mode === 'rent' && (
            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Thuê
            </span>
          )}
          {d.mode === 'all' && rentCapable && (
            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Thuê
            </span>
          )}
          {d.mode === 'all' && saleCapable && (
            <span className="rounded-md bg-orange-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Bán
            </span>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div>
          <h3 className="font-heading text-base font-bold text-navy md:text-lg">
            {car.model?.brand?.name} {car.model?.name}
          </h3>
          <p className="text-sm text-gray-500">
            {car.color?.name} · {car.modelYear}
            {car.plate ? ` · ${car.plate}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {d.showRentPrice && (
            <span>
              <span className="text-gray-400">Thuê </span>
              <span className="font-semibold text-primary">{formatCurrency(car.dailyPrice)}</span>
              <span className="text-gray-400">/ngày</span>
            </span>
          )}
          {d.showSalePrice && (
            <span>
              <span className="text-gray-400">Mua </span>
              <span className="font-semibold text-orange-700">{formatCurrency(car.salePrice!)}</span>
            </span>
          )}
        </div>
      </div>
      <div className="hidden shrink-0 items-center self-center sm:flex">
        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors ${
            d.showSalePrice && !d.showRentPrice
              ? 'bg-gradient-to-r from-amber-700 to-orange-700 group-hover:from-amber-600 group-hover:to-orange-600'
              : 'bg-navy group-hover:bg-primary group-hover:text-navy'
          }`}
        >
          Chi tiết
        </span>
      </div>
    </Link>
  );
}

export default CarCard;
