import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState } from '../types';

/**
 * Auth state cho người dùng cuối (Khách hàng).
 * Token được lưu trong storage qua middleware persist (key autohub_auth.state.token).
 *
 * LƯU Ý: cũng giữ song song `localStorage.autohub_token` cho:
 *  - axiosInstance (đọc trực tiếp khỏi cần subscribe store).
 *  - Các util không nằm trong React tree (gemini.ts, helpers).
 *  Thay đổi token CHỈ qua login()/logout() để tránh drift.
 */
export const TOKEN_STORAGE_KEY = 'autohub_token';
export const ADMIN_TOKEN_KEY = 'autohub_admin_token';
export const ADMIN_USER_KEY = 'autohub_admin_user';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      email: null,
      roles: [],
      isAuthenticated: false,
      isAdmin: false,

      login: (token: string, userId: number, email: string, roles: string[]) => {
        try {
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } catch {
          /* storage có thể bị block (private mode) — chấp nhận */
        }
        set({
          token,
          userId,
          email,
          roles,
          isAuthenticated: true,
          isAdmin: roles.some((r) => r.toLowerCase().includes('admin')),
        });
      },

      logout: () => {
        try {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          localStorage.removeItem(ADMIN_USER_KEY);
        } catch {
          /* ignore */
        }
        set({
          token: null,
          userId: null,
          email: null,
          roles: [],
          isAuthenticated: false,
          isAdmin: false,
        });
      },

      /** Đăng nhập admin: lưu token admin riêng và đồng bộ Zustand để Navbar hiển thị đúng. */
      loginAsAdmin: (token: string, userId: number, email: string, roles: string[]) => {
        try {
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
          localStorage.setItem(ADMIN_TOKEN_KEY, token);
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify({ id: userId, email, roles }));
        } catch {
          /* storage có thể bị block */
        }
        set({
          token,
          userId,
          email,
          roles,
          isAuthenticated: true,
          isAdmin: roles.some((r) => r.toLowerCase().includes('admin')),
        });
      },
    }),
    {
      name: 'autohub_auth',
    }
  )
);
