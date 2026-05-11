import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Car, Calendar, DollarSign, FileText, Eye, X, Receipt, Star, Undo2 } from 'lucide-react';
import { getRentalsByUserIdApi, cancelRentalApi, returnRentalByUserApi } from '../../api/rentals';
import { addReviewApi } from '../../api/reviews';
import { getMyInvoicesApi } from '../../api/invoices';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDate, CAR_PLACEHOLDER, getApiErrorMessage } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import type { RentalByUser, Invoice } from '../../types';

const RentalHistory = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [invoiceRentalId, setInvoiceRentalId] = useState<number | null>(null);
  const [reviewRentalId, setReviewRentalId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [returnTarget, setReturnTarget] = useState<RentalByUser | null>(null);
  const [returnKm, setReturnKm] = useState('');
  const [returnDateStr, setReturnDateStr] = useState('');
  /** Phí phát sinh khi trả (VNĐ) — xăng, vệ sinh, phụ phí khác */
  const [returnIncidentals, setReturnIncidentals] = useState('');

  const { data: rentals = [], isLoading, isError, error, refetch } = useQuery<RentalByUser[]>({
    queryKey: ['myRentals'],
    queryFn: getRentalsByUserIdApi,
    refetchOnMount: 'always',
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

  const returnUserMutation = useMutation({
    mutationFn: async () => {
      if (!returnTarget) throw new Error('no rental');
      const km = Number.parseInt(String(returnKm).replace(/\s/g, ''), 10);
      if (Number.isNaN(km) || km < 0) throw new Error('invalid-km');
      const startKm = returnTarget.startKilometer ?? returnTarget.car?.kilometer ?? 0;
      if (km < startKm) throw new Error('km-below-start');
      let extra = 0;
      if (String(returnIncidentals).trim() !== '') {
        extra = Number.parseInt(String(returnIncidentals).replace(/\s/g, ''), 10);
        if (Number.isNaN(extra) || extra < 0) throw new Error('invalid-incidental');
      }
      return returnRentalByUserApi(returnTarget.id, {
        endKilometer: km,
        returnDate: returnDateStr || undefined,
        additionalIncidentalFees: extra > 0 ? extra : undefined,
      });
    },
    onSuccess: (data: { message?: string }) => {
      showToast(data?.message || 'Đã xác nhận trả xe', 'success');
      queryClient.invalidateQueries({ queryKey: ['myRentals'] });
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['rental-busy-ranges'] });
      setReturnTarget(null);
      setReturnKm('');
      setReturnDateStr('');
      setReturnIncidentals('');
    },
    onError: (err: unknown) => {
      let msg = getApiErrorMessage(err, 'Không thể xác nhận trả xe');
      if (err instanceof Error) {
        if (err.message === 'invalid-km') msg = 'Vui lòng nhập số km hợp lệ';
        if (err.message === 'km-below-start') msg = 'Số km khi trả phải lớn hơn hoặc bằng km nhận xe';
        if (err.message === 'invalid-incidental') msg = 'Phí phát sinh phải là số không âm';
      }
      showToast(msg, 'error');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => cancelRentalApi(id, reason),
    onSuccess: (data: { message?: string }) => {
      showToast(data?.message || 'Đã hủy đơn thuê', 'success');
      queryClient.invalidateQueries({ queryKey: ['myRentals'] });
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      setCancelId(null);
      setCancelReason('');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Lỗi khi hủy đơn thuê', 'error');
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      addReviewApi({
        rentalId: reviewRentalId!,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      }),
    onSuccess: (data: { message?: string }) => {
      showToast(data?.message || 'Đã gửi đánh giá', 'success');
      queryClient.invalidateQueries({ queryKey: ['myRentals'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['car'] });
      setReviewRentalId(null);
      setReviewComment('');
      setReviewRating(5);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Không thể gửi đánh giá', 'error');
    },
  });

  const selectedInvoice = invoices.find((inv) => (inv.rental?.id ?? inv.rentalId) === invoiceRentalId) || null;
  const totalSpent = sortedRentals.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const getPaymentLabel = (rental: RentalByUser) => {
    if (rental.paymentMethod === 'CASH') return 'Thanh toán khi nhận xe';
    if (rental.paymentMethod === 'BANK_TRANSFER') return 'Chuyển khoản ngân hàng';
    return 'Chưa xác định';
  };
  const getPaymentStatusLabel = (rental: RentalByUser) => {
    const ps = rental.paymentStatus;
    if (ps === 'PAID') return 'Đã thanh toán đủ';
    if (ps === 'DEPOSIT_PAID') return 'Đã thanh toán cọc (~30%)';
    if (ps === 'PENDING_FINAL_PAYMENT') return 'Còn nợ — cần thanh toán nốt sau trả xe';
    if (ps === 'PENDING_CONFIRM') return 'Chờ xác nhận chuyển khoản';
    if (ps === 'PENDING_TRANSFER') return 'Chờ chuyển khoản';
    if (rental.paymentMethod === 'CASH') return 'Tiền mặt (cọc / quyết toán khi trả)';
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
      ) : isError ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-red-600 font-medium mb-2">Không tải được lịch sử thuê xe</p>
          <p className="text-gray-500 text-sm mb-4">
            {(error as { response?: { data?: { message?: string } } })?.response?.data?.message
              || (error as Error)?.message
              || 'Vui lòng thử lại sau.'}
          </p>
          <button type="button" className="btn-primary" onClick={() => refetch()}>
            Thử lại
          </button>
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
            const status = rental.rentalStatus || '';
            const canCancel =
              status !== 'CANCELLED' &&
              status !== 'COMPLETED' &&
              !rental.returnDate;
            const canReview =
              status === 'COMPLETED' && rental.hasReview !== true;
            const canReturnCar =
              !rental.returnDate && status === 'CONFIRMED';
            return (
              <div
                key={rental.id}
                className={`overflow-hidden rounded-2xl bg-white transition-shadow ${
                  canReturnCar
                    ? 'ring-2 ring-emerald-500 shadow-md shadow-emerald-600/15 ring-offset-2 ring-offset-[rgb(248,250,252)] hover:shadow-lg hover:shadow-emerald-600/20'
                    : 'shadow-sm hover:shadow-md'
                }`}
              >
                {canReturnCar && (
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-teal-50/80 to-emerald-50 px-4 py-2.5 sm:px-5">
                    <span className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      </span>
                      Đơn này đang thuê — xác nhận trả xe tại đây
                    </span>
                    <span className="hidden rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:inline">
                      Ưu tiên
                    </span>
                  </div>
                )}
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
                        className={`badge text-sm ${
                          rental.returnDate
                            ? 'bg-gray-100 text-gray-500'
                            : canReturnCar
                              ? 'border border-emerald-300 bg-emerald-100 font-semibold text-emerald-900'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {rental.returnDate
                          ? '✓ Đã trả xe'
                          : canReturnCar
                            ? '🔑 Chờ xác nhận trả xe'
                            : '🚗 Đang thuê'}
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

                    {(rental.depositAmount != null && rental.depositAmount > 0) && (
                      <p className="text-xs text-gray-500 mb-2">
                        Cọc đặt xe (~30%): {formatCurrency(rental.depositAmount)}
                        {rental.refundDepositAmount != null && status === 'CANCELLED' && (
                          <span className="text-amber-700"> • Hoàn cọc dự kiến: {formatCurrency(rental.refundDepositAmount)}</span>
                        )}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="badge text-xs bg-blue-100 text-blue-700">
                        Thanh toán: {getPaymentLabel(rental)} / {getPaymentStatusLabel(rental)}
                      </span>
                      <span className="badge text-xs bg-amber-100 text-amber-700">
                        Trạng thái đơn: {getRentalStatusLabel(rental)}
                      </span>
                    </div>

                    {rental.rentalStatus === 'COMPLETED' &&
                      rental.balanceDueAtReturn != null &&
                      rental.balanceDueAtReturn > 0 && (
                        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">
                          <strong>Số tiền còn phải thanh toán:</strong>{' '}
                          {formatCurrency(rental.balanceDueAtReturn)}
                          <span className="block text-xs text-amber-900/90 mt-1">
                            {rental.lateFeeAmount != null && rental.lateFeeAmount > 0 && (
                              <>Phí trễ: {formatCurrency(rental.lateFeeAmount)}</>
                            )}
                            {rental.returnAdditionalFees != null && rental.returnAdditionalFees > 0 && (
                              <>
                                {rental.lateFeeAmount != null && rental.lateFeeAmount > 0 ? ' · ' : ''}
                                Phí phát sinh: {formatCurrency(rental.returnAdditionalFees)}
                              </>
                            )}
                          </span>
                        </div>
                      )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {canReturnCar && (
                        <button
                          type="button"
                          onClick={() => {
                            setReturnTarget(rental);
                            setReturnDateStr(new Date().toISOString().slice(0, 10));
                            setReturnIncidentals('');
                            const startKm =
                              rental.startKilometer ??
                              rental.car?.kilometer ??
                              0;
                            setReturnKm(String(Math.max(0, Number(startKm)) + 100));
                          }}
                          className="order-first flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-700/30 ring-2 ring-emerald-400/40 transition hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:shadow-emerald-600/35 sm:w-auto sm:justify-start"
                        >
                          <Undo2 className="h-5 w-5 shrink-0" strokeWidth={2.5} />
                          Trả xe ngay
                        </button>
                      )}
                      {hasInvoice && (
                        <button
                          onClick={() => setInvoiceRentalId(rental.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-medium"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Xem hóa đơn
                        </button>
                      )}
                      {canReview && (
                        <button
                          type="button"
                          onClick={() => {
                            setReviewRentalId(rental.id);
                            setReviewRating(5);
                            setReviewComment('');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors text-xs font-medium"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Đánh giá
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

      {/* Trả xe (khách) */}
      <Modal
        isOpen={!!returnTarget}
        onClose={() => {
          setReturnTarget(null);
          setReturnKm('');
          setReturnDateStr('');
          setReturnIncidentals('');
        }}
        title="Xác nhận trả xe"
        size="sm"
      >
        {returnTarget && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Đơn <strong>#{returnTarget.id}</strong> —{' '}
              {returnTarget.car?.model?.brand?.name} {returnTarget.car?.model?.name}
            </p>
            <p className="text-xs text-gray-500">
              Chỉ khả dụng khi đơn đã được admin xác nhận. Hệ thống sẽ tính phí trễ (nếu trả sau ngày hẹn) và số tiền còn phải trả (giá chuyến − cọc + phát sinh).
            </p>
            <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-950">
              <p className="font-semibold text-amber-900">Quyết toán khi trả xe</p>
              <p className="mt-1 text-amber-900/85">
                Còn phải trả = tổng giá chuyến − tiền cọc đã đặt + phí nộp xe muộn + phí phát sinh (nếu có).
              </p>
              {returnTarget.depositAmount != null && returnTarget.depositAmount > 0 && (
                <p className="mt-2 font-medium text-navy">
                  Tổng chuyến: {formatCurrency(returnTarget.totalPrice)} · Cọc đã đặt:{' '}
                  {formatCurrency(returnTarget.depositAmount)}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ngày trả xe</label>
              <input
                type="date"
                value={returnDateStr}
                onChange={(e) => setReturnDateStr(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Số km đồng hồ khi trả
              </label>
              <input
                type="number"
                min={Math.max(0, returnTarget.startKilometer ?? returnTarget.car?.kilometer ?? 0)}
                value={returnKm}
                onChange={(e) => setReturnKm(e.target.value)}
                className="input-field w-full"
              />
              <p className="mt-1 text-xs text-gray-400">
                Km nhận xe (tham chiếu):{' '}
                {returnTarget.startKilometer ?? returnTarget.car?.kilometer ?? '—'}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phí phát sinh khi trả (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={returnIncidentals}
                onChange={(e) => setReturnIncidentals(e.target.value)}
                placeholder="0 — xăng, vệ sinh, phụ phí khác"
                className="input-field w-full"
              />
              <p className="mt-1 text-xs text-gray-400">Để trống nếu không phát sinh thêm.</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => returnUserMutation.mutate()}
                disabled={returnUserMutation.isPending}
                className="btn-primary flex-1"
              >
                {returnUserMutation.isPending ? 'Đang gửi...' : 'Xác nhận trả xe'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReturnTarget(null);
                  setReturnKm('');
                  setReturnDateStr('');
                  setReturnIncidentals('');
                }}
                className="btn-outline flex-1"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Review modal */}
      <Modal
        isOpen={!!reviewRentalId}
        onClose={() => {
          setReviewRentalId(null);
          setReviewComment('');
          setReviewRating(5);
        }}
        title="Đánh giá chuyến đi"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">Đơn #{reviewRentalId}</p>
        <p className="text-sm text-gray-700 mb-2">Số sao (1–5)</p>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setReviewRating(n)}
              className={`p-2 rounded-lg transition-colors ${
                n <= reviewRating ? 'text-amber-500' : 'text-gray-300'
              }`}
              aria-label={`${n} sao`}
            >
              <Star className={`w-8 h-8 ${n <= reviewRating ? 'fill-current' : ''}`} />
            </button>
          ))}
        </div>
        <label className="block text-sm text-gray-700 mb-2">Nhận xét (không bắt buộc)</label>
        <textarea
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          className="input-field w-full min-h-[100px] mb-4"
          placeholder="Chia sẻ trải nghiệm của bạn..."
          maxLength={2000}
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => reviewMutation.mutate()}
            disabled={reviewMutation.isPending}
            className="btn-primary flex-1"
          >
            {reviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
          <button
            type="button"
            onClick={() => {
              setReviewRentalId(null);
              setReviewComment('');
            }}
            className="btn-outline flex-1"
          >
            Hủy
          </button>
        </div>
      </Modal>

      {/* Cancel modal */}
      <Modal isOpen={!!cancelId} onClose={() => setCancelId(null)} title="Hủy đơn thuê" size="sm">
        <div className="text-center mb-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <X className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-gray-600">Bạn có chắc muốn hủy đơn thuê <strong>#{cancelId}</strong>?</p>
          <p className="text-gray-400 text-sm mt-2">
            Hoàn cọc theo thời điểm hủy (&gt;48h: 100%, 24–48h: 50%, &lt;24h: 0%).
          </p>
        </div>
        <label className="block text-sm text-gray-600 mb-1 text-left">Lý do (không bắt buộc)</label>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          className="input-field w-full min-h-[80px] mb-4"
          placeholder="Ví dụ: Đổi lịch trình..."
        />
        <div className="flex gap-3">
          <button
            onClick={() => cancelId && cancelMutation.mutate({ id: cancelId, reason: cancelReason || undefined })}
            disabled={cancelMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl flex-1 disabled:opacity-60"
          >
            {cancelMutation.isPending ? 'Đang hủy...' : 'Xác nhận hủy'}
          </button>
          <button onClick={() => { setCancelId(null); setCancelReason(''); }} className="btn-outline flex-1">
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
