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
  bankName: 'MB Bank',
  accountName: 'AUTOHUB RENTAL',
  accountNumber: '123456789',
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
      showToast('Da ghi nhan thong tin chuyen khoan. Vui long cho admin xac nhan.', 'success');
      navigate('/dashboard/rentals');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Khong the gui xac nhan chuyen khoan', 'error');
    },
  });

  const qrUrl = useMemo(() => {
    if (!rental?.id || !rental?.totalPrice) return '';
    return `https://img.vietqr.io/image/MB-${BANK_INFO.accountNumber}-compact2.png?amount=${Math.round(
      rental.totalPrice
    )}&addInfo=THUEXE-${rental.id}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;
  }, [rental]);

  if (isLoading) return <LoadingSpinner />;
  if (!rental) return <div className="text-center text-gray-500">Khong tim thay don thue.</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h1 className="font-heading font-bold text-xl text-navy mb-1">Thanh toan don thue #{rental.id}</h1>
        <p className="text-gray-500 text-sm">
          Xe: {rental.car?.model?.brand?.name} {rental.car?.model?.name} - Bien so {rental.car?.plate}
        </p>
        <p className="text-primary font-bold text-lg mt-2">Tong tien: {formatCurrency(rental.totalPrice)}</p>
      </div>

      {rental.paymentMethod === 'BANK_TRANSFER' ? (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-navy">Chuyen khoan ngan hang</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-4 flex items-center justify-center">
              <img src={qrUrl} alt="QR payment" className="w-56 h-56 object-contain" />
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <p className="flex items-center gap-2"><Landmark className="w-4 h-4 text-primary" /> Ngan hang: {BANK_INFO.bankName}</p>
              <p>Chu tai khoan: <strong>{BANK_INFO.accountName}</strong></p>
              <p>So tai khoan: <strong>{BANK_INFO.accountNumber}</strong></p>
              <p>Noi dung CK: <strong>THUEXE-{rental.id}</strong></p>
              <p className="text-amber-600">Sau khi chuyen khoan, bam nut ben duoi de gui xac nhan cho admin.</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => transferMutation.mutate(rental.id)}
              disabled={transferMutation.isPending}
              className="btn-primary"
            >
              {transferMutation.isPending ? 'Dang gui...' : 'Toi da chuyen khoan'}
            </button>
            <button onClick={() => navigate('/dashboard/rentals')} className="btn-outline">
              Ve lich su don
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-navy">Thanh toan tien mat khi nhan xe</h2>
          </div>
          <p className="text-gray-600">
            Don cua ban da duoc tao. Don se o trang thai cho admin xac nhan. Sau khi admin xac nhan, trang thai se la:
            <strong> Xac nhan don hang, chua thanh toan</strong>.
          </p>
          <div className="mt-5">
            <button onClick={() => navigate('/dashboard/rentals')} className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Ve lich su don
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
