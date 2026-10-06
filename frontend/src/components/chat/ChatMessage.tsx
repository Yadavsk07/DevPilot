import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage as ChatMessageType, Repository } from '@/types';
import { Sparkles, User, Copy, Check } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { CitationList } from './CitationList';
import { cn, formatDate } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  repository?: Repository | null;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  repository,
}) => {
  const isUser = message.role === 'USER';
  const [copied, setCopied] = React.useState(false);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={cn(
        'w-full transition-colors group',
        isUser ? 'bg-transparent py-2.5 sm:py-3' : 'bg-muted/15 border-y border-border/40 py-3 sm:py-3.5'
      )}
    >
      <div
        className={cn(
          'max-w-3xl mx-auto px-3 sm:px-6 flex gap-2.5 sm:gap-3',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-6 h-6 rounded-md bg-secondary text-secondary-foreground border border-border flex items-center justify-center shadow-2xs">
              <User className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shadow-xs glow-primary">
              <Sparkles className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Message bubble / content */}
        <div
          className={cn(
            'flex flex-col min-w-0',
            isUser ? 'items-end max-w-[85%] sm:max-w-xl' : 'items-start flex-1'
          )}
        >
          {/* Header (Role & Time) */}
          <div className="flex items-center gap-1.5 mb-1 text-[11px] text-muted-foreground select-none">
            <span className="font-semibold text-foreground">
              {isUser ? 'You' : 'DevPilot'}
            </span>
            <span>·</span>
            <span>{formatDate(message.createdAt)}</span>
            {!isUser && (
              <button
                onClick={handleCopyText}
                aria-label="Copy message text"
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all ml-1"
                title="Copy answer"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}
          </div>

          {/* Content */}
          {isUser ? (
            <div className="p-2.5 px-3.5 rounded-2xl rounded-tr-xs bg-primary text-primary-foreground text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-2xs">
              {message.content}
            </div>
          ) : (
            <div className="w-full text-xs sm:text-sm text-foreground leading-relaxed overflow-hidden">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
                  h1: ({ children }) => (
                    <h1 className="text-base sm:text-lg font-bold text-foreground mt-3.5 mb-1.5">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm sm:text-base font-bold text-foreground mt-3 mb-1.5">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xs sm:text-sm font-bold text-foreground mt-2 mb-1">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside pl-4 mb-2.5 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside pl-4 mb-2.5 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/60 pl-3 my-2 text-muted-foreground italic">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="my-2.5 overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-left text-xs border-collapse">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted text-foreground border-b border-border">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-border/60">{children}</tbody>
                  ),
                  tr: ({ children }) => <tr className="hover:bg-muted/30">{children}</tr>,
                  th: ({ children }) => (
                    <th className="p-2 font-semibold">{children}</th>
                  ),
                  td: ({ children }) => <td className="p-2">{children}</td>,
                  code: ({ className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !String(children).includes('\n');

                    if (isInline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded bg-muted text-primary font-mono text-[11px] sm:text-xs font-medium border border-border/40"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return (
                      <CodeBlock
                        code={String(children).replace(/\n$/, '')}
                        language={match ? match[1] : 'text'}
                      />
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>

              {/* Citations section */}
              {message.citations && message.citations.length > 0 && (
                <CitationList
                  citations={message.citations}
                  repository={repository}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

