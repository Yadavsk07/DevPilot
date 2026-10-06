import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { TopBar } from '@/components/layout/TopBar';
import { useOutletContext } from 'react-router-dom';
import {
  Sun,
  Moon,
  Laptop,
  Server,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { GithubIcon } from '@/components/common/GithubIcon';
import { API_BASE_URL } from '@/api/axiosClient';
import { Theme } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

export const SettingsPage: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu?: () => void }>() || {};
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/login-url`, {
        credentials: 'include',
      });
      if (res.ok) {
        setConnectionStatus('success');
        toast.success('Connection verified', 'DevPilot backend is reachable.');
      } else {
        setConnectionStatus('failed');
        toast.error('Connection test failed', `Backend returned status ${res.status}`);
      }
    } catch {
      setConnectionStatus('failed');
      toast.error('Connection test failed', 'Unable to reach backend endpoint.');
    } finally {
      setTestingConnection(false);
    }
  };

  const themeOptions: { value: Theme; title: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
    {
      value: 'dark',
      title: 'Dark Theme',
      desc: 'Deep neutral developer-tool palette (Default)',
      icon: Moon,
    },
    {
      value: 'light',
      title: 'Light Theme',
      desc: 'Clean high-contrast daytime interface',
      icon: Sun,
    },
    {
      value: 'system',
      title: 'System Preference',
      desc: 'Automatically synchronizes with your OS appearance',
      icon: Laptop,
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar
        title="Settings"
        subtitle="Manage appearance, accounts, and backend preferences."
        onToggleMobileMenu={openMobileMenu}
      />

      <div className="flex-1 p-4 sm:p-5 max-w-3xl mx-auto w-full space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Settings & Preferences
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure theme aesthetics, connected accounts, and system integration.
          </p>
        </div>

        {/* Theme Settings Card */}
        <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-sm space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select your interface color theme. Changes persist in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    'flex flex-col items-start p-3 rounded-lg border text-left transition-all relative',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border bg-card hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-primary/20 text-primary">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <span className="text-sm font-semibold text-foreground">{opt.title}</span>
                  <span className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* GitHub Account Card */}
        <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Connected GitHub Account</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Authentication and repository permissions are managed via GitHub OAuth2.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Connected
            </span>
          </div>

          {user && (
            <div className="flex items-center gap-3.5 p-3.5 rounded-lg border border-border bg-background/60">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.githubUsername}
                  className="w-10 h-10 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                  <GithubIcon className="w-5 h-5" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs sm:text-sm text-foreground truncate">
                  {user.displayName || user.githubUsername}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
                  @{user.githubUsername} · GitHub ID: {user.githubId}
                </div>
              </div>

              <a
                href={`https://github.com/${user.githubUsername}`}
                target="_blank"
                rel="noreferrer"
                className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-3xs"
              >
                <span>Profile</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            </div>
          )}
        </div>

        {/* Backend & Environment Card */}
        <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-2xs space-y-3.5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Backend & Environment</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              API base URL and session configuration.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-background/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
              <span className="font-mono text-muted-foreground text-[11px]">VITE_API_BASE_URL</span>
              <span className="font-mono font-medium text-foreground px-2 py-0.5 rounded bg-muted border border-border/60 text-[11px]">
                {API_BASE_URL}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs pt-2 border-t border-border/60">
              <span className="text-muted-foreground text-[11px]">OAuth Cookie Session</span>
              <span className="font-mono text-foreground text-[11px]">DEVPILOT_SESSION (HTTP-Only)</span>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="h-8 inline-flex items-center gap-2 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-all shadow-3xs disabled:opacity-50 select-none"
              >
                <Server className="w-3.5 h-3.5 text-primary" />
                <span>{testingConnection ? 'Testing...' : 'Test Backend Connection'}</span>
              </button>

              {connectionStatus === 'success' && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Backend Online
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
