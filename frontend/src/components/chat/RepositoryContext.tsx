import React from 'react';
import { Repository } from '@/types';
import { RepositoryStatusBadge } from '@/components/repository/RepositoryStatus';
import {
  GitBranch,
  FileCode,
  Layers,
  Clock,
  ExternalLink,
  Code2,
  FolderGit2,
} from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils';

interface RepositoryContextProps {
  repository: Repository;
}

export const RepositoryContext: React.FC<RepositoryContextProps> = ({ repository }) => {
  return (
    <div className="w-full h-full flex flex-col select-none p-3.5 sm:p-4 overflow-y-auto scrollbar-thin">
      <div className="flex items-center gap-1.5 pb-2.5 border-b border-border/70">
        <FolderGit2 className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
          Repository Context
        </h3>
      </div>

      {/* Repo details */}
      <div className="mt-3.5 space-y-3.5">
        <div>
          <div className="text-[11px] font-medium text-muted-foreground">Repository</div>
          <div className="font-semibold text-xs sm:text-sm text-foreground truncate mt-0.5">
            {repository.fullName}
          </div>
        </div>

        {repository.description && (
          <div>
            <div className="text-[11px] font-medium text-muted-foreground">Description</div>
            <p className="text-xs text-foreground/80 mt-0.5 leading-relaxed line-clamp-3">
              {repository.description}
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-border/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status</span>
            <RepositoryStatusBadge status={repository.indexStatus} size="sm" />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
              Branch
            </span>
            <span className="font-mono font-medium text-foreground">
              {repository.defaultBranch || 'main'}
            </span>
          </div>

          {repository.language && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
                Language
              </span>
              <span className="font-medium text-foreground">{repository.language}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
              Files
            </span>
            <span className="font-mono font-medium text-foreground">
              {formatNumber(repository.filesTotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              Chunks
            </span>
            <span className="font-mono font-medium text-foreground">
              {formatNumber(repository.chunkCount)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              Indexed
            </span>
            <span className="font-mono text-foreground">
              {formatDate(repository.indexedAt)}
            </span>
          </div>
        </div>

        {/* GitHub link */}
        {repository.htmlUrl && (
          <div className="pt-4 border-t border-border/60">
            <a
              href={repository.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors"
            >
              <span>Open on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

