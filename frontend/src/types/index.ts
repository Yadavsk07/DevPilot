export type IndexStatus = 'PENDING' | 'INDEXING' | 'READY' | 'FAILED';

export type MessageRole = 'USER' | 'ASSISTANT';

export interface User {
  id: string;
  githubId: number;
  githubUsername: string;
  displayName: string;
  avatarUrl: string;
}

export interface Repository {
  id: string;
  githubRepoId: number;
  owner: string;
  name: string;
  fullName: string;
  isPrivate: boolean;
  defaultBranch: string;
  language: string | null;
  htmlUrl: string | null;
  description: string | null;
  indexStatus: IndexStatus;
  indexedAt: string | null;
  chunkCount: number;
  filesTotal: number;
  filesProcessed: number;
  errorMessage: string | null;
}

export interface IndexStatusResponse {
  repositoryId: string;
  indexStatus: IndexStatus;
  filesTotal: number;
  filesProcessed: number;
  chunkCount: number;
  indexedAt: string | null;
  errorMessage: string | null;
}

export interface Citation {
  filePath: string;
  startLine: number;
  endLine: number;
  language?: string | null;
}

export interface ChatSession {
  id: string;
  repositoryId: string;
  title: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  citations?: Citation[];
  createdAt: string;
}

export interface CreateChatSessionRequest {
  repositoryId: string;
  title?: string;
}

export interface ChatMessageRequest {
  content: string;
}

export type Theme = 'light' | 'dark' | 'system';

export type RepoFilterStatus = 'all' | 'ready' | 'indexing' | 'pending' | 'failed';
export type RepoSortOption = 'name' | 'status' | 'recently-indexed';

