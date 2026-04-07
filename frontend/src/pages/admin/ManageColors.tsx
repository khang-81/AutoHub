import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Palette } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAllColorsApi, addColorApi, updateColorApi, deleteColorApi } from '../../api/colors';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Color } from '../../types';

const schema = z.object({ name: z.string().min(1, 'Tên không được trống') });
type FormData = z.infer<typeof schema>;

const colorMap: Record<string, string> = {
  'trắng': 'bg-white border border-gray-200',
  'đen': 'bg-gray-900',
  'đỏ': 'bg-red-500',
  'xanh': 'bg-blue-500',
  'bạc': 'bg-gray-300',
  'vàng': 'bg-yellow-400',
  'xám': 'bg-gray-500',
  'nâu': 'bg-amber-700',
  'xanh lá': 'bg-green-500',
};

const getColorDot = (name: string) => {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(colorMap)) {
    if (lower.includes(key)) return val;
  }
  return 'bg-primary';
};

const ManageColors = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editColor, setEditColor] = useState<Color | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: colors = [], isLoading } = useQuery<Color[]>({ queryKey: ['colors'], queryFn: getAllColorsApi });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const addMutation = useMutation({
    mutationFn: addColorApi,
    onSuccess: () => { showToast('Thêm màu thành công!', 'success'); queryClient.invalidateQueries({ queryKey: ['colors'] }); setModalOpen(false); reset(); },
    onError: () => showToast('Lỗi', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: updateColorApi,
    onSuccess: () => { showToast('Cập nhật thành công!', 'success'); queryClient.invalidateQueries({ queryKey: ['colors'] }); setModalOpen(false); setEditColor(null); reset(); },
    onError: () => showToast('Lỗi', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteColorApi,
    onSuccess: () => { showToast('Đã xóa', 'success'); queryClient.invalidateQueries({ queryKey: ['colors'] }); setDeleteId(null); },
    onError: () => showToast('Lỗi', 'error'),
  });

  const onSubmit = (d: FormData) => {
    if (editColor) updateMutation.mutate({ id: editColor.id, name: d.name });
    else addMutation.mutate(d);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-navy">Màu sắc</h1>
          <p className="text-gray-400 text-sm mt-1">{colors.length} màu</p>
        </div>
        <button onClick={() => { setModalOpen(true); setEditColor(null); reset(); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Thêm màu
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {colors.map((color) => (
              <div key={color.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all group">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${getColorDot(color.name)} flex-shrink-0`} />
                  <div>
                    <p className="font-medium text-navy">{color.name}</p>
                    <p className="text-gray-400 text-xs">ID: {color.id}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditColor(color); reset({ name: color.name }); setModalOpen(true); }} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(color.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {colors.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <Palette className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">Chưa có màu sắc nào</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditColor(null); reset(); }} title={editColor ? 'Sửa màu sắc' : 'Thêm màu sắc'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên màu *</label>
            <input {...register('name')} className="input-field" placeholder="Trắng, Đen, Đỏ..." />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={addMutation.isPending || updateMutation.isPending} className="btn-primary disabled:opacity-60">
              {editColor ? 'Cập nhật' : 'Thêm'}
            </button>
            <button type="button" onClick={() => { setModalOpen(false); reset(); }} className="btn-outline">Hủy</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Xóa màu sắc" size="sm">
        <p className="text-gray-600 mb-5">Bạn có chắc chắn muốn xóa màu này?</p>
        <div className="flex gap-3">
          <button onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60">Xóa</button>
          <button onClick={() => setDeleteId(null)} className="btn-outline">Hủy</button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageColors;
