import { isJwtExpired } from './helpers';

export const ADMIN_TOKEN_KEY = 'autohub_admin_token';
export const ADMIN_USER_KEY = 'autohub_admin_user';

export function hasValidAdminSession(): boolean {
  try {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY)?.trim();
    return Boolean(token && !isJwtExpired(token));
  } catch {
    return false;
  }
}

export function clearAdminSession(): void {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  } catch {
    /* ignore */
  }
}

export function saveAdminSession(token: string, userId: number, email: string, roles: string[]): void {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify({ id: userId, email, roles }));
  } catch {
    /* ignore */
  }
}
