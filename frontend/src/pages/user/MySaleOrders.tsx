import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ShoppingBag, CreditCard, XCircle, Star, Receipt } from 'lucide-react';
import { cancelSaleOrderApi, getMySaleOrdersApi } from '../../api/saleOrders';
import { addReviewApi } from '../../api/reviews';
import { getMyInvoicesApi } from '../../api/invoices';
import { useToast } from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { formatCurrency, CAR_PLACEHOLDER } from '../../utils/helpers';
import { formatDate } from '../../utils/helpers';
import type { SaleOrder, Invoice } from '../../types';

const statusLabel: Record<string, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PENDING_ADMIN_CONFIRM: 'Chờ admin xác nhận',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

const MySaleOrders = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [invoiceSaleOrderId, setInvoiceSaleOrderId] = useState<number | null>(null);
  const [reviewSaleOrderId, setReviewSaleOrderId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const { data: orders = [], isLoading } = useQuery<SaleOrder[]>({
    queryKey: ['mySaleOrders'],
    queryFn: getMySaleOrdersApi,
  });
  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ['myInvoices'],
    queryFn: getMyInvoicesApi,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelSaleOrderApi(id),
    onSuccess: () => {
      showToast('Đã hủy đơn mua', 'success');
      queryClient.invalidateQueries({ queryKey: ['mySaleOrders'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      setCancelId(null);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Không thể hủy', 'error');
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      addReviewApi({
        saleOrderId: reviewSaleOrderId!,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      }),
    onSuccess: (data: { message?: string }) => {
      showToast(data?.message || 'Đã gửi đánh giá', 'success');
      queryClient.invalidateQueries({ queryKey: ['mySaleOrders'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['car'] });
      setReviewSaleOrderId(null);
      setReviewRating(5);
      setReviewComment('');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Không thể gửi đánh giá', 'error');
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-1">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h1 className="font-heading font-bold text-xl text-navy">Đơn mua xe</h1>
        </div>
        <p className="text-gray-400 text-sm">Theo dõi đơn đặt mua và thanh toán</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          Chưa có đơn mua.{' '}
          <Link to="/cars/mua" className="text-primary font-semibold">
            Xem xe đang bán
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const canPay =
              o.paymentMethod === 'BANK_TRANSFER' &&
              o.orderStatus === 'PENDING_PAYMENT';
            const canCancel =
              o.orderStatus === 'PENDING_PAYMENT' || o.orderStatus === 'PENDING_ADMIN_CONFIRM';
            const canReview = o.orderStatus === 'COMPLETED' && o.hasReview !== true;
            const hasInvoice = invoices.some((inv) => (inv.saleOrder?.id) === o.id);
            return (
              <div key={o.id} className="bg-white rounded-2xl shadow-sm p-5 flex flex-wrap gap-4 items-start">
                <img
                  src={o.car?.imagePath || CAR_PLACEHOLDER}
                  alt=""
                  className="w-24 h-20 object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
                  }}
                />
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold text-navy">
                    {o.car?.model?.brand?.name} {o.car?.model?.name}
                  </p>
                  <p className="text-sm text-gray-500">#{o.id} • {o.car?.plate}</p>
                  <p className="text-primary font-bold mt-1">{formatCurrency(o.totalPrice)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {statusLabel[o.orderStatus || ''] || o.orderStatus}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {hasInvoice && (
                    <button
                      type="button"
                      onClick={() => setInvoiceSaleOrderId(o.id)}
                      className="btn-outline text-sm py-2 px-4 text-primary border-primary/20 flex items-center justify-center gap-2"
                    >
                      <Receipt className="w-4 h-4" />
                      Xuất hóa đơn
                    </button>
                  )}
                  {canPay && (
                    <Link
                      to={`/dashboard/sale-payment/${o.id}`}
                      className="btn-primary text-sm py-2 px-4 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Thanh toán
                    </Link>
                  )}
                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => setCancelId(o.id)}
                      className="btn-outline text-sm py-2 px-4 text-red-600 border-red-200 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Hủy đơn
                    </button>
                  )}
                  {canReview && (
                    <button
                      type="button"
                      onClick={() => {
                        setReviewSaleOrderId(o.id);
                        setReviewRating(5);
                        setReviewComment('');
                      }}
                      className="btn-outline text-sm py-2 px-4 text-amber-700 border-amber-200 flex items-center justify-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      Đánh giá
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!cancelId} onClose={() => setCancelId(null)} title="Hủy đơn mua" size="sm">
        <p className="text-gray-600 mb-4">Hủy đơn #{cancelId}? Xe sẽ được mở bán lại.</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => cancelId && cancelMutation.mutate(cancelId)}
            disabled={cancelMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg"
          >
            Xác nhận hủy
          </button>
          <button type="button" onClick={() => setCancelId(null)} className="btn-outline">
            Đóng
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={!!invoiceSaleOrderId}
        onClose={() => setInvoiceSaleOrderId(null)}
        title="Chi tiết hóa đơn mua xe"
        size="md"
      >
        {(() => {
          const selectedInvoice = invoices.find((inv) => inv.saleOrder?.id === invoiceSaleOrderId) || null;
          if (!selectedInvoice) {
            return (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">Hóa đơn chưa được tạo cho đơn mua này.</p>
                <button onClick={() => setInvoiceSaleOrderId(null)} className="btn-outline mt-4">
                  Đóng
                </button>
              </div>
            );
          }

          return (
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
                  { label: 'Mã đơn mua', value: `#${selectedInvoice.saleOrder?.id}` },
                  {
                    label: 'Xe',
                    value: selectedInvoice.saleOrder?.car
                      ? `${selectedInvoice.saleOrder.car.model?.brand?.name ?? ''} ${selectedInvoice.saleOrder.car.model?.name ?? ''}`.trim()
                      : 'N/A',
                  },
                  { label: 'Biển số', value: selectedInvoice.saleOrder?.car?.plate || 'N/A' },
                  { label: 'Trạng thái đơn', value: selectedInvoice.saleOrder?.orderStatus || 'N/A' },
                  { label: 'Chiết khấu', value: `${selectedInvoice.discountRate}%` },
                  { label: 'Thuế VAT', value: `${selectedInvoice.taxRate}%` },
                  { label: 'Ngày tạo', value: selectedInvoice.createdDate ? formatDate(selectedInvoice.createdDate) : 'N/A' },
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
                <button onClick={() => setInvoiceSaleOrderId(null)} className="btn-outline flex-1">
                  Đóng
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal
        isOpen={!!reviewSaleOrderId}
        onClose={() => {
          setReviewSaleOrderId(null);
          setReviewRating(5);
          setReviewComment('');
        }}
        title="Đánh giá xe đã mua"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">Đơn mua #{reviewSaleOrderId}</p>
        <p className="text-sm text-gray-700 mb-2">Số sao (1-5)</p>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setReviewRating(n)}
              className={`p-2 rounded-lg transition-colors ${n <= reviewRating ? 'text-amber-500' : 'text-gray-300'}`}
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
              setReviewSaleOrderId(null);
              setReviewComment('');
            }}
            className="btn-outline flex-1"
          >
            Hủy
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MySaleOrders;
