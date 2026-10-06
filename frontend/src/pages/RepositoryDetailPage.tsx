import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repoApi } from '@/api/repoApi';
import { RepositoryStatusBadge } from '@/components/repository/RepositoryStatus';
import { IndexProgress } from '@/components/repository/IndexProgress';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { useToast } from '@/components/common/Toast';
import {
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Sparkles,
  GitBranch,
  Lock,
  Globe,
  FileCode,
  Layers,
  Clock,
  Code2,
  RefreshCw,
  AlertTriangle,
  Menu,
} from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils';
import { IndexStatus } from '@/types';

export const RepositoryDetailPage: React.FC = () => {
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const navigate = useNavigate();
  const { openMobileMenu } = (useOutletContext<{ openMobileMenu?: () => void }>() || {});
  const queryClient = useQueryClient();
  const toast = useToast();
  const prevStatusRef = useRef<IndexStatus | undefined>(undefined);

  const {
    data: repository,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['repository', repositoryId],
    queryFn: () => repoApi.getRepo(repositoryId!),
    enabled: !!repositoryId,
  });

  // Indexing mutation
  const indexMutation = useMutation({
    mutationFn: () => repoApi.startIndexing(repositoryId!),
    onMutate: () => {
      toast.info('Indexing started', `Extracting files from ${repository?.name}...`);
      queryClient.setQueryData(['repository', repositoryId], (old: any) =>
        old
          ? {
              ...old,
              indexStatus: 'INDEXING',
              filesProcessed: 0,
              filesTotal: 0,
              chunkCount: 0,
              errorMessage: null,
            }
          : old
      );
      queryClient.setQueryData<any[]>(['repositories'], (old) => {
        if (!old) return old;
        return old.map((r) =>
          r.id === repositoryId
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
      prevStatusRef.current = 'INDEXING';
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(['repository', repositoryId], (old: any) => ({
          ...old,
          ...data,
          indexStatus: 'INDEXING',
        }));
      }
    },
    onError: (err: any) => {
      toast.error('Could not start indexing', err.response?.data?.message || 'Indexing request failed.');
      refetch();
    },
  });

  const isIndexing = repository?.indexStatus === 'INDEXING' || indexMutation.isPending;

  // Live polling for status when indexing
  const { data: polledStatus } = useQuery({
    queryKey: ['repoStatus', repositoryId],
    queryFn: () => repoApi.getRepoStatus(repositoryId!),
    enabled: !!repositoryId && isIndexing,
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

  // Track status transitions
  useEffect(() => {
    if (polledStatus && repository) {
      // Guard against race conditions where an early PENDING poll arrives
      if (isIndexing && polledStatus.indexStatus === 'PENDING') {
        return;
      }

      if (prevStatusRef.current === 'INDEXING' && polledStatus.indexStatus === 'READY') {
        toast.success(`Indexing completed!`, `${repository.name} is now ready for AI chat.`);
        queryClient.setQueryData(['repository', repositoryId], (old: any) =>
          old
            ? {
                ...old,
                indexStatus: 'READY',
                filesTotal: polledStatus.filesTotal,
                filesProcessed: polledStatus.filesProcessed,
                chunkCount: polledStatus.chunkCount,
                indexedAt: polledStatus.indexedAt,
                errorMessage: null,
              }
            : old
        );
        refetch();
        queryClient.invalidateQueries({ queryKey: ['repositories'] });
      } else if (prevStatusRef.current === 'INDEXING' && polledStatus.indexStatus === 'FAILED') {
        toast.error(`Indexing failed`, polledStatus.errorMessage || 'Codebase indexing encountered an error.');
        queryClient.setQueryData(['repository', repositoryId], (old: any) =>
          old
            ? {
                ...old,
                indexStatus: 'FAILED',
                errorMessage: polledStatus.errorMessage,
              }
            : old
        );
        refetch();
        queryClient.invalidateQueries({ queryKey: ['repositories'] });
      }
      prevStatusRef.current = polledStatus.indexStatus;
    }
  }, [polledStatus, repository, repositoryId, isIndexing, refetch, queryClient, toast]);

  if (isLoading) {
    return (
      <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-3/4 h-12" />
        <Skeleton className="w-full h-48 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !repository) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <ErrorState
          title="Repository not found"
          message={(error as any)?.message || 'We could not locate this repository.'}
          status={(error as any)?.response?.status}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const effectiveStatus =
    isIndexing && polledStatus?.indexStatus === 'PENDING'
      ? 'INDEXING'
      : polledStatus?.indexStatus || repository.indexStatus;
  const effectiveFilesTotal = polledStatus?.filesTotal ?? repository.filesTotal;
  const effectiveFilesProcessed = polledStatus?.filesProcessed ?? repository.filesProcessed;
  const effectiveChunks = polledStatus?.chunkCount ?? repository.chunkCount;
  const effectiveIndexedAt = polledStatus?.indexedAt ?? repository.indexedAt;
  const effectiveError = polledStatus?.errorMessage ?? repository.errorMessage;
  const isReady = effectiveStatus === 'READY';

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Header */}
      <div className="h-13 px-4 md:px-6 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {openMobileMenu && (
            <button
              onClick={openMobileMenu}
              aria-label="Open navigation menu"
              className="md:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to repositories</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {repository.htmlUrl && (
            <a
              href={repository.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-5 max-w-4xl mx-auto w-full space-y-4">
        {/* Repo Header & Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {repository.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.2 rounded-full font-medium border ${
                  repository.isPrivate
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                    : 'border-border bg-muted/80 text-muted-foreground'
                }`}
              >
                {repository.isPrivate ? (
                  <>
                    <Lock className="w-2.5 h-2.5" /> Private
                  </>
                ) : (
                  <>
                    <Globe className="w-2.5 h-2.5" /> Public
                  </>
                )}
              </span>
              <RepositoryStatusBadge status={effectiveStatus} size="sm" />
            </div>

            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
              Owner: <span className="text-foreground">{repository.owner}</span> · Full Name:{' '}
              <span className="text-foreground">{repository.fullName}</span>
            </p>

            <p className="text-xs text-foreground/80 mt-2 max-w-2xl leading-relaxed">
              {repository.description || 'No description provided for this repository.'}
            </p>

            <div className="flex items-center gap-3.5 text-xs text-muted-foreground mt-3">
              {repository.language && (
                <div className="flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-primary" />
                  <span>{repository.language}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{repository.defaultBranch || 'main'}</span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-start w-full sm:w-auto">
            <button
              onClick={() => navigate(`/repos/${repository.id}/chat`)}
              disabled={!isReady}
              title={
                !isReady
                  ? 'Index this repository before starting a chat.'
                  : 'Start chat session'
              }
              className={`h-9 inline-flex items-center justify-center gap-2 px-4 rounded-lg font-semibold text-xs shadow-2xs transition-all flex-1 sm:flex-initial ${
                isReady
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-muted text-muted-foreground/50 border border-border cursor-not-allowed'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat with Repository</span>
            </button>

            {effectiveStatus !== 'INDEXING' && (
              <button
                onClick={() => indexMutation.mutate()}
                disabled={indexMutation.isPending}
                className="h-9 inline-flex items-center justify-center gap-2 px-3.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-all shadow-2xs disabled:opacity-50 select-none flex-1 sm:flex-initial"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>
                  {effectiveStatus === 'READY'
                    ? 'Re-index'
                    : effectiveStatus === 'FAILED'
                    ? 'Retry Indexing'
                    : 'Index Repository'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Status & Live Progress Panel */}
        <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground tracking-tight">
              Indexing Status & Statistics
            </h2>
            <RepositoryStatusBadge status={effectiveStatus} size="sm" />
          </div>

          {effectiveStatus === 'INDEXING' && (
            <IndexProgress
              filesProcessed={effectiveFilesProcessed}
              filesTotal={effectiveFilesTotal}
              chunkCount={effectiveChunks}
            />
          )}

          {effectiveStatus === 'FAILED' && (
            <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-500 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Indexing Failed</span>
              </div>
              <p className="text-xs font-mono">{effectiveError || 'Unknown error occurred during vectorization.'}</p>
            </div>
          )}

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-lg border border-border/80 bg-background/60">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <FileCode className="w-3 h-3 text-primary" />
                <span>Files Total</span>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-foreground mt-0.5">
                {formatNumber(effectiveFilesTotal)}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border/80 bg-background/60">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <RefreshCw className="w-3 h-3 text-emerald-500" />
                <span>Processed</span>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-foreground mt-0.5">
                {formatNumber(effectiveFilesProcessed)}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border/80 bg-background/60">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Layers className="w-3 h-3 text-indigo-400" />
                <span>Vector Chunks</span>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-foreground mt-0.5">
                {formatNumber(effectiveChunks)}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border/80 bg-background/60">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Last Indexed</span>
              </div>
              <div className="text-xs font-semibold font-mono text-foreground mt-1 truncate" title={effectiveIndexedAt || ''}>
                {formatDate(effectiveIndexedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

