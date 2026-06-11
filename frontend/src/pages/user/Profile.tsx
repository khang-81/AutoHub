import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Save, UserCheck, Phone, Calendar, Mail } from 'lucide-react';
import { getMyCustomerApi, addCustomerApi, updateCustomerApi } from '../../api/customers';
import { getProfileApi } from '../../api/users';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const schema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập họ'),
  lastName: z.string().min(1, 'Vui lòng nhập tên'),
  birthdate: z.string().min(1, 'Vui lòng nhập ngày sinh'),
  internationalId: z.string().min(1, 'Vui lòng nhập CCCD/Passport'),
  licenceIssueDate: z.string().min(1, 'Vui lòng nhập ngày cấp GPLX'),
});

type FormData = z.infer<typeof schema>;

/** Họ = từ đầu; tên + đệm = phần còn lại — khớp backend CustomerManager.splitFullName. */
function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const sp = trimmed.indexOf(' ');
  if (sp < 0) return { firstName: trimmed, lastName: trimmed };
  return {
    firstName: trimmed.slice(sp + 1).trim(),
    lastName: trimmed.slice(0, sp).trim(),
  };
}

function formatDisplayDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = iso.slice(0, 10);
  const [y, m, day] = d.split('-');
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
}

const Profile = () => {
  const { userId, email } = useAuthStore();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: accountProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfileApi,
  });

  const { data: existingCustomer, isLoading: customerLoading } = useQuery({
    queryKey: ['customer', 'me'],
    queryFn: getMyCustomerApi,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const fromAccount = accountProfile?.fullName?.trim()
      ? splitFullName(accountProfile.fullName)
      : null;

    if (existingCustomer) {
      reset({
        firstName: fromAccount?.firstName || existingCustomer.firstName || '',
        lastName: fromAccount?.lastName || existingCustomer.lastName || '',
        birthdate:
          existingCustomer.birthdate?.slice(0, 10) ||
          accountProfile?.birthDate?.slice(0, 10) ||
          '',
        internationalId: existingCustomer.internationalId || '',
        licenceIssueDate: existingCustomer.licenceIssueDate?.slice(0, 10) || '',
      });
      return;
    }

    if (fromAccount) {
      reset({
        firstName: fromAccount.firstName,
        lastName: fromAccount.lastName,
        birthdate: accountProfile?.birthDate?.slice(0, 10) || '',
        internationalId: '',
        licenceIssueDate: '',
      });
    }
  }, [existingCustomer, accountProfile, reset]);

  const addMutation = useMutation({
    mutationFn: addCustomerApi,
    onSuccess: () => {
      showToast('Đã tạo hồ sơ thành công!', 'success');
      queryClient.invalidateQueries({ queryKey: ['customer', 'me'] });
    },
    onError: () => showToast('Có lỗi khi tạo hồ sơ', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: updateCustomerApi,
    onSuccess: () => {
      showToast('Cập nhật hồ sơ thành công!', 'success');
      queryClient.invalidateQueries({ queryKey: ['customer', 'me'] });
    },
    onError: () => showToast('Có lỗi khi cập nhật', 'error'),
  });

  const onSubmit = (data: FormData) => {
    if (!userId) {
      showToast('Phiên đăng nhập đã hết hạn', 'error');
      return;
    }
    if (existingCustomer) {
      updateMutation.mutate({ ...data, id: existingCustomer.id, userId });
    } else {
      addMutation.mutate({ ...data, userId });
    }
  };

  const isSaving = addMutation.isPending || updateMutation.isPending;
  const displayName = accountProfile?.fullName?.trim() || email || '';
  const needsKycFields =
    !existingCustomer?.internationalId || !existingCustomer?.licenceIssueDate;

  if (profileLoading || customerLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-heading font-bold text-xl text-navy truncate">{displayName}</p>
            <span className="badge bg-primary/10 text-primary text-xs">Khách hàng</span>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <dt className="text-gray-400 text-xs">Email</dt>
              <dd className="text-navy font-medium break-all">{accountProfile?.email || email}</dd>
            </div>
          </div>
          {accountProfile?.phone && (
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-gray-400 text-xs">Số điện thoại</dt>
                <dd className="text-navy font-medium">{accountProfile.phone}</dd>
              </div>
            </div>
          )}
          {accountProfile?.birthDate && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-gray-400 text-xs">Ngày sinh</dt>
                <dd className="text-navy font-medium">{formatDisplayDate(accountProfile.birthDate)}</dd>
              </div>
            </div>
          )}
        </dl>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserCheck className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-navy text-lg">
            {existingCustomer && !needsKycFields ? 'Cập nhật hồ sơ' : 'Hoàn tất hồ sơ thuê xe'}
          </h2>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          {needsKycFields
            ? 'Thông tin họ tên và ngày sinh đã được điền từ đăng ký. Vui lòng bổ sung CCCD và ngày cấp GPLX để xác minh khi thuê xe.'
            : 'Thông tin này dùng để xác minh danh tính khi thuê xe.'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ *</label>
              <input {...register('lastName')} className="input-field" placeholder="Nguyễn" />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên *</label>
              <input {...register('firstName')} className="input-field" placeholder="Văn An" />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh *</label>
            <input {...register('birthdate')} type="date" className="input-field" />
            {errors.birthdate && <p className="text-red-500 text-xs mt-1">{errors.birthdate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số CCCD / Hộ chiếu *</label>
            <input {...register('internationalId')} className="input-field" placeholder="012345678901" />
            {errors.internationalId && <p className="text-red-500 text-xs mt-1">{errors.internationalId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày cấp GPLX *</label>
            <input {...register('licenceIssueDate')} type="date" className="input-field" />
            {errors.licenceIssueDate && <p className="text-red-500 text-xs mt-1">{errors.licenceIssueDate.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Đang lưu...' : existingCustomer ? 'Cập nhật' : 'Lưu hồ sơ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
