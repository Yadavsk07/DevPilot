import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repoApi } from '@/api/repoApi';
import { chatApi } from '@/api/chatApi';
import { streamChatMessage } from '@/api/sse';
import { ChatSession, ChatMessage as ChatMessageType, Citation } from '@/types';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { RepositoryContext } from '@/components/chat/RepositoryContext';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { useToast } from '@/components/common/Toast';
import { ShieldAlert, ArrowLeft, Sparkles } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingCitations, setStreamingCitations] = useState<Citation[]>([]);
  const [streamError, setStreamError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. Fetch Repository details
  const {
    data: repository,
    isLoading: isRepoLoading,
    isError: isRepoError,
    error: repoError,
  } = useQuery({
    queryKey: ['repository', repositoryId],
    queryFn: () => repoApi.getRepo(repositoryId!),
    enabled: !!repositoryId,
  });

  // 2. Fetch Chat Sessions for this repository
  const {
    data: sessions = [],
    isLoading: isSessionsLoading,
    refetch: refetchSessions,
  } = useQuery<ChatSession[]>({
    queryKey: ['chatSessions', repositoryId],
    queryFn: () => chatApi.listSessions(repositoryId!),
    enabled: !!repositoryId && repository?.indexStatus === 'READY',
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: (title?: string) =>
      chatApi.createSession({
        repositoryId: repositoryId!,
        title: title || `Chat with ${repository?.name || 'repository'}`,
      }),
    onSuccess: (newSession) => {
      queryClient.setQueryData<ChatSession[]>(['chatSessions', repositoryId], (old = []) => [
        newSession,
        ...old,
      ]);
      setActiveSessionId(newSession.id);
      toast.success('New session created', newSession.title);
    },
    onError: (err: any) => {
      toast.error('Could not create session', err.response?.data?.message || 'Session creation failed.');
    },
  });

  // Auto-select latest session or create one if none exist
  useEffect(() => {
    if (repository?.indexStatus === 'READY' && !isSessionsLoading) {
      if (sessions.length > 0) {
        if (!activeSessionId || !sessions.some((s) => s.id === activeSessionId)) {
          setActiveSessionId(sessions[0].id);
        }
      } else if (!createSessionMutation.isPending && !activeSessionId) {
        createSessionMutation.mutate();
      }
    }
  }, [repository, sessions, isSessionsLoading, activeSessionId]);

  // 3. Fetch messages for active session
  const {
    data: messages = [],
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useQuery<ChatMessageType[]>({
    queryKey: ['chatMessages', activeSessionId],
    queryFn: () => (activeSessionId ? chatApi.getMessages(activeSessionId) : Promise.resolve([])),
    enabled: !!activeSessionId,
  });

  // Handle new chat click
  const handleNewChat = () => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
    }
    createSessionMutation.mutate();
  };

  // Handle Stop Streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Send message flow
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || !activeSessionId || isStreaming) return;

    setInput('');
    setStreamError(null);
    setIsStreaming(true);
    setStreamingContent('');
    setStreamingCitations([]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Optimistically show user message
    const tempUserMessage: ChatMessageType = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    };

    queryClient.setQueryData<ChatMessageType[]>(['chatMessages', activeSessionId], (old = []) => [
      ...old,
      tempUserMessage,
    ]);

    await streamChatMessage(
      activeSessionId,
      text,
      {
        onUserMessage: (persistedUserMsg) => {
          // Replace temp with persisted user message
          queryClient.setQueryData<ChatMessageType[]>(
            ['chatMessages', activeSessionId],
            (old = []) =>
              old.map((m) => (m.id === tempUserMessage.id ? persistedUserMsg : m))
          );
        },
        onToken: (token) => {
          setStreamingContent((prev) => prev + token);
        },
        onAssistantMessage: (persistedAssistantMsg) => {
          // Persisted assistant message has arrived with citations!
          queryClient.setQueryData<ChatMessageType[]>(
            ['chatMessages', activeSessionId],
            (old = []) => [...old, persistedAssistantMsg]
          );
          setStreamingContent('');
          setStreamingCitations(persistedAssistantMsg.citations || []);
        },
        onDone: () => {
          setIsStreaming(false);
          setStreamingContent('');
          abortControllerRef.current = null;
        },
        onError: (err) => {
          console.error('Chat streaming error:', err);
          setStreamError(err.message || 'Stream connection interrupted. Please retry.');
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
      },
      abortController.signal
    );
  };

  // Loading state
  if (isRepoLoading) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center space-y-4">
        <Skeleton className="w-48 h-8 rounded-lg" />
        <Skeleton className="w-80 h-4 rounded-md" />
      </div>
    );
  }

  // Repo Error
  if (isRepoError || !repository) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <ErrorState
          title="Repository not found"
          message={(repoError as any)?.message || 'We could not find this repository.'}
          status={(repoError as any)?.response?.status}
          onRetry={() => navigate('/')}
        />
      </div>
    );
  }

  // Guard: Repository must be READY before chatting
  if (repository.indexStatus !== 'READY') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto my-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-5">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Repository Not Indexed Yet
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
          DevPilot requires <span className="font-semibold text-foreground">{repository.name}</span> to be fully indexed before you can query code or generate citations.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => navigate(`/repos/${repository.id}`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Go to Indexing Page</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChatLayout
      repository={repository}
      sidebar={
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onNewChat={handleNewChat}
          isCreatingSession={createSessionMutation.isPending}
        />
      }
      contextPanel={<RepositoryContext repository={repository} />}
    >
      {/* Messages Feed */}
      <ChatMessageList
        messages={messages}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        streamingCitations={streamingCitations}
        repository={repository}
        onSelectPrompt={(prompt) => {
          setInput(prompt);
          handleSendMessage(prompt);
        }}
        error={streamError}
        onRetry={() => {
          const lastUserMessage = [...messages].reverse().find((m) => m.role === 'USER');
          if (lastUserMessage) {
            handleSendMessage(lastUserMessage.content);
          }
        }}
      />

      {/* Input bar */}
      <ChatInput
        input={input}
        onInputChange={setInput}
        onSend={() => handleSendMessage()}
        onStop={handleStopStreaming}
        isStreaming={isStreaming}
        disabled={!activeSessionId || createSessionMutation.isPending}
        placeholder={`Ask anything about ${repository.name}...`}
      />
    </ChatLayout>
  );
};

