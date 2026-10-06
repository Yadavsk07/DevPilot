import React, { useRef, useEffect } from 'react';
import { Send, Square, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onInputChange,
  onSend,
  onStop,
  isStreaming,
  disabled = false,
  placeholder = 'Ask anything about this repository...',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim() && !disabled) {
        onSend();
      }
    }
  };

  return (
    <div className="p-3 sm:p-4 border-t border-border bg-background/95 backdrop-blur-md sticky bottom-0 z-20">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-xl border border-border bg-card shadow-2xs focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isStreaming}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent px-3.5 pt-2.5 pb-10 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none max-h-40 overflow-y-auto leading-relaxed scrollbar-thin"
          />

          {/* Action footer inside input card */}
          <div className="absolute bottom-2 inset-x-2.5 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 select-none hidden sm:flex">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
                Enter ↵
              </kbd>
              <span>to send,</span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
                Shift + Enter
              </kbd>
              <span>for new line</span>
            </div>

            <div className="ml-auto pointer-events-auto flex items-center gap-2">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold border border-destructive/20 transition-colors shadow-2xs"
                  title="Stop generation"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSend}
                  disabled={!input.trim() || disabled}
                  aria-label="Send message"
                  className={cn(
                    'h-8 px-2.5 sm:px-3 rounded-lg transition-all shadow-2xs flex items-center justify-center gap-1.5 text-xs font-semibold select-none',
                    input.trim() && !disabled
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
                      : 'bg-muted text-muted-foreground/40 cursor-not-allowed'
                  )}
                >
                  <CornerDownLeft className="w-3.5 h-3.5 sm:hidden" />
                  <Send className="w-3.5 h-3.5 hidden sm:block" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

