import axios from 'axios';

export function createHttpClient(sessionStore, adapter) {
  const config = { baseURL: import.meta.env.VITE_API_BASE_URL || '/api/', timeout: 15000,
    headers: { Accept: 'application/json' }, ...(adapter ? { adapter } : {}) };
  const http = axios.create(config);
  const refreshHttp = axios.create(config);
  let refreshing;

  http.interceptors.request.use((request) => {
    const token = sessionStore?.get()?.access;
    if (token && !request.skipAuth) request.headers.Authorization = `Bearer ${token}`;
    return request;
  });

  http.interceptors.response.use((response) => response, async (error) => {
    const request = error.config;
    const session = sessionStore?.get();
    if (error.response?.status === 403 && error.response?.data?.code === 'password_change_required' && session) {
      sessionStore.set({ ...session, user: { ...session.user, must_change_password: true } });
    }
    if (error.response?.status !== 401 || !request || request.skipAuth || request._retry || !session?.refresh) throw error;
    request._retry = true;
    // A concurrent response may arrive after another request already refreshed.
    if (request.headers.Authorization === `Bearer ${session.access}`) {
      if (!refreshing) {
        const originalRefresh = session.refresh;
        refreshing = refreshHttp.post('auth/refresh/', { refresh: originalRefresh }).then(({ data }) => {
          if (sessionStore.get()?.refresh !== originalRefresh) throw new Error('The session changed.');
          sessionStore.set({ access: data.access, refresh: data.refresh, user: data.user });
        }).catch((failure) => {
          if (sessionStore.get()?.refresh === originalRefresh && [400, 401, 403].includes(failure.response?.status)) sessionStore.set(null);
          throw failure;
        }).finally(() => { refreshing = null; });
      }
      await refreshing;
    }
    if (!sessionStore.get()) throw error;
    request.headers.Authorization = `Bearer ${sessionStore.get().access}`;
    return http(request);
  });
  return http;
}
