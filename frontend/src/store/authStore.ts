import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState } from '../types';

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
        localStorage.setItem('autohub_token', token);
        set({
          token,
          userId,
          email,
          roles,
          isAuthenticated: true,
          isAdmin: roles.some((r) =>
            r.toLowerCase().includes('admin')
          ),
        });
      },

      logout: () => {
        localStorage.removeItem('autohub_token');
        set({
          token: null,
          userId: null,
          email: null,
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
