import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { repoApi } from '@/api/repoApi';
import { Repository, RepoFilterStatus, RepoSortOption } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { RepositoryStats } from '@/components/repository/RepositoryStats';
import { RepositorySearch } from '@/components/repository/RepositorySearch';
import { RepositoryFilters } from '@/components/repository/RepositoryFilters';
import { RepositoryGrid } from '@/components/repository/RepositoryGrid';
import { RepoGridSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { useToast } from '@/components/common/Toast';
import { Sparkles, RefreshCw } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu?: () => void }>() || {};
  const queryClient = useQueryClient();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<RepoFilterStatus>('all');
  const [sortBy, setSortBy] = useState<RepoSortOption>('name');
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // Fetch and synchronize user's repositories from GET /api/repos?refresh=true
  const {
    data: rawRepos,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Repository[]>({
    queryKey: ['repositories'],
    queryFn: () => repoApi.listRepos(true),
    staleTime: 60 * 1000,
    retry: 1,
  });

  const repositories = useMemo(() => {
    return Array.isArray(rawRepos) ? rawRepos : [];
  }, [rawRepos]);

  const handleManualRefresh = async () => {
    try {
      setIsManualSyncing(true);
      await refetch();
      toast.success('Repositories synchronized', 'Fetched latest repositories from GitHub.');
    } catch (err: any) {
      toast.error('Sync failed', err.response?.data?.message || 'Unable to sync repositories from GitHub.');
    } finally {
      setIsManualSyncing(false);
    }
  };

  // Filter counts
  const counts = useMemo(() => {
    return {
      all: repositories.length,
      ready: repositories.filter((r) => r.indexStatus === 'READY').length,
      indexing: repositories.filter((r) => r.indexStatus === 'INDEXING').length,
      pending: repositories.filter((r) => r.indexStatus === 'PENDING').length,
      failed: repositories.filter((r) => r.indexStatus === 'FAILED').length,
    };
  }, [repositories]);

  // Client-side filtering & sorting
  const filteredRepositories = useMemo(() => {
    let result = [...repositories];

    // Status Filter
    if (filterStatus === 'ready') {
      result = result.filter((r) => r.indexStatus === 'READY');
    } else if (filterStatus === 'indexing') {
      result = result.filter((r) => r.indexStatus === 'INDEXING');
    } else if (filterStatus === 'pending') {
      result = result.filter((r) => r.indexStatus === 'PENDING');
    } else if (filterStatus === 'failed') {
      result = result.filter((r) => r.indexStatus === 'FAILED');
    }

    // Search query filter (by name, fullName, description, language)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.fullName?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.language?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.fullName.localeCompare(b.fullName, undefined, { sensitivity: 'base' });
      }
      if (sortBy === 'status') {
        const order: Record<string, number> = {
          INDEXING: 0,
          READY: 1,
          PENDING: 2,
          FAILED: 3,
        };
        return (order[a.indexStatus] ?? 9) - (order[b.indexStatus] ?? 9);
      }
      if (sortBy === 'recently-indexed') {
        const timeA = a.indexedAt ? new Date(a.indexedAt).getTime() : 0;
        const timeB = b.indexedAt ? new Date(b.indexedAt).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });

    return result;
  }, [repositories, filterStatus, searchQuery, sortBy]);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Bar */}
      <TopBar
        title="Repositories"
        subtitle="Connect, index, and chat with your GitHub codebases."
        onRefresh={handleManualRefresh}
        isRefreshing={isManualSyncing || isLoading}
        onToggleMobileMenu={openMobileMenu}
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-5">
        {/* Page Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <span>Your repositories</span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {repositories.length}
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Connect, index, and chat with your GitHub codebases using AI.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={isManualSyncing || isLoading}
              className="h-8.5 inline-flex items-center gap-2 px-3.5 rounded-lg border border-border bg-card hover:bg-muted/80 text-xs font-medium text-foreground transition-all shadow-2xs disabled:opacity-50 select-none"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isManualSyncing || isLoading ? 'animate-spin text-primary' : 'text-muted-foreground'}`}
              />
              <span>{isManualSyncing ? 'Syncing...' : 'Sync Repositories'}</span>
            </button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            <RepoGridSkeleton count={6} />
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <ErrorState
            status={(error as any)?.response?.status}
            message={(error as any)?.message || 'Failed to load repositories.'}
            onRetry={() => refetch()}
          />
        )}

        {/* Content loaded */}
        {!isLoading && !isError && (
          <>
            {/* Overview Stats */}
            {repositories.length > 0 && (
              <RepositoryStats repositories={repositories} />
            )}

            {/* Search and Filters toolbar */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <RepositorySearch
                  query={searchQuery}
                  onQueryChange={setSearchQuery}
                />
              </div>

              <RepositoryFilters
                currentFilter={filterStatus}
                onFilterChange={setFilterStatus}
                currentSort={sortBy}
                onSortChange={setSortBy}
                counts={counts}
              />
            </div>

            {/* Grid of repository cards */}
            <RepositoryGrid
              repositories={filteredRepositories}
              hasSearchQuery={!!searchQuery.trim() || filterStatus !== 'all'}
              onClearSearch={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
              onRefresh={handleManualRefresh}
            />
          </>
        )}
      </div>
    </div>
  );
};

