import { axiosClient } from './axiosClient';
import {
  ChatSession,
  ChatMessage,
  CreateChatSessionRequest,
} from '@/types';

export const chatApi = {
  createSession: async (data: CreateChatSessionRequest): Promise<ChatSession> => {
    const res = await axiosClient.post<ChatSession>('/api/chat/sessions', data);
    return res.data;
  },

  listSessions: async (repositoryId: string): Promise<ChatSession[]> => {
    const res = await axiosClient.get<ChatSession[]>('/api/chat/sessions', {
      params: { repositoryId },
    });
    return res.data;
  },

  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const res = await axiosClient.get<ChatMessage[]>(`/api/chat/sessions/${sessionId}`);
    return res.data;
  },
};

