import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

const schema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const ChangePassword = () => {
  const { showToast } = useToast();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (_data: FormData) => {
    setLoading(true);
    try {
      // TODO: Call change password API when backend supports it
      await new Promise((r) => setTimeout(r, 1000));
      showToast('Đổi mật khẩu thành công!', 'success');
      reset();
    } catch {
      showToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      label: 'Mật khẩu hiện tại',
      name: 'currentPassword' as const,
      show: showCurrent,
      toggle: () => setShowCurrent(!showCurrent),
      placeholder: '••••••••',
      error: errors.currentPassword,
    },
    {
      label: 'Mật khẩu mới',
      name: 'newPassword' as const,
      show: showNew,
      toggle: () => setShowNew(!showNew),
      placeholder: 'Ít nhất 6 ký tự',
      error: errors.newPassword,
    },
    {
      label: 'Xác nhận mật khẩu mới',
      name: 'confirmPassword' as const,
      show: showConfirm,
      toggle: () => setShowConfirm(!showConfirm),
      placeholder: '••••••••',
      error: errors.confirmPassword,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="font-heading font-bold text-xl text-navy">Đổi mật khẩu</h1>
        </div>
        <p className="text-gray-400 text-sm">Cập nhật mật khẩu để bảo mật tài khoản của bạn.</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {/* Security tips */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <p className="text-blue-700 font-medium text-sm mb-2">💡 Lưu ý bảo mật:</p>
          <ul className="text-blue-600 text-xs space-y-1 list-disc list-inside">
            <li>Mật khẩu phải có ít nhất 6 ký tự</li>
            <li>Không dùng mật khẩu dễ đoán như ngày sinh, 123456</li>
            <li>Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register(field.name)}
                  type={field.show ? 'text' : 'password'}
                  placeholder={field.placeholder}
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={field.toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {field.show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {field.error && (
                <p className="text-red-500 text-xs mt-1">{field.error.message}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
