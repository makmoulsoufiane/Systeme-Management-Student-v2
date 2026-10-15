export class ApiError extends Error {
  constructor(message, status = 0, fields = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

export async function apiRequest(http, config) {
  try {
    const response = await http.request(config);
    if (response.status === 204) return null;
    if (!response.data || typeof response.data !== 'object') throw new ApiError('The server returned an unexpected response.', 502);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError || error.code === 'ERR_CANCELED') throw error;
    const status = error.response?.status || 0;
    const body = error.response?.data;
    const fallback = status === 401 ? 'Your session has expired. Please sign in again.'
      : status === 403 ? 'You do not have permission to do this.'
        : status === 404 ? 'This record could not be found.'
          : status >= 500 ? 'The server could not complete this request. Please try again.'
            : 'Unable to connect. Check that the backend is running and try again.';
    throw new ApiError(body?.message || body?.detail || fallback, status, body?.errors || {});
  }
}
