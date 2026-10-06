import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text' }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const cleanLang = (language || 'text').toLowerCase().replace(/^language-/, '');
  let highlighted = code;
  try {
    const grammar = Prism.languages[cleanLang] || Prism.languages.javascript || (Prism.languages as any).text;
    if (grammar) {
      highlighted = Prism.highlight(code, grammar, cleanLang);
    }
  } catch {
    highlighted = code;
  }

  return (
    <div className="relative my-2.5 rounded-xl overflow-hidden border border-border/80 bg-zinc-950 text-zinc-100 text-xs font-mono group shadow-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 select-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {cleanLang || 'code'}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium text-[10px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="p-3 sm:p-3.5 overflow-x-auto leading-relaxed scrollbar-thin text-[11px] sm:text-xs">
        <code
          className={`language-${cleanLang}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
};

