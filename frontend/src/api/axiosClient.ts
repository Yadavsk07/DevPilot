import axios from 'axios';

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config?.url?.includes('/api/auth/me') &&
      !window.location.pathname.startsWith('/login') &&
      !window.location.pathname.startsWith('/auth/callback')
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
