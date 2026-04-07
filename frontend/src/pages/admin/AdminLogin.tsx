import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car, Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, FlaskConical } from 'lucide-react';
import { loginApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type FormData = z.infer<typeof schema>;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Demo login for testing (no backend needed)
  const handleDemoAdmin = () => {
    login('demo-token-admin', 1, 'admin@autohub.com', ['ROLE_ADMIN']);
    navigate('/admin');
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError('');
      const res = await loginApi(data);
      const roles: string[] = res.roles || [];

      const isAdmin = roles.some((r) => r.toLowerCase().includes('admin'));
      if (!isAdmin) {
        setError('Tài khoản này không có quyền truy cập trang quản trị.');
        return;
      }

      login(res.token, res.userId, res.email, roles);
      navigate('/admin');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Email hoặc mật khẩu không đúng.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="bg-primary rounded-xl p-3 shadow-lg shadow-primary/30">
              <Car className="w-8 h-8 text-white" />
            </div>
            <span className="font-heading font-bold text-3xl text-white">
              Auto<span className="text-primary">Hub</span>
            </span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <p className="text-gray-400 text-sm font-medium tracking-wider uppercase">
              Cổng quản trị
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">Đăng nhập Admin</h1>
          <p className="text-gray-400 text-sm mb-6">
            Chỉ dành cho quản trị viên hệ thống
          </p>

          {/* Error alert */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@autohub.com"
                  className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-white/10 focus:border-primary/50 focus:ring-primary/20'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border rounded-xl pl-10 pr-11 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-white/10 focus:border-primary/50 focus:ring-primary/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          {/* Demo account */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Tài khoản Demo (Test)</span>
            </div>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">A</div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-primary">Admin Demo</p>
                  <p className="text-xs text-gray-400">admin@autohub.com</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 group-hover:text-primary font-medium transition-colors">Đăng nhập →</span>
            </button>
          </div>

          {/* Back link */}
          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <Link
              to="/"
              className="text-gray-400 hover:text-primary text-sm transition-colors"
            >
              ← Quay về trang chủ
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2025 AutoHub. Hệ thống quản trị nội bộ.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
