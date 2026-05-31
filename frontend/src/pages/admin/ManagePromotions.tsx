import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Ticket, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getAllPromotionsApi,
  addPromotionApi,
  updatePromotionApi,
  deletePromotionApi,
} from '../../api/promotions';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency, getApiErrorMessage } from '../../utils/helpers';
import type { Promotion } from '../../types';

const schema = z.object({
  code: z.string().min(1, 'Mã không được trống').max(64),
  description: z.string().optional(),
  discountType: z.enum(['PERCENT', 'FIXED']),
  discountValue: z.number().positive('Giá trị phải lớn hơn 0'),
  appliesTo: z.enum(['RENT', 'SALE', 'BOTH']),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  usageLimit: z.number().int().positive().optional(),
  maxDiscountAmount: z.number().positive().optional(),
  minOrderValue: z.number().positive().optional(),
  active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const emptyForm: FormData = {
  code: '',
  description: '',
  discountType: 'PERCENT',
  discountValue: 10,
  appliesTo: 'BOTH',
  validFrom: '',
  validTo: '',
  usageLimit: undefined,
  maxDiscountAmount: undefined,
  minOrderValue: undefined,
  active: true,
};

const formatDiscount = (p: Promotion) =>
  p.discountType === 'PERCENT'
    ? `${p.discountValue}%`
    : formatCurrency(p.discountValue);

const appliesLabel: Record<Promotion['appliesTo'], string> = {
  RENT: 'Thuê xe',
  SALE: 'Mua xe',
  BOTH: 'Cả hai',
};

const ManagePromotions = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editPromo, setEditPromo] = useState<Promotion | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
    queryKey: ['promotions'],
    queryFn: getAllPromotionsApi,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: emptyForm });

  const discountType = watch('discountType');

  const toPayload = (d: FormData) => ({
    code: d.code.trim().toUpperCase(),
    description: d.description?.trim() || undefined,
    discountType: d.discountType,
    discountValue: d.discountValue,
    appliesTo: d.appliesTo,
    validFrom: d.validFrom || undefined,
    validTo: d.validTo || undefined,
    usageLimit: d.usageLimit == null || Number.isNaN(d.usageLimit as number) ? undefined : Number(d.usageLimit),
    maxDiscountAmount:
      d.maxDiscountAmount == null || Number.isNaN(d.maxDiscountAmount as number)
        ? undefined
        : Number(d.maxDiscountAmount),
    minOrderValue:
      d.minOrderValue == null || Number.isNaN(d.minOrderValue as number)
        ? undefined
        : Number(d.minOrderValue),
    active: d.active,
  });

  const addMutation = useMutation({
    mutationFn: addPromotionApi,
    onSuccess: () => {
      showToast('Thêm mã khuyến mãi thành công!', 'success');
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      closeModal();
    },
    onError: (err) => showToast(getApiErrorMessage(err, 'Không thể thêm mã'), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: updatePromotionApi,
    onSuccess: () => {
      showToast('Cập nhật thành công!', 'success');
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      closeModal();
    },
    onError: (err) => showToast(getApiErrorMessage(err, 'Không thể cập nhật'), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePromotionApi,
    onSuccess: (res: { message?: string }) => {
      showToast(res?.message || 'Đã xử lý', 'success');
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setDeleteId(null);
    },
    onError: (err) => showToast(getApiErrorMessage(err, 'Không thể xóa'), 'error'),
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditPromo(null);
    reset(emptyForm);
  };

  const openEdit = (p: Promotion) => {
    setEditPromo(p);
    reset({
      code: p.code,
      description: p.description || '',
      discountType: p.discountType,
      discountValue: p.discountValue,
      appliesTo: p.appliesTo,
      validFrom: p.validFrom || '',
      validTo: p.validTo || '',
      usageLimit: p.usageLimit ?? undefined,
      maxDiscountAmount: p.maxDiscountAmount ?? undefined,
      minOrderValue: p.minOrderValue ?? undefined,
      active: p.active,
    });
    setModalOpen(true);
  };

  const onSubmit = (d: FormData) => {
    const payload = toPayload(d);
    if (editPromo) {
      updateMutation.mutate({ id: editPromo.id, ...payload, active: d.active });
    } else {
      addMutation.mutate(payload);
    }
  };

  const filtered = promotions.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.code.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-navy">Mã khuyến mãi</h1>
          <p className="text-gray-400 text-sm mt-1">{promotions.length} mã</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditPromo(null);
            reset(emptyForm);
            setModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" /> Thêm mã
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã, mô tả..."
          className="input-field pl-10"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-5 py-3 font-medium">Mã</th>
                  <th className="px-5 py-3 font-medium">Giảm giá</th>
                  <th className="px-5 py-3 font-medium">Áp dụng</th>
                  <th className="px-5 py-3 font-medium">Hiệu lực</th>
                  <th className="px-5 py-3 font-medium">Lượt dùng</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                  <th className="px-5 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-navy">{p.code}</p>
                      {p.description && (
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{p.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">{formatDiscount(p)}</td>
                    <td className="px-5 py-3">{appliesLabel[p.appliesTo]}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {p.validFrom || '—'} → {p.validTo || '—'}
                    </td>
                    <td className="px-5 py-3">
                      {p.usageCount}
                      {p.usageLimit != null ? ` / ${p.usageLimit}` : ' / ∞'}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.active ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50"
                          aria-label="Sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                          aria-label="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">Chưa có mã khuyến mãi</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editPromo ? 'Sửa mã khuyến mãi' : 'Thêm mã khuyến mãi'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã *</label>
              <input {...register('code')} className="input-field uppercase" placeholder="WELCOME10" />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Áp dụng cho *</label>
              <select {...register('appliesTo')} className="input-field">
                <option value="BOTH">Cả thuê & mua</option>
                <option value="RENT">Chỉ thuê xe</option>
                <option value="SALE">Chỉ mua xe</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <input {...register('description')} className="input-field" placeholder="Giảm 10% cho đơn đầu" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm *</label>
              <select {...register('discountType')} className="input-field">
                <option value="PERCENT">Phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá trị * {discountType === 'PERCENT' ? '(%)' : '(VNĐ)'}
              </label>
              <input
                {...register('discountValue', { valueAsNumber: true })}
                type="number"
                className="input-field"
                placeholder={discountType === 'PERCENT' ? '10' : '100000'}
              />
              {errors.discountValue && (
                <p className="text-red-500 text-xs mt-1">{errors.discountValue.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
              <input {...register('validFrom')} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
              <input {...register('validTo')} type="date" className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn lượt</label>
              <input
                {...register('usageLimit', { valueAsNumber: true })}
                type="number"
                className="input-field"
                placeholder="Không giới hạn"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trần giảm (VNĐ)</label>
              <input
                {...register('maxDiscountAmount', { valueAsNumber: true })}
                type="number"
                className="input-field"
                placeholder="Tuỳ chọn"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đơn tối thiểu</label>
              <input
                {...register('minOrderValue', { valueAsNumber: true })}
                type="number"
                className="input-field"
                placeholder="Tuỳ chọn"
              />
            </div>
          </div>

          {editPromo && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input {...register('active')} type="checkbox" className="rounded border-gray-300" />
              Kích hoạt mã
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={addMutation.isPending || updateMutation.isPending}
              className="btn-primary disabled:opacity-60"
            >
              {editPromo ? 'Cập nhật' : 'Thêm'}
            </button>
            <button type="button" onClick={closeModal} className="btn-outline">
              Hủy
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Xóa mã khuyến mãi" size="sm">
        <p className="text-gray-600 mb-5">
          Mã đã được sử dụng sẽ được vô hiệu hóa thay vì xóa hoàn toàn.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            disabled={deleteMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60"
          >
            Xác nhận
          </button>
          <button type="button" onClick={() => setDeleteId(null)} className="btn-outline">
            Hủy
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ManagePromotions;
