import { axiosClient } from './axiosClient';
import { Repository, IndexStatusResponse } from '@/types';

export const repoApi = {
  listRepos: async (refresh = true): Promise<Repository[]> => {
    const res = await axiosClient.get<Repository[]>('/api/repos', {
      params: { refresh },
    });
    return res.data;
  },

  getRepo: async (id: string): Promise<Repository> => {
    const res = await axiosClient.get<Repository>(`/api/repos/${id}`);
    return res.data;
  },

  startIndexing: async (id: string): Promise<Repository> => {
    const res = await axiosClient.post<Repository>(`/api/repos/${id}/index`);
    return res.data;
  },

  getRepoStatus: async (id: string): Promise<IndexStatusResponse> => {
    const res = await axiosClient.get<IndexStatusResponse>(`/api/repos/${id}/status`);
    return res.data;
  },
};

