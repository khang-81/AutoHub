import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

/** Chờ zustand persist đọc xong localStorage trước khi kiểm tra đăng nhập. */
export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  return hydrated;
}
