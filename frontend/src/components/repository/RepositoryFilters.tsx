import React from 'react';
import { RepoFilterStatus, RepoSortOption } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { SelectDropdown, SelectOption } from '@/components/common/SelectDropdown';

interface RepositoryFiltersProps {
  currentFilter: RepoFilterStatus;
  onFilterChange: (filter: RepoFilterStatus) => void;
  currentSort: RepoSortOption;
  onSortChange: (sort: RepoSortOption) => void;
  counts: {
    all: number;
    ready: number;
    indexing: number;
    pending: number;
    failed: number;
  };
}

export const RepositoryFilters: React.FC<RepositoryFiltersProps> = ({
  currentFilter,
  onFilterChange,
  currentSort,
  onSortChange,
  counts,
}) => {
  const filterTabs: { id: RepoFilterStatus; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'ready', label: 'Indexed', count: counts.ready },
    { id: 'indexing', label: 'Indexing', count: counts.indexing },
    { id: 'pending', label: 'Not indexed', count: counts.pending },
    { id: 'failed', label: 'Failed', count: counts.failed },
  ];

  const sortOptions: SelectOption<RepoSortOption>[] = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'status', label: 'Status' },
    { value: 'recently-indexed', label: 'Recently Indexed' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2 border-b border-border/60">
      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = currentFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all select-none border',
                isActive
                  ? 'bg-foreground text-background border-foreground shadow-xs'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground hover:border-border/80'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-mono leading-none',
                  isActive
                    ? 'bg-background/25 text-background font-semibold'
                    : 'bg-secondary text-muted-foreground'
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Modern sort options */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3" />
          <span>Sort by:</span>
        </span>
        <SelectDropdown<RepoSortOption>
          value={currentSort}
          options={sortOptions}
          onChange={onSortChange}
          align="right"
          icon={ArrowUpDown}
          size="sm"
        />
      </div>
    </div>
  );
};
