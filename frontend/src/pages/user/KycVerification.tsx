import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Upload, Loader2, Clock, CheckCircle2, XCircle, Info, ArrowLeft } from 'lucide-react';
import { getMyKycDocumentsApi, uploadKycDocumentApi, kycFileAbsoluteUrl } from '../../api/kyc';
import { isAllowedKycImage, isLikelyKycImageUrl } from '../../utils/kycFile';
import { getProfileApi } from '../../api/users';
import { isKycApproved } from '../../utils/kycStatus';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';

const MAX_KYC_FILE_BYTES = 5 * 1024 * 1024;

const statusInfo = (s: string) => {
  if (s === 'APPROVED')
    return {
      text: 'Đã duyệt',
      className: 'bg-green-100 text-green-800',
      Icon: CheckCircle2,
    };
  if (s === 'REJECTED')
    return {
      text: 'Bị từ chối',
      className: 'bg-red-100 text-red-800',
      Icon: XCircle,
    };
  return {
    text: 'Đang chờ admin duyệt',
    className: 'bg-amber-100 text-amber-800',
    Icon: Clock,
  };
};

const KycVerification = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const kycLayoutState = location.state as { from?: { pathname?: string } } | null;
  const returnPath = kycLayoutState?.from?.pathname;
  const autoRedirectRef = useRef(false);

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
    onSuccess: (_data, vars) => {
      showToast(
        `Đã gửi ${vars.type === 'CCCD' ? 'CCCD' : 'GPLX'}. Hồ sơ đang chờ admin xét duyệt — thường trong vòng 24 giờ làm việc.`,
        'success'
      );
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
    if (file.size > MAX_KYC_FILE_BYTES) {
      showToast('Dung lượng tối đa 5MB.', 'error');
      return;
    }
    if (!isAllowedKycImage(file)) {
      showToast('Chỉ chấp nhận ảnh PNG hoặc JPG', 'error');
      return;
    }
    uploadMutation.mutate({ type, file });
  };

  const kycApproved = isKycApproved(profile, docs);
  const kyc = kycApproved ? 'APPROVED' : profile?.kycStatus || 'NOT_SUBMITTED';
  /** Backend coi thiếu một loại giấy là PENDING; banner phải phân biệt "thiếu file" vs "chờ admin". */
  const hasCccd = docs.some((d) => d.documentType === 'CCCD');
  const hasGplx = docs.some((d) => d.documentType === 'GPLX');
  const bothTypesUploaded = hasCccd && hasGplx;
  /** Tài liệu nào đang chờ duyệt → dùng cho banner chi tiết */
  const pendingDocs = docs.filter((d) => d.status === 'PENDING');

  useEffect(() => {
    if (!returnPath) return;
    if (profileLoading || docsLoading) return;
    if (!kycApproved) return;
    if (autoRedirectRef.current) return;
    autoRedirectRef.current = true;
    showToast('Xác minh GPLX đã được duyệt — quay lại trang trước.', 'success');
    navigate(returnPath, { replace: true });
  }, [returnPath, profileLoading, docsLoading, kycApproved, navigate, showToast]);

  const kycBanner = (() => {
    if (kycApproved)
      return {
        Icon: CheckCircle2,
        title: 'Tài khoản đã xác minh đầy đủ',
        text: 'Bạn có thể thuê hoặc mua xe trên hệ thống.',
        c: 'bg-green-50 border-green-200 text-green-800',
      };
    if (kyc === 'REJECTED')
      return {
        Icon: XCircle,
        title: 'Giấy tờ bị từ chối',
        text: 'Vui lòng tải lên bản rõ nét hơn. Xem ghi chú của admin bên dưới.',
        c: 'bg-red-50 border-red-200 text-red-800',
      };
    if (!bothTypesUploaded)
      return {
        Icon: Info,
        title: 'Chưa đủ giấy tờ',
        text: 'Vui lòng tải đủ CCCD và GPLX (mỗi loại một file) để gửi admin duyệt.',
        c: 'bg-blue-50 border-blue-200 text-blue-900',
      };
    if (kyc === 'PENDING' && pendingDocs.length > 0)
      return {
        Icon: Clock,
        title: 'Đã gửi hồ sơ — đang chờ admin duyệt',
        text: `Có ${pendingDocs.length} giấy tờ đang chờ xét duyệt. Thời gian duyệt thường trong vòng 24 giờ làm việc.`,
        c: 'bg-amber-50 border-amber-200 text-amber-900',
      };
    return {
      Icon: Info,
      title: 'Vui lòng tải CCCD và GPLX',
      text: 'Để thuê hoặc mua xe, tài khoản cần được admin xác minh danh tính.',
      c: 'bg-blue-50 border-blue-200 text-blue-900',
    };
  })();

  if (profileLoading || docsLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {returnPath && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(returnPath, { replace: true })}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang trước
          </button>
          <Link
            to={returnPath}
            replace
            className="text-xs text-primary font-medium hover:underline"
          >
            Mở trang xe
          </Link>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="font-heading font-bold text-xl text-navy">Xác minh GPLX</h1>
        </div>
        <p className="text-gray-500 text-sm">
          Tải ảnh CCCD và GPLX (PNG/JPG). Hồ sơ sẽ được admin xét duyệt thủ công trong vòng 24 giờ làm việc.
        </p>
        <div className={`mt-4 rounded-xl border px-4 py-3 text-sm flex items-start gap-3 ${kycBanner.c}`}>
          <kycBanner.Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{kycBanner.title}</p>
            <p className="mt-0.5 opacity-90">{kycBanner.text}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['CCCD', 'GPLX'] as const).map((type) => {
          const doc = docs.find((d) => d.documentType === type);
          const st = doc
            ? statusInfo(doc.status)
            : { text: 'Chưa nộp', className: 'bg-gray-100 text-gray-600', Icon: Info };
          const StatusIcon = st.Icon;
          return (
            <div key={type} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-navy">{type === 'CCCD' ? 'CCCD / Căn cước' : 'GPLX'}</h2>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1 ${st.className}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {st.text}
                </span>
              </div>
              {doc?.fileUrl && (
                <a
                  href={kycFileAbsoluteUrl(doc.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="block mb-4 rounded-lg overflow-hidden border bg-gray-50 max-h-48"
                >
                  {isLikelyKycImageUrl(doc.fileUrl) ? (
                    <img
                      src={kycFileAbsoluteUrl(doc.fileUrl)}
                      alt={type}
                      className="w-full h-full object-contain max-h-48"
                    />
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">Bấm để mở file</div>
                  )}
                </a>
              )}
              {doc?.adminNote && doc.status === 'REJECTED' && (
                <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  <span className="font-medium">Ghi chú admin:</span> {doc.adminNote}
                </div>
              )}
              {doc?.status === 'APPROVED' ? (
                <p className="text-sm text-green-700 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Giấy tờ đã được admin duyệt — không cần tải lại.
                </p>
              ) : doc?.status === 'PENDING' ? (
                <div className="space-y-2">
                  <p className="text-sm text-amber-700 inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Đã gửi, đang chờ admin xét duyệt. Có thể tải lại nếu cần sửa ảnh.
                  </p>
                  <label className="text-xs inline-flex items-center gap-1 text-primary hover:underline cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Tải lại ảnh khác
                    <input type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={onPickFile(type)} />
                  </label>
                </div>
              ) : (
                <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
                  {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {doc ? 'Tải lại' : 'Tải lên'}
                  <input type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={onPickFile(type)} />
                </label>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        <p className="font-medium mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          Quy trình xét duyệt
        </p>
        <ol className="list-decimal list-inside space-y-1 text-blue-800">
          <li>Bạn tải lên ảnh CCCD và GPLX (mỗi loại một ảnh rõ nét).</li>
          <li>Hệ thống lưu hồ sơ với trạng thái "Chờ admin duyệt".</li>
          <li>Admin kiểm tra thủ công và phản hồi trong vòng 24 giờ làm việc.</li>
          <li>Bạn nhận email thông báo kết quả. Sau khi duyệt, bạn có thể thuê hoặc mua xe.</li>
        </ol>
      </div>
    </div>
  );
};

export default KycVerification;
