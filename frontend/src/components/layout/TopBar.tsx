import React from 'react';
import { Menu, Sun, Moon, Laptop, RefreshCw } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { UserMenu } from '@/components/auth/UserMenu';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onToggleMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  onRefresh,
  isRefreshing,
  onToggleMobileMenu,
}) => {
  const { theme, setTheme, actualTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const ThemeIcon = actualTheme === 'dark' ? Moon : Sun;

  return (
    <header className="h-13 px-4 md:px-6 border-b border-border/80 bg-background/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label="Open mobile navigation menu"
            className="md:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="min-w-0 max-w-[200px] sm:max-w-none">
          {title && (
            <h1 className="text-sm font-semibold text-foreground tracking-tight truncate">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="hidden sm:block text-[11px] text-muted-foreground truncate -mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh repositories"
            title="Refresh repositories"
            className="h-8 flex items-center gap-1.5 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-all shadow-2xs disabled:opacity-50 select-none"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : 'text-muted-foreground'}`}
            />
            <span className="hidden sm:inline">
              {isRefreshing ? 'Syncing...' : 'Sync Repos'}
            </span>
          </button>
        )}

        {/* Quick Theme Toggle */}
        <button
          onClick={cycleTheme}
          aria-label={`Current theme: ${theme}. Click to switch theme.`}
          title={`Theme: ${theme}`}
          className="h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors inline-flex items-center justify-center shadow-2xs"
        >
          {theme === 'system' ? (
            <Laptop className="w-3.5 h-3.5" />
          ) : (
            <ThemeIcon className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Topbar User Menu on mobile */}
        <div className="md:hidden">
          <UserMenu compact align="bottom" />
        </div>
      </div>
    </header>
  );
};
