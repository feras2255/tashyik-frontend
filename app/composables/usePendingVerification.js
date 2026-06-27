const STORAGE_KEY = 'tashyik_pending_verification';

export function usePendingVerification() {
  function read() {
    if (!import.meta.client) {
      return null;
    }

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);

      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function write(payload) {
    if (!import.meta.client) {
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function clear() {
    if (!import.meta.client) {
      return;
    }

    sessionStorage.removeItem(STORAGE_KEY);
  }

  return { read, write, clear };
}
