import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Car, Calendar, DollarSign, FileText, Eye, X, Receipt } from 'lucide-react';
import { getRentalsByUserIdApi, deleteRentalApi } from '../../api/rentals';
import { getMyInvoicesApi } from '../../api/invoices';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDate, CAR_PLACEHOLDER } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import type { RentalByUser, Invoice } from '../../types';

const RentalHistory = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [invoiceRentalId, setInvoiceRentalId] = useState<number | null>(null);

  const { data: rentals = [], isLoading } = useQuery<RentalByUser[]>({
    queryKey: ['myRentals'],
    queryFn: getRentalsByUserIdApi,
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ['myInvoices'],
    queryFn: getMyInvoicesApi,
  });

  const sortedRentals = useMemo(
    () =>
      [...rentals].sort((a, b) => b.id - a.id),
    [rentals]
  );

  const cancelMutation = useMutation({
    mutationFn: deleteRentalApi,
    onSuccess: () => {
      showToast('Đã hủy đơn thuê thành công', 'success');
      queryClient.invalidateQueries({ queryKey: ['myRentals'] });
      setCancelId(null);
    },
    onError: () => showToast('Lỗi khi hủy đơn thuê', 'error'),
  });

  const selectedInvoice = invoices.find((inv) => (inv.rental?.id ?? inv.rentalId) === invoiceRentalId) || null;
  const totalSpent = sortedRentals.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const getPaymentLabel = (rental: RentalByUser) => {
    if (rental.paymentMethod === 'CASH') return 'Thanh toán khi nhận xe';
    if (rental.paymentMethod === 'BANK_TRANSFER') return 'Chuyển khoản ngân hàng';
    return 'Chưa xác định';
  };
  const getPaymentStatusLabel = (rental: RentalByUser) => {
    if (rental.paymentMethod === 'CASH') return 'Thanh toán khi nhận xe';
    if (rental.paymentStatus === 'PAID') return 'Đã thanh toán';
    if (rental.paymentStatus === 'PENDING_CONFIRM') return 'Chờ xác nhận chuyển khoản';
    if (rental.paymentStatus === 'PENDING_TRANSFER') return 'Chờ chuyển khoản';
    return 'Chưa thanh toán';
  };
  const getRentalStatusLabel = (rental: RentalByUser) => {
    const status = rental.rentalStatus || (rental.returnDate ? 'COMPLETED' : 'PENDING_ADMIN_CONFIRM');
    if (status === 'PENDING_ADMIN_CONFIRM') return 'Chờ admin xác nhận';
    if (status === 'PENDING_PAYMENT') return 'Chờ khách thanh toán';
    if (status === 'CONFIRMED') return 'Đã xác nhận';
    if (status === 'COMPLETED') return 'Đã hoàn tất';
    if (status === 'CANCELLED') return 'Đã hủy';
    return 'Đang xử lý';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-1">
          <FileText className="w-5 h-5 text-primary" />
          <h1 className="font-heading font-bold text-xl text-navy">Lịch sử thuê xe</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Tổng {sortedRentals.length} lần thuê • Chi tiêu: {formatCurrency(totalSpent)}
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <LoadingSpinner />
        </div>
      ) : sortedRentals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Car className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-navy text-lg mb-2">Chưa có đơn thuê nào</h3>
          <p className="text-gray-400 mb-6">Bắt đầu hành trình của bạn ngay hôm nay!</p>
          <Link to="/cars" className="btn-primary inline-flex items-center gap-2">
            <Car className="w-4 h-4" />
            Thuê xe ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRentals.map((rental) => {
            const hasInvoice = invoices.some((inv) => (inv.rental?.id ?? inv.rentalId) === rental.id);
            const canCancel = !rental.returnDate;
            return (
              <div key={rental.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  {/* Car image */}
                  <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0 bg-gray-100">
                    <img
                      src={rental.car?.imagePath || CAR_PLACEHOLDER}
                      alt="car"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-heading font-semibold text-navy">
                          {rental.car?.model?.brand?.name} {rental.car?.model?.name}
                        </h3>
                        <p className="text-gray-400 text-sm">#{rental.id}</p>
                      </div>
                      <span
                        className={`badge text-sm ${rental.returnDate
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {rental.returnDate ? '✓ Đã trả xe' : '🚗 Đang thuê'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400">Ngày thuê</p>
                          <p className="font-medium">{formatDate(rental.startDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400">Ngày trả</p>
                          <p className="font-medium">{formatDate(rental.endDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400">Tổng tiền</p>
                          <p className="font-bold text-primary">{formatCurrency(rental.totalPrice)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="badge text-xs bg-blue-100 text-blue-700">
                        Thanh toán: {getPaymentLabel(rental)} / {getPaymentStatusLabel(rental)}
                      </span>
                      <span className="badge text-xs bg-amber-100 text-amber-700">
                        Trạng thái đơn: {getRentalStatusLabel(rental)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {hasInvoice && (
                        <button
                          onClick={() => setInvoiceRentalId(rental.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-medium"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Xem hóa đơn
                        </button>
                      )}
                      {canCancel && (
                        <button
                          onClick={() => setCancelId(rental.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-xs font-medium"
                        >
                          <X className="w-3.5 h-3.5" />
                          Hủy đơn
                        </button>
                      )}
                      <Link
                        to={`/cars/${rental.car?.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-xs font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Xem xe
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel modal */}
      <Modal isOpen={!!cancelId} onClose={() => setCancelId(null)} title="Hủy đơn thuê" size="sm">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <X className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-gray-600">Bạn có chắc muốn hủy đơn thuê <strong>#{cancelId}</strong>?</p>
          <p className="text-gray-400 text-sm mt-2">Hành động này không thể hoàn tác.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => cancelId && cancelMutation.mutate(cancelId)}
            disabled={cancelMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl flex-1 disabled:opacity-60"
          >
            {cancelMutation.isPending ? 'Đang hủy...' : 'Xác nhận hủy'}
          </button>
          <button onClick={() => setCancelId(null)} className="btn-outline flex-1">
            Giữ đơn
          </button>
        </div>
      </Modal>

      {/* Invoice modal */}
      <Modal
        isOpen={!!invoiceRentalId}
        onClose={() => setInvoiceRentalId(null)}
        title="Chi tiết hóa đơn"
        size="md"
      >
        {selectedInvoice && (
          <div className="space-y-5">
            <div className="text-center pb-5 border-b">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-heading font-bold text-xl text-navy">
                {selectedInvoice.invoiceNo || `INV-${selectedInvoice.id}`}
              </h2>
              <p className="text-gray-400 text-sm">AutoHub Car Rental</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Mã đơn thuê', value: `#${selectedInvoice.rental?.id ?? selectedInvoice.rentalId}` },
                {
                  label: 'Xe',
                  value: selectedInvoice.rental?.car
                    ? `${selectedInvoice.rental.car.model?.brand?.name ?? ''} ${selectedInvoice.rental.car.model?.name ?? ''}`.trim()
                    : 'N/A',
                },
                { label: 'Biển số', value: selectedInvoice.rental?.car?.plate || 'N/A' },
                { label: 'Ngày nhận xe', value: selectedInvoice.rental?.startDate ? formatDate(selectedInvoice.rental.startDate) : 'N/A' },
                { label: 'Ngày trả xe', value: selectedInvoice.rental?.endDate ? formatDate(selectedInvoice.rental.endDate) : 'N/A' },
                { label: 'Chiết khấu', value: `${selectedInvoice.discountRate}%` },
                { label: 'Thuế VAT', value: `${selectedInvoice.taxRate}%` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">{row.label}</span>
                  <span className="font-medium text-navy">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 rounded-xl p-4 flex justify-between items-center">
              <span className="font-semibold text-navy">Tổng thanh toán</span>
              <span className="font-heading font-bold text-2xl text-primary">
                {formatCurrency(selectedInvoice.totalPrice)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="btn-primary flex items-center gap-2 flex-1 justify-center"
              >
                In hóa đơn
              </button>
              <button onClick={() => setInvoiceRentalId(null)} className="btn-outline flex-1">
                Đóng
              </button>
            </div>
          </div>
        )}
        {!selectedInvoice && invoiceRentalId && (
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">Hóa đơn chưa được tạo cho đơn này.</p>
            <button onClick={() => setInvoiceRentalId(null)} className="btn-outline mt-4">
              Đóng
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RentalHistory;
