import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Car } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useSearchParams } from 'react-router-dom';
import ManageRentals from './ManageRentals';
import ManageSaleOrders from './ManageSaleOrders';
import { getAllCarsApi, addCarApi, updateCarApi, deleteCarApi } from '../../api/cars';
import { getAllRentalsApi } from '../../api/rentals';
import { getAllModelsApi } from '../../api/models';
import { getAllColorsApi } from '../../api/colors';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency, CAR_PLACEHOLDER } from '../../utils/helpers';
import { MIN_MODEL_YEAR, getMaxModelYear } from '../../config/vehicleYears';
import type { Car as CarType, CarModel, Color, Rental } from '../../types';

const schema = z
  .object({
    plate: z.string().min(1, 'Nhập biển số'),
    modelYear: z.number().min(MIN_MODEL_YEAR).max(getMaxModelYear()),
    kilometer: z.number().min(0),
    listingType: z.enum(['RENT_ONLY', 'SALE_ONLY']),
    dailyPrice: z.number().min(0),
    salePrice: z.number().optional().nullable(),
    modelId: z.number().min(1, 'Chọn model'),
    colorId: z.number().min(1, 'Chọn màu'),
    minFindeksRate: z.number().min(0),
    imagePath: z.string().min(1, 'Nhập URL ảnh'),
    seats: z.number().int().min(2).max(16).optional().nullable(),
    transmission: z.enum(['', 'AUTO', 'MANUAL']).optional(),
    fuelType: z.enum(['', 'GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC']).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.listingType === 'RENT_ONLY') {
      if (!data.dailyPrice || data.dailyPrice < 1) {
        ctx.addIssue({ code: 'custom', message: 'Giá thuê/ngày phải > 0', path: ['dailyPrice'] });
      }
    }
    if (data.listingType === 'SALE_ONLY') {
      const sp = data.salePrice ?? 0;
      if (sp < 1) {
        ctx.addIssue({ code: 'custom', message: 'Giá bán phải > 0', path: ['salePrice'] });
      }
    }
  });

type FormData = z.infer<typeof schema>;

