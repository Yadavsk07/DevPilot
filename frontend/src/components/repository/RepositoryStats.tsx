import React from 'react';
import { Repository } from '@/types';
import { GitFork, CheckCircle2, Loader2, Layers } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface RepositoryStatsProps {
  repositories: Repository[];
}

export const RepositoryStats: React.FC<RepositoryStatsProps> = ({ repositories }) => {
  const total = repositories.length;
  const ready = repositories.filter((r) => r.indexStatus === 'READY').length;
  const indexing = repositories.filter((r) => r.indexStatus === 'INDEXING').length;
  const totalChunks = repositories.reduce((acc, r) => acc + (r.chunkCount || 0), 0);

  const stats = [
    {
      label: 'Repositories',
      value: formatNumber(total),
      subtext: 'Synced from GitHub',
      icon: GitFork,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Ready for Chat',
      value: formatNumber(ready),
      subtext: 'RAG enabled',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Indexing Now',
      value: formatNumber(indexing),
      subtext: indexing > 0 ? 'Processing vectors' : 'All jobs finished',
      icon: Loader2,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      spinning: indexing > 0,
    },
    {
      label: 'Indexed Chunks',
      value: formatNumber(totalChunks),
      subtext: 'Embeddings stored',
      icon: Layers,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-2">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="p-3 sm:p-3.5 rounded-xl border border-border bg-card shadow-2xs hover:border-border/80 transition-all flex items-center justify-between min-w-0"
          >
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-medium text-muted-foreground truncate">{stat.label}</p>
              <h4 className="text-lg sm:text-xl font-bold font-mono tracking-tight text-foreground mt-0.5">
                {stat.value}
              </h4>
              <p className="text-[10px] text-muted-foreground/80 mt-0.5 truncate hidden sm:block">
                {stat.subtext}
              </p>
            </div>
            <div className={`p-2 rounded-lg shrink-0 ${stat.bg} ${stat.color}`}>
              <Icon className={`w-4 h-4 ${stat.spinning ? 'animate-spin' : ''}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
