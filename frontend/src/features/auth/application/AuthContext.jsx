import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ gateway, store, children }) {
  const session = useSyncExternalStore(store.subscribe, store.get, store.get);
  const [loading, setLoading] = useState(Boolean(store.get()));
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const authRevision = useRef(0);
  useEffect(() => {
    let active = true;
    if (!store.get()) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    gateway.me().then(({ user }) => {
      if (active && store.get()) store.set({ ...store.get(), user });
    }).catch((failure) => {
      if (!active) return;
      if (failure.status === 401) store.set(null);
      else setError(failure);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [gateway, store, revision]);

  const clearSession = useCallback(() => { authRevision.current++; store.set(null); }, [store]);
  async function login(credentials) {
    const revision = ++authRevision.current;
    const result = await gateway.login(credentials);
    if (revision !== authRevision.current) return null;
    store.set({ access: result.access, refresh: result.refresh, user: result.user });
    setError(null);
    return result.user;
  }
  async function logout() {
    authRevision.current++;
    const refresh = store.get()?.refresh;
    // Issue revocation before clearing; the request interceptor needs the access token.
    try { if (refresh) await gateway.logout(refresh); }
    finally { clearSession(); }
  }
  async function changePassword(values) {
    const revision = authRevision.current;
    const result = await gateway.changePassword(values);
    if (revision !== authRevision.current) return;
    store.set({ access: result.access, refresh: result.refresh, user: result.user });
  }
  return <AuthContext.Provider value={{ user: session?.user, role: session?.user?.role,
    tokens: session ? { access: session.access, refresh: session.refresh } : null,
    loading, error, login, logout, changePassword, clearSession, retry: () => setRevision((value) => value + 1) }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requires AuthProvider.');
  return context;
}