const ManageCars = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editCar, setEditCar] = useState<CarType | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const isSaleModule = location.pathname.startsWith('/admin/cars/sale');

  const { data: cars = [], isLoading } = useQuery<CarType[]>({ queryKey: ['cars'], queryFn: getAllCarsApi });
  const { data: rentals = [] } = useQuery<Rental[]>({ queryKey: ['rentals-for-cars'], queryFn: getAllRentalsApi });
  const { data: models = [] } = useQuery<CarModel[]>({ queryKey: ['models'], queryFn: getAllModelsApi });
  const { data: colors = [] } = useQuery<Color[]>({ queryKey: ['colors'], queryFn: getAllColorsApi });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      modelYear: 2023,
      kilometer: 0,
      minFindeksRate: 500,
      listingType: 'RENT_ONLY',
      dailyPrice: 0,
      salePrice: undefined,
    },
  });

  const addMutation = useMutation({
    mutationFn: addCarApi,
    onSuccess: () => {
      showToast('Thêm xe thành công!', 'success');
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      setModalOpen(false);
      reset();
    },
    onError: () => showToast('Có lỗi khi thêm xe', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: updateCarApi,
    onSuccess: () => {
      showToast('Cập nhật xe thành công!', 'success');
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      setModalOpen(false);
      setEditCar(null);
      reset();
    },
    onError: () => showToast('Có lỗi khi cập nhật', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCarApi,
    onSuccess: () => {
      showToast('Đã xóa xe', 'success');
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      setDeleteId(null);
    },
    onError: () => showToast('Có lỗi khi xóa', 'error'),
  });

  const openAdd = () => {
    setEditCar(null);
    reset({
      modelYear: 2023,
      kilometer: 0,
      minFindeksRate: 500,
      dailyPrice: isSaleModule ? 1 : 0,
      salePrice: isSaleModule ? 100000000 : undefined,
      listingType: isSaleModule ? 'SALE_ONLY' : 'RENT_ONLY',
      modelId: 0,
      colorId: 0,
      seats: undefined,
      transmission: '',
      fuelType: '',
    });
    setModalOpen(true);
  };

  const openEdit = (car: CarType) => {
    setEditCar(car);
    const lt = (car.listingType || 'RENT_ONLY').toUpperCase() as 'RENT_ONLY' | 'SALE_ONLY';
    const trans = (car.transmission ?? '').toString().toUpperCase();
    const fuel = (car.fuelType ?? '').toString().toUpperCase();
    reset({
      plate: car.plate,
      modelYear: car.modelYear,
      kilometer: car.kilometer,
      dailyPrice: car.dailyPrice,
      salePrice: car.salePrice ?? undefined,
      listingType: lt === 'SALE_ONLY' || lt === 'RENT_ONLY' ? lt : 'RENT_ONLY',
      modelId: car.model?.id,
      colorId: car.color?.id,
      minFindeksRate: car.minFindeksRate,
      imagePath: car.imagePath,
      seats: car.seats ?? undefined,
      transmission: trans === 'AUTO' || trans === 'MANUAL' ? trans : '',
      fuelType:
        fuel === 'GASOLINE' || fuel === 'DIESEL' || fuel === 'HYBRID' || fuel === 'ELECTRIC' ? fuel : '',
    });
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    // Empty enum string nghĩa là "không khai báo" → gửi null cho backend.
    const payload = {
      ...data,
      transmission: data.transmission ? data.transmission : null,
      fuelType: data.fuelType ? data.fuelType : null,
      seats: data.seats ?? null,
    };
    if (editCar) {
      updateMutation.mutate({ ...payload, id: editCar.id });
    } else {
      addMutation.mutate(payload);
    }
  };

  const moduleCars = cars.filter((c) => {
    const lt = (c.listingType || 'RENT_ONLY').toUpperCase();
    if (isSaleModule) return lt === 'SALE_ONLY';
    return lt === 'RENT_ONLY';
  });

  const filtered = moduleCars.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.model?.brand?.name?.toLowerCase().includes(q) ||
      c.model?.name?.toLowerCase().includes(q) ||
      c.plate?.toLowerCase().includes(q)
    );
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const ordersTab = searchParams.get('tab') === 'orders';

  const subNav = (
    <div className="flex flex-wrap gap-2 mb-5">
      <button
        type="button"
        onClick={() => setSearchParams({})}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          !ordersTab ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {isSaleModule ? 'Xe bán' : 'Xe thuê'}
      </button>
      <button
        type="button"
        onClick={() => setSearchParams({ tab: 'orders' })}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          ordersTab ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {isSaleModule ? 'Đơn mua xe' : 'Đơn thuê'}
      </button>
    </div>
  );

  if (ordersTab) {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="font-heading font-bold text-2xl text-navy">
              {isSaleModule ? 'Quản lý xe bán' : 'Quản lý xe thuê'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">Đơn hàng gắn với kho xe</p>
          </div>
        </div>
        {subNav}
        {isSaleModule ? <ManageSaleOrders /> : <ManageRentals />}
      </div>
    );
  }

  const isSaving = addMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-navy">
            {isSaleModule ? 'Quản lý xe bán' : 'Quản lý xe thuê'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Tổng {moduleCars.length} xe {isSaleModule ? 'đang bán/niêm yết' : 'phục vụ cho thuê'}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {isSaleModule ? 'Thêm xe bán' : 'Thêm xe thuê'}
        </button>
      </div>

      {subNav}

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo thương hiệu, model, biển số..."
            className="input-field pl-12"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-500">
                  <th className="text-left px-5 py-4 font-medium">STT</th>
                  <th className="text-left px-5 py-4 font-medium">Xe</th>
                  <th className="text-left px-5 py-4 font-medium">Biển số</th>
                  <th className="text-left px-5 py-4 font-medium">Năm</th>
                  <th className="text-left px-5 py-4 font-medium">Màu</th>
                  <th className="text-left px-5 py-4 font-medium">Loại niêm yết</th>
                  <th className="text-right px-5 py-4 font-medium">
                    {isSaleModule ? 'Giá bán' : 'Giá thuê'}
                  </th>
                  <th className="text-center px-5 py-4 font-medium">
                    {isSaleModule ? 'Trạng thái bán' : 'Trạng thái thuê'}
                  </th>
                  <th className="text-right px-5 py-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((car, idx) => {
                  const toLocalStartOfDay = (d?: string | null) => {
                    if (!d) return null;
                    const dt = new Date(d);
                    dt.setHours(0, 0, 0, 0);
                    return dt.getTime();
                  };
                  const todayTs = (() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t.getTime(); })();
                  const busy = rentals.some((r) => {
                    if (r.car?.id !== car.id) return false;
                    if (r.rentalStatus === 'COMPLETED') return false;
                    const s = toLocalStartOfDay(r.startDate);
                    const e = toLocalStartOfDay(r.endDate);
                    if (s === null || e === null) return false;
                    return s <= todayTs && todayTs <= e;
                  });
                  return (
                    <tr key={car.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-gray-400">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={car.imagePath || CAR_PLACEHOLDER}
                            alt={car.model?.name}
                            className="w-12 h-9 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = CAR_PLACEHOLDER; }}
                          />
                          <div>
                            <p className="font-medium text-navy">{car.model?.brand?.name} {car.model?.name}</p>
                            <p className="text-gray-400 text-xs">{(car.kilometer / 1000).toFixed(0)}k km</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-gray-600">{car.plate}</td>
                      <td className="px-5 py-4 text-gray-600">{car.modelYear}</td>
                      <td className="px-5 py-4">
                        <span className="badge bg-gray-100 text-gray-600">{car.color?.name}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs">
                        {(car.listingType || 'RENT_ONLY').replace('_', ' ')}
                        {car.saleStatus ? ` • ${car.saleStatus}` : ''}
                      </td>
                      <td className="px-5 py-4 text-right text-xs">
                        {isSaleModule ? (
                          <div className="text-amber-700 font-semibold">
                            {formatCurrency(car.salePrice ?? 0)}
                          </div>
                        ) : (
                          <>
                            <div className="font-semibold text-primary">{formatCurrency(car.dailyPrice)}/ngày</div>
                            {(car.salePrice ?? 0) > 0 && (
                              <div className="text-amber-700 font-medium mt-0.5">
                                Mua: {formatCurrency(car.salePrice!)}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs font-medium ${
                            isSaleModule
                              ? (car.saleStatus || 'AVAILABLE').toUpperCase() === 'SOLD'
                                ? 'bg-gray-100 text-gray-600'
                                : (car.saleStatus || 'AVAILABLE').toUpperCase() === 'RESERVED'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-green-50 text-green-700'
                              : busy
                                ? 'bg-red-50 text-red-600'
                                : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {isSaleModule
                            ? (car.saleStatus || 'AVAILABLE').toUpperCase() === 'SOLD'
                              ? 'Đã bán'
                              : (car.saleStatus || 'AVAILABLE').toUpperCase() === 'RESERVED'
                                ? 'Đang giữ chỗ'
                                : 'Có thể bán'
                            : busy
                              ? 'Đang thuê'
                              : 'Trống'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(car)}
                            className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(car.id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
                Không tìm thấy xe phù hợp module
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditCar(null); reset(); }}
        title={editCar ? 'Chỉnh sửa xe' : isSaleModule ? 'Thêm xe bán' : 'Thêm xe thuê'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biển số *</label>
              <input {...register('plate')} className="input-field" placeholder="30A-12345" />
              {errors.plate && <p className="text-red-500 text-xs mt-1">{errors.plate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Năm sản xuất *</label>
              <input
                {...register('modelYear', { valueAsNumber: true })}
                type="number"
                min={MIN_MODEL_YEAR}
                max={getMaxModelYear()}
                className="input-field"
              />
              <p className="text-gray-400 text-xs mt-0.5">
                {MIN_MODEL_YEAR} – {getMaxModelYear()} (khớp backend tối đa 2030)
              </p>
              {errors.modelYear && <p className="text-red-500 text-xs mt-1">{errors.modelYear.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
              <select {...register('modelId', { valueAsNumber: true })} className="input-field">
                <option value={0}>Chọn model</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.brand?.name} – {m.name}</option>
                ))}
              </select>
              {errors.modelId && <p className="text-red-500 text-xs mt-1">{errors.modelId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc *</label>
              <select {...register('colorId', { valueAsNumber: true })} className="input-field">
                <option value={0}>Chọn màu</option>
                {colors.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.colorId && <p className="text-red-500 text-xs mt-1">{errors.colorId.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại niêm yết *</label>
            <select {...register('listingType')} className="input-field">
              {isSaleModule ? (
                <>
                  <option value="SALE_ONLY">Chỉ bán</option>
                </>
              ) : (
                <>
                  <option value="RENT_ONLY">Chỉ cho thuê</option>
                </>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá thuê/ngày (VNĐ)</label>
              <input {...register('dailyPrice', { valueAsNumber: true })} type="number" className="input-field" placeholder="500000" />
              {errors.dailyPrice && <p className="text-red-500 text-xs mt-1">{errors.dailyPrice.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
              <input {...register('salePrice', { valueAsNumber: true })} type="number" className="input-field" placeholder="VD: 450000000" />
              {errors.salePrice && <p className="text-red-500 text-xs mt-1">{String(errors.salePrice.message)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số km đã đi</label>
              <input {...register('kilometer', { valueAsNumber: true })} type="number" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Findeks Rate</label>
              <input {...register('minFindeksRate', { valueAsNumber: true })} type="number" className="input-field" />
            </div>
          </div>

          {/* Thông số phục vụ Tìm kiếm xe thuê (UC #5) */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số chỗ</label>
              <input
                {...register('seats', { valueAsNumber: true, setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)) })}
                type="number"
                min={2}
                max={16}
                className="input-field"
                placeholder="VD: 5"
              />
              {errors.seats && <p className="text-red-500 text-xs mt-1">{errors.seats.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hộp số</label>
              <select {...register('transmission')} className="input-field">
                <option value="">— Chưa khai báo —</option>
                <option value="AUTO">Tự động (AUTO)</option>
                <option value="MANUAL">Số sàn (MANUAL)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhiên liệu</label>
              <select {...register('fuelType')} className="input-field">
                <option value="">— Chưa khai báo —</option>
                <option value="GASOLINE">Xăng</option>
                <option value="DIESEL">Dầu</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ELECTRIC">Điện</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL ảnh xe *</label>
            <input {...register('imagePath')} className="input-field" placeholder="https://..." />
            {errors.imagePath && <p className="text-red-500 text-xs mt-1">{errors.imagePath.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
              {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {isSaving ? 'Đang lưu...' : editCar ? 'Cập nhật' : 'Thêm xe'}
            </button>
            <button type="button" onClick={() => { setModalOpen(false); reset(); }} className="btn-outline">
              Hủy
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Xác nhận xóa" size="sm">
        <p className="text-gray-600 mb-5">Bạn có chắc chắn muốn xóa xe này? Hành động này không thể hoàn tác.</p>
        <div className="flex gap-3">
          <button
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            disabled={deleteMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {deleteMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Xóa
          </button>
          <button onClick={() => setDeleteId(null)} className="btn-outline">Hủy</button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageCars;
