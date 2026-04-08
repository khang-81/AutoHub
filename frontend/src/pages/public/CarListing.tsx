import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { getAllCarsApi } from '../../api/cars';
import { getAllBrandsApi } from '../../api/brands';
import { getAllColorsApi } from '../../api/colors';
import { getAllRentalsApi } from '../../api/rentals';
import CarCard from '../../components/ui/CarCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Car, Brand, Color, Rental } from '../../types';
import { formatDate } from '../../utils/helpers';

const ITEMS_PER_PAGE = 9;

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
  });

  const { data: cars = [], isLoading } = useQuery<Car[]>({ queryKey: ['cars'], queryFn: getAllCarsApi });
  const { data: brands = [] } = useQuery<Brand[]>({ queryKey: ['brands'], queryFn: getAllBrandsApi });
  const { data: colors = [] } = useQuery<Color[]>({ queryKey: ['colors'], queryFn: getAllColorsApi });
  const { data: rentals = [] } = useQuery<Rental[]>({ queryKey: ['rentals'], queryFn: getAllRentalsApi });

  const bookingMap = useMemo(() => {
    const map = new Map<number, Array<{ startDate: string; endDate: string }>>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    rentals.forEach((rental) => {
      if (!rental?.car?.id || !rental.startDate || !rental.endDate) return;
      if (rental.rentalStatus === 'COMPLETED' || rental.rentalStatus === 'CANCELLED' || !!rental.returnDate) return;

      const end = new Date(rental.endDate);
      end.setHours(0, 0, 0, 0);
      if (end < today) return;

      const list = map.get(rental.car.id) || [];
      list.push({ startDate: rental.startDate, endDate: rental.endDate });
      map.set(rental.car.id, list);
    });

    for (const [, ranges] of map.entries()) {
      ranges.sort((a, b) => a.startDate.localeCompare(b.startDate));
    }

    return map;
  }, [rentals]);

  const filtered = useMemo(() => {
    return cars.filter((car) => {
      if (filters.brandId && car.model?.brand?.id !== Number(filters.brandId)) return false;
      if (filters.colorId && car.color?.id !== Number(filters.colorId)) return false;
      if (filters.minPrice && car.dailyPrice < Number(filters.minPrice)) return false;
      if (filters.maxPrice && car.dailyPrice > Number(filters.maxPrice)) return false;
      if (filters.minYear && car.modelYear < Number(filters.minYear)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match =
          car.model?.brand?.name?.toLowerCase().includes(q) ||
          car.model?.name?.toLowerCase().includes(q) ||
          car.plate?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [cars, filters]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ brandId: '', colorId: '', minPrice: '', maxPrice: '', minYear: '', search: '' });
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-bold text-3xl text-white mb-2">Thuê xe</h1>
          <p className="text-gray-300">Khám phá {cars.length} xe từ các thương hiệu hàng đầu</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá/ngày (VNĐ)</label>
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
                Hiển thị <span className="font-semibold text-navy">{paginated.length}</span> trong {filtered.length} xe
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
                    <CarCard
                      key={car.id}
                      car={car}
                      bookedRanges={(bookingMap.get(car.id) || []).map((r) => ({
                        ...r,
                        startDate: formatDate(r.startDate),
                        endDate: formatDate(r.endDate),
                      }))}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                          page === i + 1
                            ? 'bg-primary text-white shadow-md'
                            : 'border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
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
