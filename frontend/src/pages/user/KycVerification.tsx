import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Upload, Loader2 } from 'lucide-react';
import { getMyKycDocumentsApi, uploadKycDocumentApi, kycFileAbsoluteUrl } from '../../api/kyc';
import { getProfileApi } from '../../api/users';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';

const statusLabel = (s: string) => {
  if (s === 'APPROVED') return { text: 'Đã duyệt', className: 'bg-green-100 text-green-800' };
  if (s === 'REJECTED') return { text: 'Từ chối', className: 'bg-red-100 text-red-800' };
  return { text: 'Chờ duyệt', className: 'bg-amber-100 text-amber-800' };
};

const KycVerification = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfileApi,
  });

  const { data: docs = [], isLoading: docsLoading } = useQuery({
    queryKey: ['kycMy'],
    queryFn: getMyKycDocumentsApi,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ type, file }: { type: 'CCCD' | 'GPLX'; file: File }) =>
      uploadKycDocumentApi(type, file),
    onSuccess: () => {
      showToast('Đã tải lên. Vui lòng chờ admin duyệt.', 'success');
      queryClient.invalidateQueries({ queryKey: ['kycMy'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Không thể tải file', 'error');
    },
  });

  const onPickFile = (type: 'CCCD' | 'GPLX') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      showToast('Chỉ chấp nhận ảnh hoặc PDF', 'error');
      return;
    }
    uploadMutation.mutate({ type, file });
  };

  const kyc = profile?.kycStatus || 'NOT_SUBMITTED';
  const kycBanner =
    kyc === 'APPROVED'
      ? { text: 'Tài khoản đã xác minh đầy đủ. Bạn có thể đặt xe.', c: 'bg-green-50 border-green-200 text-green-800' }
      : kyc === 'REJECTED'
        ? {
            text: 'Giấy tờ bị từ chối. Vui lòng tải lên bản rõ nét hơn.',
            c: 'bg-red-50 border-red-200 text-red-800',
          }
        : kyc === 'PENDING'
          ? { text: 'Đang chờ admin duyệt.', c: 'bg-amber-50 border-amber-200 text-amber-900' }
          : { text: 'Vui lòng tải CCCD và GPLX để đặt xe.', c: 'bg-blue-50 border-blue-200 text-blue-900' };

  if (profileLoading || docsLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="font-heading font-bold text-xl text-navy">Xác minh danh tính (KYC)</h1>
        </div>
        <p className="text-gray-500 text-sm">
          Tải ảnh CCCD và GPLX. Sau khi admin duyệt, bạn có thể đặt xe.
        </p>
        <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${kycBanner.c}`}>{kycBanner.text}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['CCCD', 'GPLX'] as const).map((type) => {
          const doc = docs.find((d) => d.documentType === type);
          const st = doc ? statusLabel(doc.status) : { text: 'Chưa nộp', className: 'bg-gray-100 text-gray-600' };
          return (
            <div key={type} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-navy">{type === 'CCCD' ? 'CCCD / Căn cước' : 'GPLX'}</h2>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${st.className}`}>{st.text}</span>
              </div>
              {doc?.fileUrl && (
                <a
                  href={kycFileAbsoluteUrl(doc.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="block mb-4 rounded-lg overflow-hidden border bg-gray-50 max-h-48"
                >
                  {doc.fileUrl.toLowerCase().endsWith('.pdf') ? (
                    <div className="p-8 text-center text-gray-500 text-sm">File PDF — bấm để mở</div>
                  ) : (
                    <img
                      src={kycFileAbsoluteUrl(doc.fileUrl)}
                      alt={type}
                      className="w-full h-full object-contain max-h-48"
                    />
                  )}
                </a>
              )}
              {doc?.adminNote && doc.status === 'REJECTED' && (
                <p className="text-sm text-red-600 mb-3">Ghi chú: {doc.adminNote}</p>
              )}
              <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
                {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {doc ? 'Tải lại' : 'Tải lên'}
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={onPickFile(type)} />
              </label>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
        <p className="font-medium text-navy mb-2">Lưu ý</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Ảnh rõ nét, đủ 4 góc giấy tờ.</li>
          <li>Dung lượng tối đa 5MB.</li>
          <li>Thông tin được mã hóa và chỉ dùng để xác minh thuê xe.</li>
        </ul>
      </div>
    </div>
  );
};

export default KycVerification;
