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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      email: null,
      fullName: null,
      roles: [],
      isAuthenticated: false,
      isAdmin: false,

      login: (token: string, userId: number, email: string, roles: string[], fullName?: string | null) => {
        try {
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } catch {
          /* storage có thể bị block (private mode) — chấp nhận */
        }
        set({
          token,
          userId,
          email,
          fullName: fullName?.trim() || null,
          roles,
          isAuthenticated: true,
          isAdmin: roles.some((r) => r.toLowerCase().includes('admin')),
        });
      },

      setFullName: (fullName: string | null) => {
        set({ fullName: fullName?.trim() || null });
      },

      logout: () => {
        try {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem('autohub_admin_token');
          localStorage.removeItem('autohub_admin_user');
        } catch {
          /* ignore */
        }
        set({
          token: null,
          userId: null,
          email: null,
          fullName: null,
          roles: [],
          isAuthenticated: false,
          isAdmin: false,
        });
      },
    }),
    {
      name: 'autohub_auth',
    }
  )
);
