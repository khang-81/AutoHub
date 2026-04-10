import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Save, UserCheck } from 'lucide-react';
import { getAllCustomersApi, addCustomerApi, updateCustomerApi } from '../../api/customers';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Customer } from '../../types';

const schema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập họ'),
  lastName: z.string().min(1, 'Vui lòng nhập tên'),
  birthdate: z.string().min(1, 'Vui lòng nhập ngày sinh'),
  internationalId: z.string().min(1, 'Vui lòng nhập CCCD/Passport'),
  licenceIssueDate: z.string().min(1, 'Vui lòng nhập ngày cấp GPLX'),
});

type FormData = z.infer<typeof schema>;

const Profile = () => {
  const { userId, email } = useAuthStore();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: getAllCustomersApi,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const existingCustomer = useMemo(() => {
    if (!userId) return null;
    return customers.find((c) => c.userId === userId) ?? null;
  }, [customers, userId]);

  useEffect(() => {
    if (!existingCustomer) return;
    reset({
      firstName: existingCustomer.firstName,
      lastName: existingCustomer.lastName,
      birthdate: existingCustomer.birthdate?.slice(0, 10) || '',
      internationalId: existingCustomer.internationalId || '',
      licenceIssueDate: existingCustomer.licenceIssueDate?.slice(0, 10) || '',
    });
  }, [existingCustomer, reset]);

  const addMutation = useMutation({
    mutationFn: addCustomerApi,
    onSuccess: () => {
      showToast('Đã tạo hồ sơ thành công!', 'success');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: () => showToast('Có lỗi khi tạo hồ sơ', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: updateCustomerApi,
    onSuccess: () => {
      showToast('Cập nhật hồ sơ thành công!', 'success');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: () => showToast('Có lỗi khi cập nhật', 'error'),
  });

  const onSubmit = (data: FormData) => {
    if (existingCustomer) {
      updateMutation.mutate({ ...data, id: existingCustomer.id, userId: userId! });
    } else {
      addMutation.mutate({ ...data, userId: userId! });
    }
  };

  const isSaving = addMutation.isPending || updateMutation.isPending;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Account info */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="font-heading font-bold text-xl text-navy">{email}</p>
            <span className="badge bg-primary/10 text-primary text-xs">Khách hàng</span>
          </div>
        </div>
      </div>

      {/* Personal info form */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserCheck className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-navy text-lg">
            {existingCustomer ? 'Cập nhật hồ sơ' : 'Tạo hồ sơ cá nhân'}
          </h2>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Thông tin này dùng để xác minh danh tính khi thuê xe.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ *</label>
              <input {...register('firstName')} className="input-field" placeholder="Nguyễn" />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên *</label>
              <input {...register('lastName')} className="input-field" placeholder="Văn An" />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
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
            {isSaving ? 'Đang lưu...' : existingCustomer ? 'Cập nhật' : 'Tạo hồ sơ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
