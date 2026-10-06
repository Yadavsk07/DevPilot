import React from 'react';
import { IndexStatus } from '@/types';
import { CheckCircle2, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RepositoryStatusProps {
  status: IndexStatus;
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const RepositoryStatusBadge: React.FC<RepositoryStatusProps> = ({
  status,
  size = 'default',
  showIcon = true,
  className,
}) => {
  const configs: Record<
    IndexStatus,
    { label: string; bg: string; text: string; border: string; icon: React.FC<{ className?: string }> }
  > = {
    READY: {
      label: 'Ready',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-500/25',
      icon: CheckCircle2,
    },
    INDEXING: {
      label: 'Indexing',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/25',
      icon: Loader2,
    },
    PENDING: {
      label: 'Not indexed',
      bg: 'bg-muted/80',
      text: 'text-muted-foreground',
      border: 'border-border',
      icon: Clock,
    },
    FAILED: {
      label: 'Failed',
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-500/25',
      icon: AlertTriangle,
    },
  };

  const current = configs[status] || configs.PENDING;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    default: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    default: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border select-none transition-colors',
        current.bg,
        current.text,
        current.border,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            iconSizes[size],
            status === 'INDEXING' && 'animate-spin'
          )}
        />
      )}
      <span>{current.label}</span>
    </span>
  );
};

