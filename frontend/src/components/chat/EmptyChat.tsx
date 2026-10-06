import React from 'react';
import { Sparkles, MessageSquare, ArrowRight } from 'lucide-react';

interface EmptyChatProps {
  repositoryName: string;
  onSelectPrompt: (prompt: string) => void;
}

export const EmptyChat: React.FC<EmptyChatProps> = ({
  repositoryName,
  onSelectPrompt,
}) => {
  const suggestions = [
    'Explain the project architecture and main modules',
    'How does authentication and authorization work?',
    'Where are the database entities and schemas configured?',
    'How does the API handle errors and validations?',
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-xl mx-auto my-auto select-none">
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/30 flex items-center justify-center text-primary mb-3.5 glow-primary">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>

      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
        Ask anything about <span className="text-primary">{repositoryName}</span>
      </h2>
      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
        DevPilot analyzes the indexed code to provide answers with source file and line citations.
      </p>

      {/* Suggested Prompts */}
      <div className="w-full mt-6 space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 text-left px-1">
          Suggested questions
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          {suggestions.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSelectPrompt(prompt)}
              className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border bg-card/60 hover:bg-muted/70 hover:border-primary/40 text-xs text-foreground transition-all duration-150 text-left shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                <span className="truncate text-xs font-medium">{prompt}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

