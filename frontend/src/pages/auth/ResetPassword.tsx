import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car, Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react';
import { resetPasswordApi } from '../../api/auth';
import { useToast } from '../../components/ui/Toast';

const schema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    otp: z
      .string()
      .length(6, 'Mã OTP gồm đúng 6 chữ số')
      .regex(/^\d{6}$/, 'Chỉ được nhập số'),
    newPassword: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get('email')?.trim() ?? '';
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: emailFromQuery },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await resetPasswordApi({
        email: data.email.trim(),
        otp: data.otp.trim(),
        newPassword: data.newPassword,
      });
      if (res.success) {
        showToast(res.message || 'Đặt lại mật khẩu thành công!', 'success');
        navigate('/login');
      } else {
        showToast(res.message || 'Không thể đặt lại mật khẩu', 'error');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(
        error?.response?.data?.message || 'Email hoặc mã OTP không đúng, hoặc mã đã hết hạn',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-400 to-navy flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="bg-primary rounded-xl p-3">
              <Car className="w-7 h-7 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl text-white">
              Auto<span className="text-primary">Hub</span>
            </span>
          </Link>
          <p className="text-gray-400 mt-2">Xác thực OTP và đặt mật khẩu mới</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="font-heading font-bold text-2xl text-navy mb-2">Đặt lại mật khẩu</h1>
          <p className="text-sm text-gray-500 mb-6">
            Nhập email đã nhận OTP, mã 6 số từ email và mật khẩu mới.
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mã OTP (6 số)</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('otp')}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  className="input-field pl-10 tracking-[0.35em] font-mono text-lg"
                />
              </div>
              {errors.otp && (
                <p className="text-red-500 text-xs mt-1">{errors.otp.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('newPassword')}
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Ít nhất 6 ký tự"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
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
              {loading ? 'Đang cập nhật...' : 'Xác nhận đặt lại mật khẩu'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/forgot-password" className="text-primary font-semibold hover:underline">
              Gửi lại mã OTP
            </Link>
            <span className="mx-2 text-gray-300">·</span>
            <Link to="/login" className="text-navy/70 hover:text-primary">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
