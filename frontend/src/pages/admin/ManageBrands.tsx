import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Tag, Cpu, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getAllBrandsApi, addBrandApi, updateBrandApi, deleteBrandApi,
} from '../../api/brands';
import {
  getAllModelsApi, addModelApi, updateModelApi, deleteModelApi,
} from '../../api/models';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Brand, CarModel } from '../../types';

const nameSchema = z.object({ name: z.string().min(1, 'Tên không được trống') });
const modelSchema = z.object({
  name: z.string().min(1, 'Tên không được trống'),
  brandId: z.number().min(1, 'Chọn thương hiệu'),
});

type NameForm = z.infer<typeof nameSchema>;
type ModelForm = z.infer<typeof modelSchema>;

const ManageBrands = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [expandedBrandIds, setExpandedBrandIds] = useState<Set<number>>(new Set());

  const [brandModal, setBrandModal] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [deleteBrandId, setDeleteBrandId] = useState<number | null>(null);

  const [modelModal, setModelModal] = useState(false);
  const [editModel, setEditModel] = useState<CarModel | null>(null);
  const [deleteModelId, setDeleteModelId] = useState<number | null>(null);
  /** Khi thêm model từ trong một thương hiệu — khóa chọn brand */
  const [modelPresetBrandId, setModelPresetBrandId] = useState<number | null>(null);

  const { data: brands = [], isLoading: brandsLoading } = useQuery<Brand[]>({ queryKey: ['brands'], queryFn: getAllBrandsApi });
  const { data: models = [], isLoading: modelsLoading } = useQuery<CarModel[]>({ queryKey: ['models'], queryFn: getAllModelsApi });

  const brandForm = useForm<NameForm>({ resolver: zodResolver(nameSchema) });
  const modelForm = useForm<ModelForm>({ resolver: zodResolver(modelSchema) });

  const toggleBrand = (id: number) => {
    setExpandedBrandIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const openAddModel = (brandId: number) => {
    setEditModel(null);
    setModelPresetBrandId(brandId);
    modelForm.reset({ name: '', brandId });
    setModelModal(true);
  };

  const addBrand = useMutation({
    mutationFn: addBrandApi,
    onSuccess: () => { showToast('Thêm thương hiệu thành công!', 'success'); queryClient.invalidateQueries({ queryKey: ['brands'] }); setBrandModal(false); brandForm.reset(); },
    onError: () => showToast('Lỗi', 'error'),
  });
  const updateBrand = useMutation({
    mutationFn: updateBrandApi,
    onSuccess: () => { showToast('Cập nhật thành công!', 'success'); queryClient.invalidateQueries({ queryKey: ['brands'] }); setBrandModal(false); setEditBrand(null); brandForm.reset(); },
    onError: () => showToast('Lỗi', 'error'),
  });
  const deleteBrand = useMutation({
    mutationFn: deleteBrandApi,
    onSuccess: () => { showToast('Đã xóa', 'success'); queryClient.invalidateQueries({ queryKey: ['brands'] }); setDeleteBrandId(null); },
    onError: () => showToast('Lỗi', 'error'),
  });

  const addModel = useMutation({
    mutationFn: addModelApi,
    onSuccess: () => { showToast('Thêm model thành công!', 'success'); queryClient.invalidateQueries({ queryKey: ['models'] }); setModelModal(false); modelForm.reset(); setModelPresetBrandId(null); },
    onError: () => showToast('Lỗi', 'error'),
  });
  const updateModel = useMutation({
    mutationFn: updateModelApi,
    onSuccess: () => { showToast('Cập nhật thành công!', 'success'); queryClient.invalidateQueries({ queryKey: ['models'] }); setModelModal(false); setEditModel(null); modelForm.reset(); setModelPresetBrandId(null); },
    onError: () => showToast('Lỗi', 'error'),
  });
  const deleteModel = useMutation({
    mutationFn: deleteModelApi,
    onSuccess: () => { showToast('Đã xóa', 'success'); queryClient.invalidateQueries({ queryKey: ['models'] }); setDeleteModelId(null); },
    onError: () => showToast('Lỗi', 'error'),
  });

  const loading = brandsLoading || modelsLoading;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-navy">Thương hiệu & Model</h1>
          <p className="text-gray-400 text-sm mt-1">
            Mỗi thương hiệu mở rộng để xem và quản lý model — {brands.length} thương hiệu · {models.length} model
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setBrandModal(true); setEditBrand(null); brandForm.reset(); }}
          className="btn-primary flex items-center gap-2 !py-2 !px-4 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm thương hiệu
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="divide-y divide-gray-100">
            {brands.map((brand) => {
              const open = expandedBrandIds.has(brand.id);
              const brandModels = models.filter((m) => m.brand?.id === brand.id);
              return (
                <div key={brand.id}>
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 gap-2 bg-gray-50/50">
                    <button
                      type="button"
                      onClick={() => toggleBrand(brand.id)}
                      className="flex items-center gap-3 min-w-0 text-left flex-1 py-1"
                    >
                      <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-navy truncate">{brand.name}</p>
                        <p className="text-gray-400 text-xs">{brandModels.length} model</p>
                      </div>
                    </button>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        title="Sửa thương hiệu"
                        onClick={() => { setEditBrand(brand); brandForm.setValue('name', brand.name); setBrandModal(true); }}
                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button type="button" title="Xóa thương hiệu" onClick={() => setDeleteBrandId(brand.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {open && (
                    <div className="px-4 sm:px-5 pb-4 pt-1 bg-white">
                      <div className="flex justify-end mb-3">
                        <button
                          type="button"
                          onClick={() => openAddModel(brand.id)}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm model cho {brand.name}
                        </button>
                      </div>
                      {brandModels.length === 0 ? (
                        <p className="text-center text-gray-400 py-6 text-sm">Chưa có model nào.</p>
                      ) : (
                        <ul className="space-y-1 rounded-xl border border-gray-100 divide-y divide-gray-50">
                          {brandModels.map((model) => (
                            <li key={model.id} className="flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-slate-50/80">
                              <div className="flex items-center gap-2 min-w-0">
                                <Cpu className="w-4 h-4 text-navy/60 shrink-0" />
                                <span className="font-medium text-navy truncate">{model.name}</span>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditModel(model);
                                    setModelPresetBrandId(null);
                                    modelForm.setValue('name', model.name);
                                    modelForm.setValue('brandId', model.brand?.id ?? brand.id);
                                    setModelModal(true);
                                  }}
                                  className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button type="button" onClick={() => setDeleteModelId(model.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {brands.length === 0 && <p className="text-center text-gray-400 py-12">Chưa có thương hiệu</p>}
          </div>
        )}
      </div>

      <Modal isOpen={brandModal} onClose={() => { setBrandModal(false); setEditBrand(null); brandForm.reset(); }} title={editBrand ? 'Sửa thương hiệu' : 'Thêm thương hiệu'} size="sm">
        <form onSubmit={brandForm.handleSubmit((d) => editBrand ? updateBrand.mutate({ id: editBrand.id, name: d.name }) : addBrand.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên thương hiệu *</label>
            <input {...brandForm.register('name')} className="input-field" placeholder="Toyota, Honda..." />
            {brandForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{brandForm.formState.errors.name.message}</p>}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={addBrand.isPending || updateBrand.isPending} className="btn-primary disabled:opacity-60">
              {editBrand ? 'Cập nhật' : 'Thêm'}
            </button>
            <button type="button" onClick={() => { setBrandModal(false); brandForm.reset(); }} className="btn-outline">Hủy</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modelModal} onClose={() => { setModelModal(false); setEditModel(null); modelForm.reset(); setModelPresetBrandId(null); }} title={editModel ? 'Sửa model' : 'Thêm model'} size="sm">
        <form
          onSubmit={modelForm.handleSubmit((d) =>
            editModel ? updateModel.mutate({ id: editModel.id, name: d.name, brandId: d.brandId }) : addModel.mutate(d)
          )}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu *</label>
            <select
              {...modelForm.register('brandId', { valueAsNumber: true })}
              disabled={modelPresetBrandId != null}
              className="input-field disabled:bg-gray-100 disabled:text-gray-600"
            >
              <option value={0}>Chọn thương hiệu</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            {modelForm.formState.errors.brandId && <p className="text-red-500 text-xs mt-1">{modelForm.formState.errors.brandId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên model *</label>
            <input {...modelForm.register('name')} className="input-field" placeholder="Camry, Civic..." />
            {modelForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{modelForm.formState.errors.name.message}</p>}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={addModel.isPending || updateModel.isPending} className="btn-primary disabled:opacity-60">
              {editModel ? 'Cập nhật' : 'Thêm'}
            </button>
            <button type="button" onClick={() => { setModelModal(false); modelForm.reset(); setModelPresetBrandId(null); }} className="btn-outline">Hủy</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteBrandId} onClose={() => setDeleteBrandId(null)} title="Xóa thương hiệu" size="sm">
        <p className="text-gray-600 mb-5">Xóa thương hiệu này sẽ ảnh hưởng đến các model liên quan.</p>
        <div className="flex gap-3">
          <button onClick={() => deleteBrandId && deleteBrand.mutate(deleteBrandId)} disabled={deleteBrand.isPending} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60">Xóa</button>
          <button onClick={() => setDeleteBrandId(null)} className="btn-outline">Hủy</button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteModelId} onClose={() => setDeleteModelId(null)} title="Xóa model" size="sm">
        <p className="text-gray-600 mb-5">Bạn có chắc chắn muốn xóa model này?</p>
        <div className="flex gap-3">
          <button onClick={() => deleteModelId && deleteModel.mutate(deleteModelId)} disabled={deleteModel.isPending} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60">Xóa</button>
          <button onClick={() => setDeleteModelId(null)} className="btn-outline">Hủy</button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageBrands;
