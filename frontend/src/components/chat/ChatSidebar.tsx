import React from 'react';
import { ChatSession } from '@/types';
import { Plus, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId?: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isCreatingSession?: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  isCreatingSession,
}) => {
  // Group sessions by Today, Yesterday, Older
  const groupSessions = (items: ChatSession[]) => {
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const older: ChatSession[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    items.forEach((s) => {
      const time = new Date(s.createdAt).getTime();
      if (time >= startOfToday) {
        today.push(s);
      } else if (time >= startOfYesterday) {
        yesterday.push(s);
      } else {
        older.push(s);
      }
    });

    return { today, yesterday, older };
  };

  const { today, yesterday, older } = groupSessions(sessions);

  const renderGroup = (title: string, groupItems: ChatSession[]) => {
    if (groupItems.length === 0) return null;

    return (
      <div className="space-y-1 mb-3">
        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 select-none">
          <Calendar className="w-3 h-3 text-muted-foreground/60" />
          <span>{title}</span>
        </div>
        {groupItems.map((s) => {
          const isActive = s.id === activeSessionId;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors group select-none',
                isActive
                  ? 'bg-primary text-primary-foreground font-medium shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span className="truncate">{s.title || 'Untitled Chat'}</span>
              </div>
              <ChevronRight
                className={cn(
                  'w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
                  isActive && 'opacity-100 text-primary-foreground'
                )}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col select-none">
      {/* New chat CTA */}
      <div className="p-2.5 border-b border-border/70">
        <button
          onClick={onNewChat}
          disabled={isCreatingSession}
          className="w-full flex items-center justify-center gap-1.5 h-8.5 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50"
        >
          {isCreatingSession ? (
            <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>New Chat</span>
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-1">
        {sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No previous conversations. Start a new chat to begin.
          </div>
        ) : (
          <>
            {renderGroup('Today', today)}
            {renderGroup('Yesterday', yesterday)}
            {renderGroup('Previous', older)}
          </>
        )}
      </div>
    </div>
  );
};


