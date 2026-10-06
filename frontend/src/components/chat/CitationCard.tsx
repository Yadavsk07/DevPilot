import React, { useState } from 'react';
import { Citation, Repository } from '@/types';
import { FileCode, Copy, Check, ExternalLink } from 'lucide-react';

interface CitationCardProps {
  citation: Citation;
  repository?: Repository | null;
}

export const CitationCard: React.FC<CitationCardProps> = ({
  citation,
  repository,
}) => {
  const [copied, setCopied] = useState(false);

  const fileName = citation.filePath.split('/').pop() || citation.filePath;
  const lineRange =
    citation.startLine === citation.endLine
      ? `Line ${citation.startLine}`
      : `Lines ${citation.startLine}–${citation.endLine}`;

  const handleCopyPath = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(citation.filePath);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Construct GitHub line-link if repo htmlUrl & defaultBranch are known
  let githubUrl: string | null = null;
  if (repository?.htmlUrl) {
    const branch = repository.defaultBranch || 'main';
    const cleanRepoUrl = repository.htmlUrl.replace(/\/+$/, '');
    const cleanPath = citation.filePath.startsWith('/')
      ? citation.filePath.slice(1)
      : citation.filePath;

    githubUrl = `${cleanRepoUrl}/blob/${branch}/${cleanPath}#L${citation.startLine}-L${citation.endLine}`;
  }

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-card/70 hover:bg-muted/50 transition-colors text-xs group">
      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
          <FileCode className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="font-medium text-foreground truncate font-mono text-[11px]" title={citation.filePath}>
            {fileName}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-2 mt-0.5">
            <span>{lineRange}</span>
            <span className="truncate max-w-[140px] sm:max-w-xs text-muted-foreground/60" title={citation.filePath}>
              {citation.filePath}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleCopyPath}
          title="Copy file path"
          aria-label="Copy file path"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>

        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            title="View lines on GitHub"
            aria-label={`View ${fileName} lines ${lineRange} on GitHub`}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};

