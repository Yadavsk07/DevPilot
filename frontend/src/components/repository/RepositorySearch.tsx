import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface RepositorySearchProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export const RepositorySearch: React.FC<RepositorySearchProps> = ({
  query,
  onQueryChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative flex-1 w-full sm:max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
        <Search className="w-3.5 h-3.5" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search repositories by name, description, or language..."
        className="w-full pl-9 pr-10 h-8.5 text-xs bg-card border border-border rounded-lg placeholder:text-muted-foreground/60 text-foreground transition-all shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
      />

      <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
        {query ? (
          <button
            onClick={() => onQueryChange('')}
            aria-label="Clear search input"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border/80 rounded shadow-3xs select-none">
            /
          </kbd>
        )}
      </div>
    </div>
  );
};
