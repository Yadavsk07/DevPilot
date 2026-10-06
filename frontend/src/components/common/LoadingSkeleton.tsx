import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/70', className)}
      {...props}
    />
  );
}

export function RepoCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-4.5 space-y-3.5 shadow-2xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <Skeleton className="w-8 h-8 rounded-lg shrink-0 mt-0.5" />
          <div className="space-y-1.5 min-w-0">
            <Skeleton className="w-28 sm:w-36 h-4 rounded" />
            <Skeleton className="w-16 sm:w-20 h-3 rounded" />
          </div>
        </div>
        <Skeleton className="w-14 h-5 rounded-full shrink-0" />
      </div>
      <Skeleton className="w-full h-7 rounded" />
      <div className="flex items-center gap-3 pt-2 border-t border-border/60">
        <Skeleton className="w-14 h-3.5 rounded" />
        <Skeleton className="w-14 h-3.5 rounded" />
        <Skeleton className="w-20 h-3.5 rounded ml-auto" />
      </div>
      <div className="pt-1">
        <Skeleton className="w-full h-8 rounded-lg" />
      </div>
    </div>
  );
}

export function RepoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <RepoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChatMessagesSkeleton() {
  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto w-full">
      <div className="flex justify-end">
        <Skeleton className="w-2/3 h-16 rounded-2xl rounded-tr-sm" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="space-y-2 flex-1 max-w-2xl">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-5/6 h-4" />
          <Skeleton className="w-3/4 h-24 rounded-lg" />
          <Skeleton className="w-1/2 h-4" />
        </div>
      </div>
      <div className="flex justify-end">
        <Skeleton className="w-1/2 h-12 rounded-2xl rounded-tr-sm" />
      </div>
    </div>
  );
}

