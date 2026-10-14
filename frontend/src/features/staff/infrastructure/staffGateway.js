export class ApiError extends Error {
  constructor(message, status = 0, fields = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

// The gateway owns the wire format and CSRF token, never the UI state.
export function createStaffGateway(http) {
  let csrfToken;

  async function request(config) {
    try {
      const response = await http.request({
        ...config,
        headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
      });
      if (response.status === 204) return null;
      if (!response.data || typeof response.data !== 'object') {
        throw new ApiError('The server returned an unexpected response. Please try again.', 502);
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError || error.code === 'ERR_CANCELED') throw error;
      const status = error.response?.status || 0;
      const body = error.response?.data;
      const fallback = status === 401 ? 'Your session has expired. Please sign in again.'
        : status === 403 ? 'You do not have permission to do this. Try signing in again.'
          : status === 404 ? 'This record could not be found.'
            : status >= 500 ? 'The server could not complete this request. Please try again.'
              : 'Unable to connect. Check that the backend is running and try again.';
      throw new ApiError(body?.message || fallback, status, body?.errors || {});
    }
  }

  async function sessionRequest(config) {
    const result = await request(config);
    if (!('user' in result) || typeof result.csrfToken !== 'string') {
      throw new ApiError('The server returned an invalid session response.', 502);
    }
    csrfToken = result.csrfToken;
    return result.user;
  }

  function validateRecord(resource, record) {
    const idKey = resources[resource]?.id || 'id_admin';
    if (!record || Array.isArray(record) || !Number.isInteger(record[idKey])) {
      throw new ApiError('The server returned an invalid record.', 502);
    }
    for (const field of resources[resource]?.fields || []) {
      if ((field.type === 'date' || field.type === 'datetime-local') && record[field.name] != null
        && !Number.isFinite(Date.parse(record[field.name]))) {
        throw new ApiError('The server returned an invalid date.', 502);
      }
    }
    return record;
  }

  async function recordRequest(resource, config) {
    const result = await request(config);
    if (!result.record || typeof result.record !== 'object') {
      throw new ApiError('The server returned an invalid record.', 502);
    }
    return validateRecord(resource, result.record);
  }

  return {
    session: () => sessionRequest({ url: 'session/' }),
    login: (credentials) => sessionRequest({ url: 'login/', method: 'POST', data: credentials }),
    logout: () => sessionRequest({ url: 'logout/', method: 'POST' }),
    async list(resource, signal) {
      const result = await request({ url: `${resource}/`, signal });
      if (!Array.isArray(result.results)) throw new ApiError('The server returned an invalid list.', 502);
      return result.results.map((record) => validateRecord(resource, record));
    },
    get: (resource, id, signal) => recordRequest(resource, { url: `${resource}/${encodeURIComponent(id)}/`, signal }),
    save: (resource, id, values) => recordRequest(resource, {
      url: id ? `${resource}/${encodeURIComponent(id)}/` : `${resource}/`,
      method: id ? 'PATCH' : 'POST', data: values,
    }),
    remove: (resource, id) => request({ url: `${resource}/${encodeURIComponent(id)}/`, method: 'DELETE' }),
  };
}
import { resources } from '../domain/resources.js';

