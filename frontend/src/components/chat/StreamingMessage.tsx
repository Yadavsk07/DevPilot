import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Loader2 } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { CitationList } from './CitationList';
import { Citation, Repository } from '@/types';

interface StreamingMessageProps {
  content: string;
  citations?: Citation[];
  repository?: Repository | null;
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({
  content,
  citations = [],
  repository,
}) => {
  return (
    <div className="w-full bg-muted/15 border-y border-border/40 py-3 sm:py-3.5 transition-colors">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 flex gap-2.5 sm:gap-3">
        <div className="shrink-0 mt-0.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shadow-xs glow-primary">
            <Sparkles className="w-3 h-3 animate-pulse" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 text-[11px] text-muted-foreground select-none">
            <span className="font-semibold text-foreground">DevPilot</span>
            <span>·</span>
            <span className="text-primary font-mono text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              Generating response...
            </span>
          </div>

          {!content ? (
            <div className="flex items-center gap-2 py-2 text-xs sm:text-sm text-muted-foreground font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>DevPilot is analyzing repository...</span>
            </div>
          ) : (
            <div className="w-full text-xs sm:text-sm text-foreground leading-relaxed overflow-hidden">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
                  h1: ({ children }) => (
                    <h1 className="text-base sm:text-lg font-bold text-foreground mt-3.5 mb-1.5">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm sm:text-base font-bold text-foreground mt-3 mb-1.5">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xs sm:text-sm font-bold text-foreground mt-2 mb-1">{children}</h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside pl-4 mb-2.5 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside pl-4 mb-2.5 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/60 pl-3 my-2 text-muted-foreground italic">
                      {children}
                    </blockquote>
                  ),
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
                {content}
              </ReactMarkdown>

              {/* Pulsing cursor while active */}
              <span className="inline-block w-1.5 h-3.5 ml-1 bg-primary animate-pulse align-middle" />

              {citations.length > 0 && (
                <CitationList citations={citations} repository={repository} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

