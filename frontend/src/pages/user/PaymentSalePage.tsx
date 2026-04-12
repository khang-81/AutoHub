import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CreditCard, QrCode, Landmark, ArrowLeft } from 'lucide-react';
import { getSaleOrderByIdApi, submitSaleTransferApi } from '../../api/saleOrders';
import { useToast } from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';
import type { SaleOrder } from '../../types';

const BANK_INFO = {
  bankCode: 'TCB',
  bankName: 'Techcombank',
  accountName: 'TA DUC KHANG',
  accountNumber: '19073286543012',
  accountNumberDisplay: '1907 3286 5430 12',
};

const PaymentSalePage = () => {
  const { saleOrderId } = useParams<{ saleOrderId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: order, isLoading } = useQuery<SaleOrder>({
    queryKey: ['saleOrder', saleOrderId],
    queryFn: () => getSaleOrderByIdApi(Number(saleOrderId)),
    enabled: !!saleOrderId,
  });

  const transferMutation = useMutation({
    mutationFn: (id: number) => submitSaleTransferApi(id),
    onSuccess: () => {
      showToast(`Đã gửi xác nhận chuyển khoản. Đơn mua #${order?.id} chờ admin xác nhận.`, 'success');
      navigate('/dashboard/sale-orders');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Không thể gửi xác nhận', 'error');
    },
  });

  const qrUrl = useMemo(() => {
    if (!order?.id || !order?.totalPrice) return '';
    return `https://img.vietqr.io/image/${BANK_INFO.bankCode}-${BANK_INFO.accountNumber}-compact2.png?amount=${Math.round(
      order.totalPrice
    )}&addInfo=MUAXE-${order.id}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;
  }, [order]);

  if (isLoading) return <LoadingSpinner />;
  if (!order) return <div className="text-center text-gray-500">Không tìm thấy đơn mua.</div>;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/dashboard/sale-orders')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-navy"
      >
        <ArrowLeft className="w-4 h-4" />
        Đơn mua của tôi
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h1 className="font-heading font-bold text-xl text-navy mb-1">Thanh toán mua xe #{order.id}</h1>
        <p className="text-gray-500 text-sm">
          Xe: {order.car?.model?.brand?.name} {order.car?.model?.name} — Biển {order.car?.plate}
        </p>

        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>Tổng thanh toán (giá niêm yết)</span>
            <span className="font-semibold text-navy">{formatCurrency(order.totalPrice)}</span>
          </div>
        </div>

        {order.paymentMethod === 'BANK_TRANSFER' && order.orderStatus === 'PENDING_PAYMENT' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-navy font-semibold">
              <Landmark className="w-5 h-5" />
              Thông tin chuyển khoản
            </div>
            <div className="text-sm space-y-1 text-gray-700">
              <p>
                <span className="text-gray-500">Ngân hàng:</span> {BANK_INFO.bankName}
              </p>
              <p>
                <span className="text-gray-500">Số TK:</span> {BANK_INFO.accountNumberDisplay}
              </p>
              <p>
                <span className="text-gray-500">Chủ TK:</span> {BANK_INFO.accountName}
              </p>
              <p>
                <span className="text-gray-500">Nội dung:</span> MUAXE-{order.id}
              </p>
            </div>
            {qrUrl && (
              <div className="flex flex-col items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <img src={qrUrl} alt="QR VietQR" className="w-48 h-48 rounded-xl border border-gray-200" />
              </div>
            )}
            <button
              type="button"
              onClick={() => transferMutation.mutate(order.id)}
              disabled={transferMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {transferMutation.isPending ? 'Đang gửi...' : 'Tôi đã chuyển khoản'}
            </button>
          </div>
        )}

        {order.paymentMethod === 'CASH' && (
          <p className="mt-6 text-sm text-gray-600">
            Bạn chọn thanh toán tiền mặt. Đơn đang chờ admin xác nhận. Vui lòng theo dõi trạng thái tại &quot;Đơn mua
            xe&quot;.
          </p>
        )}

        {order.orderStatus !== 'PENDING_PAYMENT' && order.orderStatus !== 'PENDING_ADMIN_CONFIRM' && (
          <p className="mt-6 text-sm text-gray-600">Đơn không còn ở bước thanh toán này.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentSalePage;
