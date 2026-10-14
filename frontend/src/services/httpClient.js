import axios from 'axios';

export function createHttpClient() {
  return axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/',
    timeout: 15000,
    withCredentials: true,
    headers: { Accept: 'application/json' },
  });
}
