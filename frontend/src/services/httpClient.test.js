import { AxiosError } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { createHttpClient } from './httpClient.js';
import { createSessionStore } from '../features/auth/application/sessionStore.js';

const initial = { access: 'old', refresh: 'refresh', user: { username: 'staff', role: 'admin' } };
const success = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
const unauthorized = (config) => Promise.reject(new AxiosError('Expired', 'ERR_BAD_REQUEST', config, null, { status: 401, data: {} }));

describe('JWT transport', () => {
  it('shares one refresh for concurrent 401s and retries with the new token', async () => {
    const store = createSessionStore(); store.set(initial);
    let refreshCount = 0;
    const adapter = vi.fn(async (config) => {
      if (config.url === 'auth/refresh/') { refreshCount++; await new Promise((resolve) => setTimeout(resolve, 10)); return success(config, { ...initial, access: 'new', refresh: 'rotated' }); }
      return config.headers.Authorization === 'Bearer new' ? success(config, { ok: true }) : unauthorized(config);
    });
    const http = createHttpClient(store, adapter);
    const results = await Promise.all([http.get('students/'), http.get('groups/')]);
    expect(refreshCount).toBe(1);
    expect(results.every((response) => response.data.ok)).toBe(true);
    expect(store.get().refresh).toBe('rotated');
  });
  it('clears expired refresh credentials without looping', async () => {
    const store = createSessionStore(); store.set(initial);
    const adapter = vi.fn(unauthorized);
    await expect(createHttpClient(store, adapter).get('students/')).rejects.toBeDefined();
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(store.get()).toBeNull();
  });
  it('does not refresh failed login requests', async () => {
    const store = createSessionStore(); store.set(initial);
    const adapter = vi.fn(unauthorized);
    await expect(createHttpClient(store, adapter).post('auth/login/', {}, { skipAuth: true })).rejects.toBeDefined();
    expect(adapter).toHaveBeenCalledTimes(1);
    expect(adapter.mock.calls[0][0].headers.Authorization).toBeUndefined();
  });
  it('does not resurrect credentials when logout occurs during refresh', async () => {
    const store = createSessionStore(); store.set(initial);
    let complete;
    const refreshing = new Promise((resolve) => { complete = resolve; });
    const started = { resolve: null };
    const ready = new Promise((resolve) => { started.resolve = resolve; });
    const http = createHttpClient(store, (config) => {
      if (config.url === 'auth/refresh/') { started.resolve(); return refreshing.then(() => success(config, { ...initial, access: 'new' })); }
      return unauthorized(config);
    });
    const pending = http.get('students/');
    await ready;
    store.set(null); complete();
    await expect(pending).rejects.toBeDefined();
    expect(store.get()).toBeNull();
  });
  it('persists tokens on reload and removes them on logout', () => {
    const values = new Map();
    const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
    const store = createSessionStore(storage); store.set(initial);
    expect(createSessionStore(storage).get()).toEqual(initial);
    store.set(null);
    expect(createSessionStore(storage).get()).toBeNull();
  });
});
