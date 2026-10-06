import React from 'react';
import { Repository } from '@/types';
import { RepositoryCard } from './RepositoryCard';
import { EmptyState } from '@/components/common/EmptyState';
import { FolderGit2, SearchX } from 'lucide-react';

interface RepositoryGridProps {
  repositories: Repository[];
  hasSearchQuery: boolean;
  onClearSearch?: () => void;
  onRefresh?: () => void;
}

export const RepositoryGrid: React.FC<RepositoryGridProps> = ({
  repositories,
  hasSearchQuery,
  onClearSearch,
  onRefresh,
}) => {
  if (repositories.length === 0) {
    if (hasSearchQuery) {
      return (
        <EmptyState
          icon={SearchX}
          title="No repositories match your search"
          description="Try adjusting your keywords or clearing the filter to find what you're looking for."
          action={
            onClearSearch
              ? {
                  label: 'Clear Search',
                  onClick: onClearSearch,
                }
              : undefined
          }
        />
      );
    }

    return (
      <EmptyState
        icon={FolderGit2}
        title="No repositories found"
        description="Connect your GitHub account or refresh your repositories to synchronize with GitHub."
        action={
          onRefresh
            ? {
                label: 'Refresh Repositories',
                onClick: onRefresh,
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
      {repositories.map((repo) => (
        <RepositoryCard key={repo.id} repository={repo} />
      ))}
    </div>
  );
};

