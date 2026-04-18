import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useLocation } from 'react-router-dom';
import { SlidersHorizontal, Search, X, ChevronLeft, ChevronRight, LayoutGrid, List, KeyRound, Tag } from 'lucide-react';
import { searchCarsApi } from '../../api/cars';
import { getAllBrandsApi } from '../../api/brands';
import { getAllColorsApi } from '../../api/colors';
import CarCard, { CarListRow } from '../../components/ui/CarCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Brand, Color, PagedCarsResponse } from '../../types';

const ITEMS_PER_PAGE = 9;

const PATH_CARS_SALE = '/cars/mua';

export type ListingPageMode = 'rent' | 'sale';

function listingFromPathname(pathname: string): ListingPageMode {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === PATH_CARS_SALE) return 'sale';
  return 'rent';
}

/** Trang tối đa hiển thị dạng nút (mức C — danh sách lớn) */
function buildPageItems(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | 'ellipsis')[] = [];
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);
  items.push(1);
  if (windowStart > 2) items.push('ellipsis');
  for (let p = windowStart; p <= windowEnd; p++) {
    if (p > 1 && p < total) items.push(p);
  }
  if (windowEnd < total - 1) items.push('ellipsis');
  if (total > 1) items.push(total);
  return items;
}

const CarListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const listingMode = listingFromPathname(location.pathname);
  const brandParam = searchParams.get('brand') || '';

  const [filters, setFilters] = useState({
    colorId: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    search: '',
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(filters.search), 350);
    return () => clearTimeout(id);
  }, [filters.search]);

  const searchParamsApi = useMemo(() => {
    const minP = filters.minPrice.trim() ? Number(filters.minPrice) : undefined;
    const maxP = filters.maxPrice.trim() ? Number(filters.maxPrice) : undefined;
    const y = filters.minYear.trim() ? Number(filters.minYear) : undefined;
    return {
      page,
      size: ITEMS_PER_PAGE,
      brandId: brandParam ? Number(brandParam) : undefined,
      colorId: filters.colorId ? Number(filters.colorId) : undefined,
      minPrice: Number.isFinite(minP) ? minP : undefined,
      maxPrice: Number.isFinite(maxP) ? maxP : undefined,
      minYear: Number.isFinite(y) ? y : undefined,
      listing: listingMode,
      q: debouncedSearch.trim() || undefined,
    };
  }, [page, filters, debouncedSearch, brandParam, listingMode]);

  const { data, isLoading, isFetching } = useQuery<PagedCarsResponse>({
    queryKey: ['cars', 'search', searchParamsApi],
    queryFn: () => searchCarsApi(searchParamsApi),
  });

  const { data: brands = [] } = useQuery<Brand[]>({ queryKey: ['brands'], queryFn: getAllBrandsApi });
  const { data: colors = [] } = useQuery<Color[]>({ queryKey: ['colors'], queryFn: getAllColorsApi });

  const paginated = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const pageItems = totalPages > 0 ? buildPageItems(page, totalPages) : [];

  const heroCopy = useMemo(() => {
    const n = totalElements;
    if (listingMode === 'sale') {
      return {
        kicker: 'Mua xe',
        title: 'Xe ô tô niêm yết bán',
        subtitle: isLoading ? 'Đang tải…' : `${n} xe đang mở bán — giá minh bạch, kiểm định rõ ràng`,
      };
    }
    return {
      kicker: 'Thuê xe',
      title: 'Thuê xe theo ngày',
      subtitle: isLoading ? 'Đang tải…' : `${n} xe sẵn sàng — đặt nhanh, nhận xe thuận tiện`,
    };
  }, [listingMode, isLoading, totalElements]);

  const setBrandFilter = (value: string) => {
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('brand', value);
    else next.delete('brand');
    setSearchParams(next, { replace: true });
  };

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      colorId: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      search: '',
    });
    setSearchParams(new URLSearchParams(), { replace: true });
    setPage(1);
  };

  const activeFilterCount = [
    brandParam,
    filters.colorId,
    filters.minPrice,
    filters.maxPrice,
    filters.minYear,
    filters.search,
  ].filter(Boolean).length;

  const cardVariant = listingMode === 'sale' ? 'sale' : 'rent';

  return (
    <div
      className="min-h-screen pad-top-nav"
      style={{ ['--pad-nav-tail' as string]: '#f4f6fa' }}
    >
      <header
        className={`relative pb-14 pt-8 md:pb-16 md:pt-10 ${
          listingMode === 'sale' ? 'listing-hero--sale' : 'listing-hero--rent'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">AutoHub</p>
          <p
            className={`mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              listingMode === 'sale'
                ? 'bg-orange-500/20 text-amber-100 ring-1 ring-orange-400/30'
                : 'bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/25'
            }`}
          >
            {listingMode === 'sale' ? (
              <>
                <Tag className="h-3.5 w-3.5" />
                {heroCopy.kicker}
              </>
            ) : (
              <>
                <KeyRound className="h-3.5 w-3.5" />
                {heroCopy.kicker}
              </>
            )}
          </p>
          <h1 className="mb-3 max-w-3xl font-heading text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-[2.35rem] lg:leading-tight">
            {heroCopy.title}
          </h1>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-gray-200/95 md:text-lg">
            {heroCopy.subtitle}
          </p>

        </div>
      </header>

      <div className="relative z-[2] mx-auto -mt-8 max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="listing-search-shell mb-8 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="relative min-h-[52px] flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={
                listingMode === 'sale'
                  ? 'Tìm xe bán theo hãng, dòng xe hoặc biển số…'
                  : 'Tìm xe thuê theo hãng, dòng xe hoặc biển số…'
              }
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="h-full w-full rounded-xl border-0 bg-gray-50/80 py-3.5 pl-12 pr-4 text-navy placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl px-5 font-semibold transition-all sm:px-6 ${
              showFilters || activeFilterCount > 0
                ? 'bg-navy text-white shadow-md ring-2 ring-primary/40 ring-offset-2'
                : 'border border-gray-200 bg-white text-navy hover:border-primary/40 hover:bg-primary/5'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-navy">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          <aside
            className={`flex-shrink-0 transition-all duration-300 ${
              showFilters ? 'w-64 opacity-100' : 'w-0 overflow-hidden opacity-0'
            }`}
          >
            <div className="sticky top-24 space-y-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-navy">Bộ lọc</h3>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" /> Xóa tất cả
                  </button>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Thương hiệu</label>
                <select
                  value={brandParam}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Tất cả</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Màu sắc</label>
                <select
                  value={filters.colorId}
                  onChange={(e) => updateFilter('colorId', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Tất cả</option>
                  {colors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {listingMode === 'sale' ? 'Giá bán (VNĐ)' : 'Giá thuê / ngày (VNĐ)'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="input-field text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Năm sản xuất (từ)</label>
                <input
                  type="number"
                  placeholder="VD: 2020"
                  min={2005}
                  max={2024}
                  value={filters.minYear}
                  onChange={(e) => updateFilter('minYear', e.target.value)}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <span
                  className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    listingMode === 'sale'
                      ? 'bg-orange-100 text-orange-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {listingMode === 'sale' ? 'Danh sách bán' : 'Danh sách thuê'}
                </span>
                <p className="text-sm text-gray-600">
                  {totalElements === 0 ? (
                    <span className="font-medium text-gray-500">Không có xe phù hợp</span>
                  ) : (
                    <>
                      <span className="font-semibold text-navy">{paginated.length}</span>
                      <span className="text-gray-500"> xe trên trang · </span>
                      <span className="font-semibold text-navy">{totalElements}</span>
                      <span className="text-gray-500"> kết quả</span>
                      {totalPages > 1 && (
                        <>
                          <span className="mx-1.5 text-gray-300">·</span>
                          <span className="text-gray-500">
                            Trang <span className="font-semibold text-navy">{page}</span> / {totalPages}
                          </span>
                        </>
                      )}
                    </>
                  )}
                  {isFetching && !isLoading ? (
                    <span className="ml-2 text-xs font-medium text-primary">Đang cập nhật…</span>
                  ) : null}
                </p>
              </div>
              <div className="flex gap-1 rounded-xl bg-gray-100/90 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg p-2.5 transition-all ${
                    viewMode === 'grid' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-navy'
                  }`}
                  aria-label="Lưới"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg p-2.5 transition-all ${
                    viewMode === 'list' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-navy'
                  }`}
                  aria-label="Danh sách"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <LoadingSpinner text="Đang tải xe..." />
            ) : paginated.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50 text-3xl">
                  🚗
                </div>
                <p className="text-lg font-semibold text-navy">Chưa có kết quả</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                  Thử đổi bộ lọc hoặc từ khóa tìm kiếm.
                </p>
                <button type="button" onClick={resetFilters} className="btn-outline mt-6">
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {paginated.map((car) => (
                      <CarCard key={car.id} car={car} variant={cardVariant} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {paginated.map((car) => (
                      <CarListRow key={car.id} car={car} variant={cardVariant} />
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="rounded-full border border-gray-200 bg-white p-2.5 text-navy shadow-sm transition-all hover:border-primary disabled:opacity-40"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {pageItems.map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span key={`e-${idx}`} className="px-2 text-gray-400">
                          …
                        </span>
                      ) : (
                        <button
                          type="button"
                          key={item}
                          onClick={() => setPage(item)}
                          className={`min-h-10 min-w-10 rounded-full px-3 text-sm font-semibold transition-all ${
                            page === item
                              ? 'bg-navy text-white shadow-md ring-2 ring-primary/30'
                              : 'border border-gray-200 bg-white text-gray-600 hover:border-primary/50 hover:text-navy'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="rounded-full border border-gray-200 bg-white p-2.5 text-navy shadow-sm transition-all hover:border-primary disabled:opacity-40"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarListing;
