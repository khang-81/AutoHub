import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from 'lucide-react';
import { forgotPasswordApi } from '../../api/auth';
import { useToast } from '../../components/ui/Toast';
import { getApiErrorMessage } from '../../utils/helpers';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

type FormData = z.infer<typeof schema>;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await forgotPasswordApi({ email: data.email.trim() });
      if (res.success) {
        showToast(
          res.message ||
            'Nếu email đã đăng ký, kiểm tra hộp thư để lấy mã OTP 6 số.',
          'success'
        );
        navigate(`/reset-password?email=${encodeURIComponent(data.email.trim())}`);
      } else {
        showToast(res.message || 'Không thể gửi yêu cầu', 'error');
      }
    } catch (err: unknown) {
      showToast(
        getApiErrorMessage(
          err,
          'Không gửi được email. Kiểm tra kết nối hoặc cấu hình MAIL trên máy chủ.'
        ),
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-navy via-navy-400 to-navy py-16 px-4 flex-1 flex items-center justify-center">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-gray-300 text-lg font-medium">Khôi phục quyền truy cập tài khoản</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="font-heading font-bold text-2xl text-navy mb-2">Quên mật khẩu</h1>
          <p className="text-sm text-gray-500 mb-6">
            Nhập email đã đăng ký. Hệ thống gửi mã OTP 6 số qua email; sau đó bạn quay lại trang đặt lại mật khẩu
            để nhập mã và mật khẩu mới.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/login" className="text-primary font-semibold hover:underline">
              ← Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
