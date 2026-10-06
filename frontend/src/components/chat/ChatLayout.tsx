import React, { useState } from 'react';
import { PanelLeft, PanelRight, ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Repository } from '@/types';
import { RepositoryStatusBadge } from '@/components/repository/RepositoryStatus';
import { cn } from '@/lib/utils';

interface ChatLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  contextPanel?: React.ReactNode;
  repository: Repository;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  sidebar,
  children,
  contextPanel,
  repository,
}) => {
  const navigate = useNavigate();
  // On desktop: left sidebar starts open; right context panel can be toggled
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [desktopContextOpen, setDesktopContextOpen] = useState(false);

  // On mobile/tablet: slide-over drawer states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileContextOpen, setMobileContextOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden bg-background">
      {/* Chat Navigation Header */}
      <header className="h-12 px-3 sm:px-4 border-b border-border bg-card/70 backdrop-blur-md flex items-center justify-between shrink-0 select-none z-20">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate('/')}
            aria-label="Back to dashboard"
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Back to repositories"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Toggle sessions sidebar: mobile triggers drawer, desktop triggers column */}
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileSidebarOpen(!mobileSidebarOpen);
              } else {
                setDesktopSidebarOpen(!desktopSidebarOpen);
              }
            }}
            aria-label="Toggle sessions sidebar"
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              (desktopSidebarOpen || mobileSidebarOpen)
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            title="Toggle chat sessions"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-border/80 mx-0.5 hidden sm:block" />

          <div className="flex items-center gap-2 min-w-0">
            <h2 className="font-semibold text-xs sm:text-sm text-foreground truncate max-w-[140px] sm:max-w-[240px] md:max-w-xs">
              {repository.name}
            </h2>
            <RepositoryStatusBadge status={repository.indexStatus} size="sm" />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {repository.htmlUrl && (
            <a
              href={repository.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/80 bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              title="Open repository on GitHub"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}

          {contextPanel && (
            <button
              onClick={() => {
                if (window.innerWidth < 1280) {
                  setMobileContextOpen(!mobileContextOpen);
                } else {
                  setDesktopContextOpen(!desktopContextOpen);
                }
              }}
              aria-label="Toggle repository context panel"
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                (desktopContextOpen || mobileContextOpen)
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title="Toggle repository context"
            >
              <PanelRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main 3-column area */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Desktop left sidebar */}
        {desktopSidebarOpen && (
          <aside className="hidden lg:block shrink-0 w-60 h-full border-r border-border bg-card/50 transition-all duration-200">
            {sidebar}
          </aside>
        )}

        {/* Mobile/Tablet left drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-card z-50 shadow-2xl animate-in slide-in-from-left duration-200">
              {sidebar}
            </div>
          </div>
        )}

        {/* Center: Conversation & Input */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
          {children}
        </main>

        {/* Desktop right panel */}
        {desktopContextOpen && contextPanel && (
          <aside className="hidden xl:block shrink-0 w-72 h-full border-l border-border bg-card/40 transition-all duration-200">
            {contextPanel}
          </aside>
        )}

        {/* Mobile/Tablet right drawer */}
        {mobileContextOpen && contextPanel && (
          <div className="fixed inset-0 z-40 xl:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileContextOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-card z-50 shadow-2xl animate-in slide-in-from-right duration-200">
              {contextPanel}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


