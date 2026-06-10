import { useRef, useState } from 'react';
import { ImagePlus, Link2, Loader2 } from 'lucide-react';
import type { CarImageItem, CarImageType } from '../../types';
import { uploadCarImageApi } from '../../api/cars';
import { CAR_PLACEHOLDER, resolveMediaUrl } from '../../utils/helpers';

export const DEFAULT_CAR_GALLERY: CarImageItem[] = [
  { sortOrder: 1, imageType: 'EXTERIOR', imageUrl: '' },
  { sortOrder: 2, imageType: 'EXTERIOR', imageUrl: '' },
  { sortOrder: 3, imageType: 'EXTERIOR', imageUrl: '' },
  { sortOrder: 4, imageType: 'INTERIOR', imageUrl: '' },
  { sortOrder: 5, imageType: 'INTERIOR', imageUrl: '' },
];

const SLOT_LABELS = [
  'Ngoại thất 1 (ảnh bìa)',
  'Ngoại thất 2',
  'Ngoại thất 3',
  'Nội thất 1',
  'Nội thất 2',
];

interface CarGalleryEditorProps {
  value: CarImageItem[];
  onChange: (next: CarImageItem[]) => void;
  carId?: number;
  disabled?: boolean;
  onUploadError?: (message: string) => void;
}

const CarGalleryEditor = ({ value, onChange, carId, disabled, onUploadError }: CarGalleryEditorProps) => {
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const slots = value.length === 5 ? value : DEFAULT_CAR_GALLERY;

  const updateSlot = (index: number, patch: Partial<CarImageItem>) => {
    const next = slots.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  };

  const handleUpload = async (index: number, file: File) => {
    setUploadingSlot(index);
    try {
      const { url } = await uploadCarImageApi(file, carId);
      updateSlot(index, { imageUrl: url });
    } catch {
      onUploadError?.('Không tải được ảnh. Thử lại hoặc dán URL.');
    } finally {
      setUploadingSlot(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-gray-700">
          Gallery 5 ảnh <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-gray-400">3 ngoại thất + 2 nội thất</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {slots.map((slot, index) => {
          const preview = slot.imageUrl ? resolveMediaUrl(slot.imageUrl) : CAR_PLACEHOLDER;
          const busy = uploadingSlot === index;
          return (
            <div
              key={slot.sortOrder}
              className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 space-y-2"
            >
              <p className="text-xs font-medium text-gray-600">{SLOT_LABELS[index]}</p>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={preview}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
                  }}
                />
                {busy && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={disabled || busy}
                  onClick={() => fileRefs.current[index]?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  Tải ảnh
                </button>
                <input
                  ref={(el) => { fileRefs.current[index] = el; }}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleUpload(index, file);
                    e.target.value = '';
                  }}
                />
              </div>
              <div className="relative">
                <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="url"
                  disabled={disabled || busy}
                  value={slot.imageUrl}
                  onChange={(e) =>
                    updateSlot(index, {
                      imageUrl: e.target.value.trim(),
                      imageType: (slot.imageType as CarImageType) || (index < 3 ? 'EXTERIOR' : 'INTERIOR'),
                    })
                  }
                  placeholder="https://... hoặc /files/..."
                  className="input-field pl-8 text-xs py-2"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CarGalleryEditor;
