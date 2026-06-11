import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Search, FileText, CheckCircle, Download, AlertTriangle } from 'lucide-react';
import {
  getAllRentalsApi,
  deleteRentalApi,
  confirmRentalApi,
  adminReturnRentalApi,
  adminUploadRentalDamagePhotoApi,
  type ReturnRentalFormBody,
} from '../../api/rentals';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate, CAR_PLACEHOLDER } from '../../utils/helpers';
import type { Rental } from '../../types';

const ManageRentals = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const invalidateRentalRelated = () => {
    queryClient.invalidateQueries({ queryKey: ['rentals'] });
    queryClient.invalidateQueries({ queryKey: ['myRentals'] });
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
    queryClient.invalidateQueries({ queryKey: ['car'] });
    queryClient.invalidateQueries({ queryKey: ['rental-busy-ranges'] });
  };
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'returned' | 'dispute'>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [returnRental, setReturnRental] = useState<Rental | null>(null);
  // Form state cho dialog "Đối chiếu trả xe" (Sprint 3 — UC #15).
  const [returnForm, setReturnForm] = useState<{
    endKilometer: string;
    actualFuelLevel: string;
    additionalIncidentalFees: string;
    damageNotes: string;
    damagePhotoUrls: string;
    returnDate: string;
  }>({
    endKilometer: '',
    actualFuelLevel: '100',
    additionalIncidentalFees: '0',
    damageNotes: '',
    damagePhotoUrls: '',
    returnDate: '',
  });

  const { data: rentals = [], isLoading } = useQuery<Rental[]>({
    queryKey: ['rentals'],
    queryFn: getAllRentalsApi,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRentalApi,
    onSuccess: () => {
      showToast('Đã xóa đơn thuê', 'success');
      invalidateRentalRelated();
      setDeleteId(null);
    },
    onError: () => showToast('Lỗi khi xóa', 'error'),
  });

  const returnMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: ReturnRentalFormBody }) =>
      adminReturnRentalApi(id, body),
    onSuccess: (res, vars) => {
      const msg = (res as { message?: string })?.message ?? 'Đã ghi nhận trả xe';
      showToast(vars.body.markDispute ? `Đã đánh dấu tranh chấp: ${msg}` : msg, 'success');
      invalidateRentalRelated();
      setReturnRental(null);
    },
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      showToast(apiError?.response?.data?.message ?? 'Lỗi khi xác nhận trả xe', 'error');
    },
  });

  const uploadDamageMutation = useMutation({
    mutationFn: adminUploadRentalDamagePhotoApi,
    onSuccess: (data: { url?: string }) => {
      const url = (data?.url || '').trim();
      if (!url) {
        showToast('Phản hồi tải ảnh không hợp lệ', 'error');
        return;
      }
      setReturnForm((f) => ({
        ...f,
        damagePhotoUrls: f.damagePhotoUrls.trim() ? `${f.damagePhotoUrls.trim()},${url}` : url,
      }));
      showToast('Đã tải ảnh — URL đã thêm vào danh sách', 'success');
    },
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      showToast(apiError?.response?.data?.message ?? 'Không tải được ảnh', 'error');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: confirmRentalApi,
    onSuccess: () => {
      showToast('Đã xác nhận đơn thuê', 'success');
      // Đơn chuyển sang CONFIRMED — không còn khớp bộ lọc « Chờ duyệt », tránh cảm giác « mất đơn ».
      setFilterStatus((cur) => (cur === 'pending' ? 'confirmed' : cur));
      invalidateRentalRelated();
    },
    onError: () => showToast('Lỗi khi xác nhận đơn', 'error'),
  });

  const openReturnModal = (rental: Rental) => {
    setReturnRental(rental);
    const startKm = rental.startKilometer ?? rental.car?.kilometer ?? 0;
    const today = new Date().toISOString().slice(0, 10);
    const pendingReturn = rental.rentalStatus === 'PENDING_RETURN';
    setReturnForm({
      endKilometer: String(
        pendingReturn && rental.endKilometer != null ? rental.endKilometer : startKm
      ),
      actualFuelLevel: String(rental.actualFuelLevel ?? 100),
      additionalIncidentalFees: String(rental.returnAdditionalFees ?? 0),
      damageNotes: rental.damageNotes ?? '',
      damagePhotoUrls: rental.damagePhotoUrls ?? '',
      returnDate: today,
    });
  };

  const submitReturn = (markDispute: boolean) => {
    if (!returnRental) return;
    const startKm = returnRental.startKilometer ?? returnRental.car?.kilometer ?? 0;
    const endKilometer = Number(returnForm.endKilometer);
    if (!Number.isFinite(endKilometer) || endKilometer < startKm) {
      showToast(`Km trả phải ≥ km lúc nhận (${startKm} km)`, 'error');
      return;
    }
    const actualFuelLevel = Number(returnForm.actualFuelLevel);
    if (!Number.isFinite(actualFuelLevel) || actualFuelLevel < 0 || actualFuelLevel > 100) {
      showToast('Mức xăng thực tế phải trong 0–100%', 'error');
      return;
    }
    const additional = Number(returnForm.additionalIncidentalFees);
    const rd = returnForm.returnDate.trim() || new Date().toISOString().slice(0, 10);
    returnMutation.mutate({
      id: returnRental.id,
      body: {
        endKilometer,
        returnDate: rd,
        actualFuelLevel,
        additionalIncidentalFees: Number.isFinite(additional) && additional > 0 ? additional : 0,
        damageNotes: returnForm.damageNotes.trim() || undefined,
        damagePhotoUrls: returnForm.damagePhotoUrls.trim() || undefined,
        markDispute,
      },
    });
  };

  const handleExportCSV = () => {
    const header = ['ID', 'Xe', 'Khách hàng', 'Ngày thuê', 'Ngày trả', 'Tổng tiền', 'Trạng thái'];
    const rows = rentals.map((r) => [
      r.id,
      `${r.car?.model?.brand?.name || ''} ${r.car?.model?.name || ''}`,
      r.user?.email || '',
      r.startDate,
      r.endDate,
      r.totalPrice,
      r.rentalStatus || (r.returnDate ? 'COMPLETED' : 'PENDING_ADMIN_CONFIRM'),
    ]);
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rentals.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = rentals.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      r.car?.model?.brand?.name?.toLowerCase().includes(q) ||
      r.user?.email?.toLowerCase().includes(q) ||
      String(r.id).includes(q);
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && (
        r.rentalStatus === 'PENDING_PAYMENT' ||
        r.rentalStatus === 'PENDING_ADMIN_CONFIRM' ||
        r.rentalStatus === 'PENDING_RETURN' ||
        (!r.returnDate && !r.rentalStatus)
      )) ||
      (filterStatus === 'confirmed' && r.rentalStatus === 'CONFIRMED') ||
      (filterStatus === 'returned' && (r.rentalStatus === 'COMPLETED' || !!r.returnDate)) ||
      (filterStatus === 'dispute' && r.rentalStatus === 'DISPUTE');
    return matchSearch && matchStatus;
  });
  const sortedFiltered = [...filtered].sort((a, b) => b.id - a.id);

  const totalRevenue = rentals.reduce((s, r) => s + (r.totalPrice || 0), 0);
  const activeCount = rentals.filter((r) => !r.returnDate).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-navy">Quản lý đơn thuê</h1>
          <p className="text-gray-400 text-sm mt-1">
            {rentals.length} đơn • {activeCount} đang thuê • Doanh thu: {formatCurrency(totalRevenue)}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Xuất CSV
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo xe, email, ID..."
            className="input-field pl-12"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'confirmed', 'returned', 'dispute'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === s
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {s === 'all'
                ? 'Tất cả'
                : s === 'pending'
                  ? 'Chờ duyệt'
                  : s === 'confirmed'
                    ? 'Đã duyệt'
                    : s === 'returned'
                      ? 'Đã trả'
                      : 'Tranh chấp'}
            </button>
          ))}
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
                  <th className="text-left px-5 py-4 font-medium">Khách hàng</th>
                  <th className="text-left px-5 py-4 font-medium">Ngày thuê</th>
                  <th className="text-left px-5 py-4 font-medium">Ngày trả (kế hoạch)</th>
                  <th className="text-right px-5 py-4 font-medium">Giá</th>
                  <th className="text-right px-5 py-4 font-medium">Thanh toán</th>
                  <th className="text-right px-5 py-4 font-medium">Trạng thái</th>
                  <th className="text-right px-5 py-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sortedFiltered.map((rental, idx) => (
                  <tr key={rental.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-400">{idx + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={rental.car?.imagePath || CAR_PLACEHOLDER}
                          alt=""
                          className="w-10 h-8 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
                          }}
                        />
                        <span className="font-medium text-navy">
                          {rental.car?.model?.brand?.name} {rental.car?.model?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 max-w-[140px] truncate">
                      {rental.user?.email}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{formatDate(rental.startDate)}</td>
                    <td className="px-5 py-4 text-gray-600">{formatDate(rental.endDate)}</td>
                    <td className="px-5 py-4 text-right font-semibold text-primary">
                      {formatCurrency(rental.totalPrice)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="badge text-xs bg-blue-100 text-blue-700">
                        {rental.paymentMethod || 'BANK_TRANSFER'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {(rental.rentalStatus === 'COMPLETED' || rental.returnDate) ? (
                        <span className="badge text-xs bg-gray-100 text-gray-500">
                          Đã trả {rental.returnDate ? formatDate(rental.returnDate) : ''}
                        </span>
                      ) : rental.rentalStatus === 'DISPUTE' ? (
                        <span className="badge text-xs bg-red-100 text-red-700">Tranh chấp</span>
                      ) : rental.rentalStatus === 'PENDING_PAYMENT' ? (
                        <span className="badge text-xs bg-blue-100 text-blue-700">Chờ khách chuyển khoản</span>
                      ) : rental.rentalStatus === 'PENDING_ADMIN_CONFIRM' ? (
                        <span className="badge text-xs bg-amber-100 text-amber-700">Chờ admin xác nhận</span>
                      ) : rental.rentalStatus === 'PENDING_RETURN' ? (
                        <span className="badge text-xs bg-amber-100 text-amber-800 font-semibold">Chờ xác nhận trả</span>
                      ) : rental.rentalStatus === 'CONFIRMED' ? (
                        <span className="badge text-xs bg-green-100 text-green-700">Đã xác nhận</span>
                      ) : (
                        <span className="badge text-xs bg-green-100 text-green-700">
                          Đang thuê
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {rental.rentalStatus === 'PENDING_ADMIN_CONFIRM' && (
                          <button
                            onClick={() => confirmMutation.mutate(rental.id)}
                            className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Xác nhận đơn"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {!rental.returnDate &&
                          (rental.rentalStatus === 'CONFIRMED' ||
                            rental.rentalStatus === 'DISPUTE' ||
                            rental.rentalStatus === 'PENDING_RETURN') && (
                          <button
                            onClick={() => openReturnModal(rental)}
                            className={`p-2 rounded-lg transition-colors ${
                              rental.rentalStatus === 'PENDING_RETURN'
                                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 ring-1 ring-amber-200'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={
                              rental.rentalStatus === 'PENDING_RETURN'
                                ? 'Xác nhận trả xe (khách đã gửi yêu cầu)'
                                : 'Đối chiếu trả xe'
                            }
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteId(rental.id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Xóa đơn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedFiltered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                Không có đơn thuê
              </div>
            )}
          </div>
        )}
      </div>

      {/* Return car modal */}
      <Modal
        isOpen={!!returnRental}
        onClose={() => setReturnRental(null)}
        title="Đối chiếu trả xe"
        size="lg"
      >
        {returnRental && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
              <img
                src={returnRental.car?.imagePath || CAR_PLACEHOLDER}
                alt=""
                className="w-16 h-12 object-cover rounded-lg shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
                }}
              />
              <div className="min-w-0">
                <p className="font-semibold text-navy">
                  {returnRental.car?.model?.brand?.name} {returnRental.car?.model?.name}
                </p>
                <p className="text-sm text-gray-500 truncate">Khách: {returnRental.user?.email}</p>
                <p className="text-sm text-primary font-bold">{formatCurrency(returnRental.totalPrice)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Km lúc nhận:{' '}
                  <strong>{returnRental.startKilometer ?? returnRental.car?.kilometer ?? '—'}</strong>
                  {returnRental.allowedKilometers != null && (
                    <> • Hạn mức: <strong>{returnRental.allowedKilometers}</strong> km</>
                  )}
                  {returnRental.expectedFuelLevel != null && (
                    <> • Xăng kỳ vọng trả: <strong>{returnRental.expectedFuelLevel}%</strong></>
                  )}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Hệ thống tự tính phí trễ (theo ngày), vượt km và thiếu xăng khi bạn bấm xác nhận. Có thể bổ sung phụ phí
              thủ công và biên bản trầy xước.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày trả thực tế</label>
                <input
                  type="date"
                  value={returnForm.returnDate}
                  onChange={(e) => setReturnForm((f) => ({ ...f, returnDate: e.target.value }))}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Km đồng hồ khi trả</label>
                <input
                  type="number"
                  min={returnRental.startKilometer ?? returnRental.car?.kilometer ?? 0}
                  value={returnForm.endKilometer}
                  onChange={(e) => setReturnForm((f) => ({ ...f, endKilometer: e.target.value }))}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mức xăng thực tế (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={returnForm.actualFuelLevel}
                  onChange={(e) => setReturnForm((f) => ({ ...f, actualFuelLevel: e.target.value }))}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phụ phí khác (VNĐ)</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={returnForm.additionalIncidentalFees}
                  onChange={(e) => setReturnForm((f) => ({ ...f, additionalIncidentalFees: e.target.value }))}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả trầy xước / hư hại</label>
              <textarea
                rows={3}
                value={returnForm.damageNotes}
                onChange={(e) => setReturnForm((f) => ({ ...f, damageNotes: e.target.value }))}
                className="input-field w-full resize-y"
                placeholder="Ví dụ: trầy cản sau, móp cửa trái..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ảnh minh chứng (URL, phân tách bằng dấu phẩy) — hoặc tải ảnh lên
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={returnForm.damagePhotoUrls}
                  onChange={(e) => setReturnForm((f) => ({ ...f, damagePhotoUrls: e.target.value }))}
                  className="input-field w-full flex-1"
                  placeholder="/files/...,https://..."
                />
                <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-navy/20 text-navy text-sm font-medium hover:bg-navy/5 cursor-pointer shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadDamageMutation.isPending}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (file) uploadDamageMutation.mutate(file);
                    }}
                  />
                  {uploadDamageMutation.isPending ? 'Đang tải...' : 'Chọn ảnh'}
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => submitReturn(false)}
                disabled={returnMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {returnMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Hoàn tất trả xe
              </button>
              <button
                type="button"
                onClick={() => submitReturn(true)}
                disabled={returnMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-xl flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <AlertTriangle className="w-4 h-4" />
                Tranh chấp (giữ lịch xe)
              </button>
              <button type="button" onClick={() => setReturnRental(null)} className="btn-outline px-5 py-2.5">
                Hủy
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Xóa đơn thuê" size="sm">
        <p className="text-gray-600 mb-5">Bạn có chắc muốn xóa đơn thuê #{deleteId}?</p>
        <div className="flex gap-3">
          <button
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            disabled={deleteMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60"
          >
            Xóa
          </button>
          <button onClick={() => setDeleteId(null)} className="btn-outline">
            Hủy
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageRentals;
