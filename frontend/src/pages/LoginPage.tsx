import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoginButton } from '@/components/auth/LoginButton';
import {
  Sparkles,
  GitBranch,
  ShieldCheck,
  Zap,
  FileSearch,
  Bot,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oauthError = searchParams.get('error');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Left Column: Developer Showcase & Branding */}
      <div className="relative flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-10 border-b md:border-b-0 md:border-r border-border bg-gradient-to-b from-card/80 to-background overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-md glow-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
              DevPilot
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                v1.0
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              AI Codebase Assistant
            </div>
          </div>
        </div>

        {/* Hero Headline & Features */}
        <div className="relative z-10 my-8 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/80 border border-border text-[11px] font-medium text-foreground mb-4">
            <Zap className="w-3 h-3 text-primary" />
            <span>Next-generation RAG code assistant</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground leading-snug">
            Chat with your codebase. <br />
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-sky-400 bg-clip-text text-transparent">
              Trace logic with citations.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground mt-2.5 leading-relaxed">
            DevPilot connects directly to your GitHub repositories, indexes code into vector embeddings, and delivers answers with exact file and line references.
          </p>

          {/* Interactive terminal preview visual */}
          <div className="mt-5 rounded-lg border border-border/80 bg-zinc-950 text-zinc-300 p-3 font-mono text-[11px] shadow-xl space-y-1.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 text-[10px] text-zinc-500">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
              </div>
              <span>devpilot-terminal</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="text-primary font-bold">❯</span>
              <span>devpilot index --repo spring-boot-backend</span>
            </div>
            <div className="text-emerald-400 text-[10px]">
              ✔ Found 245 files · 684 semantic vectors generated
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 pt-0.5">
              <span className="text-primary font-bold">❯</span>
              <span>devpilot ask "How does auth token validation work?"</span>
            </div>
            <div className="text-zinc-300 text-[10px] pl-2 border-l border-primary/50">
              <span className="text-primary font-semibold">DevPilot:</span> Authentication is managed in <code className="text-sky-300">SecurityConfig.java:32-58</code> using GitHub OAuth2 session cookies.
            </div>
          </div>
        </div>

        {/* Feature bullets */}
        <div className="relative z-10 grid grid-cols-2 gap-3 pt-4 border-t border-border/60 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>GitHub OAuth Protected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileSearch className="w-3.5 h-3.5 text-primary" />
            <span>Source Code Citations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-primary" />
            <span>Branch-aware Context</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-primary" />
            <span>Token Streaming</span>
          </div>
        </div>
      </div>

      {/* Right Column: Sign In Card */}
      <div className="w-full md:w-[360px] lg:w-[400px] flex items-center justify-center p-6 sm:p-8 bg-card/40 backdrop-blur-xl">
        <div className="w-full max-w-xs space-y-5">
          <div className="space-y-1.5 text-center md:text-left">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Sign in to DevPilot
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Connect with your GitHub account to access your repositories and chat with codebases.
            </p>
          </div>

          {/* OAuth Failure Banner if redirected with error */}
          {oauthError && (
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs leading-relaxed space-y-0.5">
              <div className="font-semibold">Authentication Failed</div>
              <div>GitHub OAuth could not be completed. Please try again.</div>
            </div>
          )}

          {/* Sign in card */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-lg space-y-4">
            <LoginButton size="default" className="w-full" />

            <div className="relative flex items-center justify-center">
              <div className="border-t border-border w-full" />
              <span className="bg-card px-2.5 text-[10px] uppercase tracking-wider text-muted-foreground select-none">
                Secure Connection
              </span>
            </div>

            <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
              Your repositories stay connected through GitHub OAuth.
            </p>
          </div>

          <div className="text-center text-[10px] text-muted-foreground/70">
            DevPilot respects developer privacy. No client secrets are stored in the browser.
          </div>
        </div>
      </div>
    </div>
  );
};
