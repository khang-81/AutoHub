import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CreditCard, QrCode, Landmark, ArrowLeft } from 'lucide-react';
import { getRentalByIdApi, submitTransferApi } from '../../api/rentals';
import { useToast } from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';
import type { Rental } from '../../types';

const BANK_INFO = {
  bankCode: 'TCB',
  bankName: 'Techcombank',
  accountName: 'TA DUC KHANG',
  accountNumber: '19073286543012',
  accountNumberDisplay: '1907 3286 5430 12',
};

const PaymentPage = () => {
  const { rentalId } = useParams<{ rentalId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: rental, isLoading } = useQuery<Rental>({
    queryKey: ['rental', rentalId],
    queryFn: () => getRentalByIdApi(Number(rentalId)),
    enabled: !!rentalId,
  });

  const transferMutation = useMutation({
    mutationFn: (id: number) => submitTransferApi(id),
    onSuccess: () => {
      showToast(`Đặt xe thành công! Đơn #${rental?.id} đang chờ admin xác nhận.`, 'success');
      navigate('/dashboard/rentals');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Không thể gửi xác nhận chuyển khoản', 'error');
    },
  });

  const qrUrl = useMemo(() => {
    if (!rental?.id || !rental?.totalPrice) return '';
    return `https://img.vietqr.io/image/${BANK_INFO.bankCode}-${BANK_INFO.accountNumber}-compact2.png?amount=${Math.round(
      rental.totalPrice
    )}&addInfo=THUEXE-${rental.id}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;
  }, [rental]);

  if (isLoading) return <LoadingSpinner />;
  if (!rental) return <div className="text-center text-gray-500">Không tìm thấy đơn thuê.</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h1 className="font-heading font-bold text-xl text-navy mb-1">Thanh toán đơn thuê #{rental.id}</h1>
        <p className="text-gray-500 text-sm">
          Xe: {rental.car?.model?.brand?.name} {rental.car?.model?.name} - Biển số {rental.car?.plate}
        </p>
        <p className="text-primary font-bold text-lg mt-2">Tổng tiền: {formatCurrency(rental.totalPrice)}</p>
      </div>

      {rental.paymentMethod === 'BANK_TRANSFER' ? (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-navy">Chuyển khoản ngân hàng</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-4 flex items-center justify-center">
              <img src={qrUrl} alt="QR payment" className="w-56 h-56 object-contain" />
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <p className="flex items-center gap-2"><Landmark className="w-4 h-4 text-primary" /> Ngân hàng: {BANK_INFO.bankName}</p>
              <p>Chủ tài khoản: <strong>{BANK_INFO.accountName}</strong></p>
              <p>Số tài khoản: <strong>{BANK_INFO.accountNumberDisplay}</strong></p>
              <p>Nội dung CK: <strong>THUEXE-{rental.id}</strong></p>
              <p className="text-amber-600">Sau khi chuyển khoản, bấm nút bên dưới để gửi xác nhận cho admin.</p>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => transferMutation.mutate(rental.id)}
              disabled={transferMutation.isPending}
              className="btn-primary min-w-[260px] text-center"
            >
              {transferMutation.isPending ? 'Đang gửi...' : 'Xác nhận chuyển khoản'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-navy">Thanh toán tiền mặt khi nhận xe</h2>
          </div>
          <p className="text-gray-600">
            Đơn của bạn đã được tạo. Đơn sẽ ở trạng thái chờ admin xác nhận. Sau khi admin xác nhận, trạng thái sẽ là:
            <strong> Xác nhận đơn hàng, chưa thanh toán</strong>.
          </p>
          <div className="mt-5">
            <button onClick={() => navigate('/dashboard/rentals')} className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Về lịch sử đơn
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
