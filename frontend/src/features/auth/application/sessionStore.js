const key = 'campus.auth.v1';

export function createSessionStore(storage) {
  let current = null;
  const listeners = new Set();
  try {
    const saved = JSON.parse(storage?.getItem(key) || 'null');
    if (typeof saved?.access === 'string' && typeof saved?.refresh === 'string' && saved?.user) current = saved;
  } catch { /* Missing or invalid storage starts a signed-out session. */ }
  return {
    get: () => current,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    set(session) {
      current = session;
      try {
        if (session) storage?.setItem(key, JSON.stringify(session));
        else storage?.removeItem(key);
      } catch { /* The current tab can still sign in if browser storage is disabled. */ }
      listeners.forEach((listener) => listener());
    },
  };
}
