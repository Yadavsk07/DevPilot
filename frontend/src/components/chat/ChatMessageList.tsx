import React, { useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, Repository, Citation } from '@/types';
import { ChatMessage } from './ChatMessage';
import { StreamingMessage } from './StreamingMessage';
import { EmptyChat } from './EmptyChat';

interface ChatMessageListProps {
  messages: ChatMessageType[];
  isStreaming: boolean;
  streamingContent: string;
  streamingCitations?: Citation[];
  repository: Repository;
  onSelectPrompt: (prompt: string) => void;
  error?: string | null;
  onRetry?: () => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isStreaming,
  streamingContent,
  streamingCitations,
  repository,
  onSelectPrompt,
  error,
  onRetry,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isStreaming]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <EmptyChat
        repositoryName={repository.name}
        onSelectPrompt={onSelectPrompt}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="w-full">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            repository={repository}
          />
        ))}

        {/* Real-time streaming assistant message */}
        {isStreaming && (
          <StreamingMessage
            content={streamingContent}
            citations={streamingCitations}
            repository={repository}
          />
        )}
      </div>

      {/* Inline streaming error if one occurred */}
      {error && (
        <div className="max-w-3xl mx-auto px-3 sm:px-6 my-3">
          <div className="p-3 sm:p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 flex items-center justify-between gap-3 text-xs text-destructive">
            <span>{error}</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-2.5 py-1 rounded-lg bg-destructive/10 hover:bg-destructive/20 font-medium transition-colors shrink-0"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
};

