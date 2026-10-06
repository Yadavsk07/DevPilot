import React from 'react';
import { Citation, Repository } from '@/types';
import { CitationCard } from './CitationCard';
import { BookOpen } from 'lucide-react';

interface CitationListProps {
  citations: Citation[];
  repository?: Repository | null;
}

export const CitationList: React.FC<CitationListProps> = ({
  citations,
  repository,
}) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3.5 pt-3 border-t border-border/60">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-2 select-none">
        <BookOpen className="w-3.5 h-3.5 text-primary" />
        <span>Sources ({citations.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {citations.map((c, i) => (
          <CitationCard
            key={`${c.filePath}-${c.startLine}-${c.endLine}-${i}`}
            citation={c}
            repository={repository}
          />
        ))}
      </div>
    </div>
  );
};

