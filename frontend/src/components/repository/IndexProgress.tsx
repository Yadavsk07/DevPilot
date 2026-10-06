import React from 'react';
import { Layers, FileCode } from 'lucide-react';
import { formatNumber, cn } from '@/lib/utils';

interface IndexProgressProps {
  filesProcessed: number;
  filesTotal: number;
  chunkCount: number;
}

export const IndexProgress: React.FC<IndexProgressProps> = ({
  filesProcessed,
  filesTotal,
  chunkCount,
}) => {
  const percentage =
    filesTotal > 0
      ? Math.min(100, Math.max(0, Math.round((filesProcessed / filesTotal) * 100)))
      : 0;

  return (
    <div className="space-y-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
          {filesTotal > 0 && filesProcessed >= filesTotal
            ? 'Finalizing indexing...'
            : filesTotal === 0
            ? 'Scanning repository files...'
            : 'Indexing repository...'}
        </span>
        <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
          {filesTotal > 0 ? `${percentage}%` : 'Starting...'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary/80 h-2 rounded-full overflow-hidden border border-border/40">
        <div
          className={cn(
            'bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-300 ease-out',
            filesTotal === 0 && 'w-1/3 animate-pulse'
          )}
          style={filesTotal > 0 ? { width: `${percentage}%` } : undefined}
        />
      </div>

      {/* Stats line */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-0.5">
        <span className="flex items-center gap-1">
          <FileCode className="w-3.5 h-3.5 text-muted-foreground/70" />
          {filesTotal > 0
            ? `${formatNumber(filesProcessed)} / ${formatNumber(filesTotal)} files`
            : 'Discovering files...'}
        </span>
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-muted-foreground/70" />
          {formatNumber(chunkCount)} chunks
        </span>
      </div>
    </div>
  );
};

