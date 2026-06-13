import { useAuthStore, TOKEN_STORAGE_KEY } from '../store/authStore';

const ZUSTAND_PERSIST_KEY = 'autohub_auth';
const ADMIN_TOKEN_KEY = 'autohub_admin_token';

/** Đọc token user từ blob persist của zustand (autohub_auth). */
export function readPersistedUserToken(): string | null {
  try {
    const raw = localStorage.getItem(ZUSTAND_PERSIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    const t = parsed?.state?.token;
    return typeof t === 'string' && t.trim() ? t.trim() : null;
  } catch {
    return null;
  }
}

/** Token user: store → localStorage.autohub_token → persist blob. */
export function resolveUserAuthToken(): string | null {
  const fromStore = useAuthStore.getState().token;
  if (fromStore?.trim()) return fromStore.trim();
  try {
    const direct = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (direct?.trim()) return direct.trim();
  } catch {
    /* storage blocked */
  }
  return readPersistedUserToken();
}

export function syncUserAuthTokenToStorage(token: string | null): void {
  try {
    if (token?.trim()) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** Token gửi kèm request API theo ngữ cảnh trang (user vs admin). */
export function resolveAuthTokenForRequest(pathname?: string): string | null {
  const path =
    pathname ?? (typeof window !== 'undefined' ? window.location?.pathname ?? '' : '');
  const isAdminApp = path.startsWith('/admin') && path !== '/admin/login';
  if (isAdminApp) {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    } catch {
      return null;
    }
  }
  return resolveUserAuthToken();
}
