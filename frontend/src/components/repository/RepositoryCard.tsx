import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GitFork,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Lock,
  Globe,
  RefreshCw,
  GitBranch,
  Layers,
  FileCode,
  Check,
} from 'lucide-react';
import { Repository, IndexStatus } from '@/types';
import { repoApi } from '@/api/repoApi';
import { RepositoryStatusBadge } from './RepositoryStatus';
import { IndexProgress } from './IndexProgress';
import { useToast } from '@/components/common/Toast';
import { formatNumber, cn } from '@/lib/utils';

interface RepositoryCardProps {
  repository: Repository;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository: initialRepo }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const prevStatusRef = useRef<IndexStatus>(initialRepo.indexStatus);

  const [localRepo, setLocalRepo] = useState<Repository>(initialRepo);

  // Sync prop changes into state, but do not overwrite active indexing with stale PENDING status
  useEffect(() => {
    if (localRepo.indexStatus === 'INDEXING' && initialRepo.indexStatus === 'PENDING') {
      return;
    }
    setLocalRepo(initialRepo);
    if (initialRepo.indexStatus !== 'INDEXING') {
      prevStatusRef.current = initialRepo.indexStatus;
    }
  }, [initialRepo, localRepo.indexStatus]);

  const isIndexing = localRepo.indexStatus === 'INDEXING';

  // Poll status endpoint while indexing. Poll continues until terminal READY or FAILED status is returned.
  const { data: polledStatus } = useQuery({
    queryKey: ['repoStatus', localRepo.id],
    queryFn: () => repoApi.getRepoStatus(localRepo.id),
    enabled: isIndexing,
    refetchInterval: (query) => {
      const status = query.state.data?.indexStatus;
      if (status === 'READY' || status === 'FAILED') {
        return false;
      }
      return 1200;
    },
    refetchIntervalInBackground: true,
    staleTime: 500,
  });

  // When polled data changes, update local state and check transitions
  useEffect(() => {
    if (!polledStatus) return;

    // Guard against race conditions:
    // If we are actively indexing, do not let an initial/stale PENDING poll override our indexing state
    if (isIndexing && polledStatus.indexStatus === 'PENDING') {
      return;
    }

    setLocalRepo((prev) => ({
      ...prev,
      indexStatus: polledStatus.indexStatus,
      filesTotal: polledStatus.filesTotal,
      filesProcessed: polledStatus.filesProcessed,
      chunkCount: polledStatus.chunkCount,
      indexedAt: polledStatus.indexedAt,
      errorMessage: polledStatus.errorMessage,
    }));

    // Optimistically keep dashboard cache synced with live progress and final status
    queryClient.setQueryData<Repository[]>(['repositories'], (old) => {
      if (!old) return old;
      return old.map((r) =>
        r.id === localRepo.id
          ? {
              ...r,
              indexStatus: polledStatus.indexStatus,
              filesTotal: polledStatus.filesTotal,
              filesProcessed: polledStatus.filesProcessed,
              chunkCount: polledStatus.chunkCount,
              indexedAt: polledStatus.indexedAt,
              errorMessage: polledStatus.errorMessage,
            }
          : r
      );
    });

    // Fire completion toasts & invalidate queries
    if (prevStatusRef.current === 'INDEXING' && polledStatus.indexStatus === 'READY') {
      toast.success(
        `Indexing completed: ${localRepo.name}`,
        `${polledStatus.filesTotal} files processed into ${polledStatus.chunkCount} code chunks.`
      );
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
      queryClient.invalidateQueries({ queryKey: ['repository', localRepo.id] });
    } else if (prevStatusRef.current === 'INDEXING' && polledStatus.indexStatus === 'FAILED') {
      toast.error(
        `Indexing failed: ${localRepo.name}`,
        polledStatus.errorMessage || 'Unknown error occurred during codebase indexing.'
      );
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
      queryClient.invalidateQueries({ queryKey: ['repository', localRepo.id] });
    }

    prevStatusRef.current = polledStatus.indexStatus;
  }, [polledStatus, localRepo.id, localRepo.name, isIndexing, queryClient, toast]);

  // Indexing mutation
  const indexMutation = useMutation({
    mutationFn: () => repoApi.startIndexing(localRepo.id),
    onMutate: () => {
      // Immediately set UI and query cache to INDEXING
      setLocalRepo((prev) => ({
        ...prev,
        indexStatus: 'INDEXING',
        filesProcessed: 0,
        filesTotal: 0,
        chunkCount: 0,
        errorMessage: null,
      }));
      prevStatusRef.current = 'INDEXING';

      queryClient.setQueryData<Repository[]>(['repositories'], (old) => {
        if (!old) return old;
        return old.map((r) =>
          r.id === localRepo.id
            ? {
                ...r,
                indexStatus: 'INDEXING',
                filesProcessed: 0,
                filesTotal: 0,
                chunkCount: 0,
                errorMessage: null,
              }
            : r
        );
      });

      toast.info(`Indexing started`, `Extracting and chunking ${localRepo.name}...`);
    },
    onSuccess: (data) => {
      if (data) {
        setLocalRepo((prev) => ({
          ...prev,
          ...data,
          indexStatus: 'INDEXING',
        }));
        queryClient.setQueryData<Repository[]>(['repositories'], (old) => {
          if (!old) return old;
          return old.map((r) => (r.id === localRepo.id ? { ...r, ...data, indexStatus: 'INDEXING' } : r));
        });
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to start indexing';
      toast.error('Could not start indexing', msg);
      // Revert if error
      setLocalRepo((prev) => ({
        ...prev,
        indexStatus: initialRepo.indexStatus,
      }));
      prevStatusRef.current = initialRepo.indexStatus;
      queryClient.setQueryData<Repository[]>(['repositories'], (old) => {
        if (!old) return old;
        return old.map((r) => (r.id === localRepo.id ? { ...r, indexStatus: initialRepo.indexStatus } : r));
      });
    },
  });

  const handleIndexClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isIndexing || indexMutation.isPending) return;
    indexMutation.mutate();
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localRepo.indexStatus !== 'READY') return;
    navigate(`/repos/${localRepo.id}/chat`);
  };

  const handleCardClick = () => {
    navigate(`/repos/${localRepo.id}`);
  };

  // Language color dots
  const getLanguageColor = (lang?: string | null) => {
    const map: Record<string, string> = {
      TypeScript: '#3178C6',
      JavaScript: '#F7DF1E',
      Java: '#B07219',
      Python: '#3572A5',
      Go: '#00ADD8',
      Rust: '#DEA584',
      PHP: '#4F5D95',
      Ruby: '#701516',
      'C++': '#F34B7D',
      'C#': '#178600',
      HTML: '#E34C26',
      CSS: '#563D7C',
      Kotlin: '#A97BFF',
    };
    return (lang && map[lang]) || '#94A3B8';
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 sm:p-4.5 transition-all duration-200 cursor-pointer shadow-2xs',
        'hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5',
        isIndexing && 'border-amber-500/40 bg-amber-500/[0.02]'
      )}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/20 transition-all shrink-0">
              <GitFork className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                {localRepo.name}
              </h3>
              <p className="text-[11px] text-muted-foreground truncate font-mono">{localRepo.owner}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border',
                localRepo.isPrivate
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-border bg-muted/80 text-muted-foreground'
              )}
            >
              {localRepo.isPrivate ? (
                <>
                  <Lock className="w-2.5 h-2.5" /> Private
                </>
              ) : (
                <>
                  <Globe className="w-2.5 h-2.5" /> Public
                </>
              )}
            </span>

            {localRepo.htmlUrl && (
              <a
                href={localRepo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                title="Open on GitHub"
                aria-label={`Open ${localRepo.fullName} on GitHub`}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed min-h-[2.25rem]">
          {localRepo.description || 'No description provided'}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-3 pt-2.5 border-t border-border/60">
          {localRepo.language && (
            <div className="flex items-center gap-1.5 truncate">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: getLanguageColor(localRepo.language) }}
              />
              <span className="truncate">{localRepo.language}</span>
            </div>
          )}

          <div className="flex items-center gap-1 truncate font-mono text-[10px]">
            <GitBranch className="w-3 h-3 text-muted-foreground/70 shrink-0" />
            <span className="truncate">{localRepo.defaultBranch || 'main'}</span>
          </div>

          <div className="ml-auto">
            <RepositoryStatusBadge status={localRepo.indexStatus} size="sm" />
          </div>
        </div>
      </div>

      {/* Status & Actions Section */}
      <div className="mt-3.5 pt-2.5 border-t border-border/60 space-y-2" onClick={(e) => e.stopPropagation()}>
        {/* PENDING State */}
        {localRepo.indexStatus === 'PENDING' && (
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] text-muted-foreground">Ready to index</div>
            <button
              onClick={handleIndexClick}
              disabled={indexMutation.isPending}
              className="h-8 inline-flex items-center justify-center gap-1.5 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Index repository</span>
            </button>
          </div>
        )}

        {/* INDEXING State */}
        {localRepo.indexStatus === 'INDEXING' && (
          <IndexProgress
            filesProcessed={localRepo.filesProcessed}
            filesTotal={localRepo.filesTotal}
            chunkCount={localRepo.chunkCount}
          />
        )}

        {/* READY State */}
        {localRepo.indexStatus === 'READY' && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                <FileCode className="w-3 h-3" /> {formatNumber(localRepo.filesTotal)} files ·{' '}
                <Layers className="w-3 h-3" /> {formatNumber(localRepo.chunkCount)} chunks
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleChatClick}
                className="h-8 inline-flex items-center justify-center gap-1.5 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
              {localRepo.htmlUrl && (
                <a
                  href={localRepo.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors"
                  title="Open GitHub"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* FAILED State */}
        {localRepo.indexStatus === 'FAILED' && (
          <div className="space-y-2">
            <div className="text-[11px] text-rose-500 font-mono truncate" title={localRepo.errorMessage || ''}>
              {localRepo.errorMessage || 'Indexing encountered an error'}
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleIndexClick}
                disabled={indexMutation.isPending}
                className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-500/20 transition-colors"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', indexMutation.isPending && 'animate-spin')} />
                <span>Retry indexing</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

