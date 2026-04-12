import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { searchCarsApi } from '../../api/cars';
import { getAllBrandsApi } from '../../api/brands';
import { getAllColorsApi } from '../../api/colors';
import CarCard from '../../components/ui/CarCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Brand, Color, PagedCarsResponse } from '../../types';

const ITEMS_PER_PAGE = 9;

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
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    brandId: searchParams.get('brand') || '',
    colorId: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    search: '',
    /** '' | rent | sale — lọc loại hình */
    listing: (searchParams.get('listing') as '' | 'rent' | 'sale') || '',
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
      brandId: filters.brandId ? Number(filters.brandId) : undefined,
      colorId: filters.colorId ? Number(filters.colorId) : undefined,
      minPrice: Number.isFinite(minP) ? minP : undefined,
      maxPrice: Number.isFinite(maxP) ? maxP : undefined,
      minYear: Number.isFinite(y) ? y : undefined,
      listing: (filters.listing || undefined) as '' | 'rent' | 'sale' | undefined,
      q: debouncedSearch.trim() || undefined,
    };
  }, [page, filters, debouncedSearch]);

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

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ brandId: '', colorId: '', minPrice: '', maxPrice: '', minYear: '', search: '', listing: '' });
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-bold text-3xl text-white mb-2">Thuê & mua xe</h1>
          <p className="text-gray-300">
            {isLoading ? 'Đang tải…' : `Khám phá ${totalElements} xe — cho thuê và bán`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo thương hiệu, model..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
              showFilters || activeFilterCount > 0
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 text-gray-600 hover:border-primary'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`flex-shrink-0 transition-all duration-300 ${
              showFilters ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-navy">Bộ lọc</h3>
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> Xóa tất cả
                  </button>
                )}
              </div>

              {/* Listing type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại hình</label>
                <select
                  value={filters.listing}
                  onChange={(e) => updateFilter('listing', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="rent">Cho thuê</option>
                  <option value="sale">Bán xe</option>
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thương hiệu</label>
                <select
                  value={filters.brandId}
                  onChange={(e) => updateFilter('brandId', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Tất cả</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc</label>
                <select
                  value={filters.colorId}
                  onChange={(e) => updateFilter('colorId', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Tất cả</option>
                  {colors.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filters.listing === 'sale' ? 'Giá bán (VNĐ)' : 'Giá thuê/ngày (VNĐ)'}
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

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Năm sản xuất (từ)</label>
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

          {/* Car Grid */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-500 text-sm">
                {totalElements === 0 ? (
                  'Không có xe phù hợp'
                ) : (
                  <>
                    Trang <span className="font-semibold text-navy">{page}</span> / {totalPages} —{' '}
                    <span className="font-semibold text-navy">{paginated.length}</span> xe (tổng{' '}
                    <span className="font-semibold text-navy">{totalElements}</span>)
                  </>
                )}
                {isFetching && !isLoading ? (
                  <span className="ml-2 text-primary text-xs">Đang cập nhật…</span>
                ) : null}
              </p>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-primary text-white">
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:border-primary hover:text-primary">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <LoadingSpinner text="Đang tải xe..." />
            ) : paginated.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🚗</div>
                <p className="text-gray-500 text-lg">Không tìm thấy xe phù hợp</p>
                <button onClick={resetFilters} className="btn-outline mt-4">Xóa bộ lọc</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paginated.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
                    <button
                      type="button"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {pageItems.map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span key={`e-${idx}`} className="px-1 text-gray-400">
                          …
                        </span>
                      ) : (
                        <button
                          type="button"
                          key={item}
                          onClick={() => setPage(item)}
                          className={`min-w-[2.5rem] h-10 px-2 rounded-lg font-medium text-sm transition-all ${
                            page === item
                              ? 'bg-primary text-white shadow-md'
                              : 'border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
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
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
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
