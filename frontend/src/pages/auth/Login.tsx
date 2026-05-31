import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { loginApi } from '../../api/auth';
import { getUserRolesApi } from '../../api/users';
import { useAuthStore } from '../../store/authStore';
import { getUserIdFromToken, getEmailFromToken, getApiErrorMessage, getRoleFromToken } from '../../utils/helpers';
import { useToast } from '../../components/ui/Toast';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type FormData = z.infer<typeof schema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { showToast } = useToast();

  const loginRedirectState = location.state as { from?: { pathname?: string } } | null;
  const fromPath = loginRedirectState?.from?.pathname;
  const redirectAfterLogin =
    fromPath && fromPath !== '/login' ? fromPath : '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await loginApi({ ...data, portal: 'USER' });
      if (res.success) {
        const token = res.loginResponse?.token || res.data || res.token;
        if (!token) {
          showToast('Không nhận được token từ server', 'error');
          return;
        }
        const userId = getUserIdFromToken(token) ?? 0;
        const email = getEmailFromToken(token) ?? data.email;

        const rolesFromLogin = res.loginResponse?.roles;
        let roles: string[] = Array.isArray(rolesFromLogin)
          ? rolesFromLogin.map((r) => String(r).trim()).filter(Boolean)
          : [];

        localStorage.setItem('autohub_token', token);

        if (roles.length === 0 && userId) {
          try {
            roles = (await getUserRolesApi(userId)).map((r) => r.name);
          } catch {
            roles = getRoleFromToken(token);
            if (roles.length === 0) {
              showToast('Đã đăng nhập nhưng không tải được danh sách vai trò. Bạn vẫn có thể dùng trang.', 'error');
            }
          }
        }

        const isAdminAccount = roles.some((r: string) => r.toLowerCase().includes('admin'));
        if (isAdminAccount) {
          localStorage.removeItem('autohub_token');
          showToast(
            'Tài khoản quản trị không thể đăng nhập tại đây. Vui lòng dùng trang /admin/login.',
            'error'
          );
          return;
        }

        login(token, userId, email, roles);
        localStorage.removeItem('autohub_admin_token');
        localStorage.removeItem('autohub_admin_user');
        showToast('Đăng nhập thành công!', 'success');
        navigate(redirectAfterLogin);
      } else {
        showToast(res.message || 'Đăng nhập thất bại', 'error');
      }
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err, 'Email hoặc mật khẩu không đúng'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-navy via-navy-400 to-navy py-16 px-4 flex-1 flex items-center justify-center">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-gray-300 text-lg font-medium">Chào mừng trở lại!</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="font-heading font-bold text-2xl text-navy mb-6">Đăng nhập</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
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
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 pt-2 border-t border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
            <p className="text-gray-600 text-center sm:text-left">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
            <Link
              to="/forgot-password"
              className="text-center sm:text-right text-navy/80 font-medium hover:text-primary transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;

