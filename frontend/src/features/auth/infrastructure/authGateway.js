import { apiRequest } from '../../../services/apiRequest.js';

export function createAuthGateway(http) {
  const request = (config) => apiRequest(http, config);
  return {
    login: (credentials) => request({ url: 'auth/login/', method: 'POST', data: credentials, skipAuth: true }),
    me: () => request({ url: 'auth/me/' }),
    logout: (refresh) => request({ url: 'auth/logout/', method: 'POST', data: { refresh } }),
    changePassword: (values) => request({ url: 'auth/change-password/', method: 'POST', data: values }),
    accounts: (role, signal) => request({ url: `admin/${role}s/`, signal }),
    account: (role, id, signal) => request({ url: `admin/${role}s/${id}/`, signal }),
    saveAccount: (role, id, values) => request({ url: `admin/${role}s/${id ? `${id}/` : ''}`, method: id ? 'PATCH' : 'POST', data: values }),
  };
}
