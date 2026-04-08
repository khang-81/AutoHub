import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Search, FileText, CheckCircle, Download } from 'lucide-react';
import { getAllRentalsApi, deleteRentalApi, returnCarApi, confirmRentalApi } from '../../api/rentals';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate, CAR_PLACEHOLDER } from '../../utils/helpers';
import type { Rental } from '../../types';

const ManageRentals = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'returned'>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [returnRental, setReturnRental] = useState<Rental | null>(null);

  const { data: rentals = [], isLoading } = useQuery<Rental[]>({
    queryKey: ['rentals'],
    queryFn: getAllRentalsApi,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRentalApi,
    onSuccess: () => {
      showToast('Đã xóa đơn thuê', 'success');
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      setDeleteId(null);
    },
    onError: () => showToast('Lỗi khi xóa', 'error'),
  });

  const returnMutation = useMutation({
    mutationFn: returnCarApi,
    onSuccess: () => {
      showToast('Xác nhận trả xe thành công!', 'success');
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      setReturnRental(null);
    },
    onError: () => showToast('Lỗi khi xác nhận trả xe', 'error'),
  });

  const confirmMutation = useMutation({
    mutationFn: confirmRentalApi,
    onSuccess: () => {
      showToast('Đã xác nhận đơn thuê', 'success');
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
    },
    onError: () => showToast('Lỗi khi xác nhận đơn', 'error'),
  });

  const handleReturnCar = () => {
    if (!returnRental) return;
    const today = new Date().toISOString().slice(0, 10);
    returnMutation.mutate({
      id: returnRental.id,
      startDate: returnRental.startDate,
      endDate: returnRental.endDate,
      returnDate: today,
      endKilometer: (returnRental.car?.kilometer || 0) + 500,
      totalPrice: returnRental.totalPrice,
      carId: returnRental.car?.id,
      userId: returnRental.user?.id,
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
        (!r.returnDate && !r.rentalStatus)
      )) ||
      (filterStatus === 'confirmed' && r.rentalStatus === 'CONFIRMED') ||
      (filterStatus === 'returned' && (r.rentalStatus === 'COMPLETED' || !!r.returnDate));
    return matchSearch && matchStatus;
  });

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
          {(['all', 'pending', 'confirmed', 'returned'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === s
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {s === 'all' ? 'Tất cả' : s === 'pending' ? '🟡 Chờ duyệt' : s === 'confirmed' ? '🟢 Đã duyệt' : '⚫ Đã trả'}
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
                {filtered.map((rental, idx) => (
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
                      ) : rental.rentalStatus === 'PENDING_PAYMENT' ? (
                        <span className="badge text-xs bg-blue-100 text-blue-700">Chờ khách chuyển khoản</span>
                      ) : rental.rentalStatus === 'PENDING_ADMIN_CONFIRM' ? (
                        <span className="badge text-xs bg-amber-100 text-amber-700">Chờ admin xác nhận</span>
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
                        {!rental.returnDate && (
                          <button
                            onClick={() => setReturnRental(rental)}
                            className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                            title="Xác nhận trả xe"
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
            {filtered.length === 0 && (
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
        title="Xác nhận trả xe"
        size="sm"
      >
        {returnRental && (
          <div>
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl mb-5">
              <img
                src={returnRental.car?.imagePath || CAR_PLACEHOLDER}
                alt=""
                className="w-16 h-12 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
                }}
              />
              <div>
                <p className="font-semibold text-navy">
                  {returnRental.car?.model?.brand?.name} {returnRental.car?.model?.name}
                </p>
                <p className="text-sm text-gray-500">Khách: {returnRental.user?.email}</p>
                <p className="text-sm text-primary font-bold">{formatCurrency(returnRental.totalPrice)}</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">
              Xác nhận khách đã trả xe hôm nay ({new Date().toLocaleDateString('vi-VN')})?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReturnCar}
                disabled={returnMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {returnMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Xác nhận trả xe
              </button>
              <button onClick={() => setReturnRental(null)} className="btn-outline">
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
