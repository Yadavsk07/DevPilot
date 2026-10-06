import { axiosClient, API_BASE_URL } from './axiosClient';
import { User } from '@/types';

export const authApi = {
  getLoginUrl: async (): Promise<{ url: string }> => {
    try {
      const res = await axiosClient.get<{ url: string }>('/api/auth/login-url');
      return res.data;
    } catch {
      return { url: '/oauth2/authorization/github' };
    }
  },

  getMe: async (): Promise<User> => {
    const res = await axiosClient.get<User>('/api/auth/me');
    return res.data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/api/auth/logout');
  },

  getDirectLoginRedirectUrl: (relativeUrl = '/oauth2/authorization/github'): string => {
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    const cleanBase = API_BASE_URL.replace(/\/+$/, '');
    const cleanRelative = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
    return `${cleanBase}${cleanRelative}`;
  },
};
