import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  LogOut,
  Sun,
  Moon,
  Laptop,
  Settings,
  ExternalLink,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Theme } from '@/types';

interface UserMenuProps {
  compact?: boolean;
  align?: 'bottom' | 'top';
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  compact = false,
  align = 'top',
  className,
}) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  const themeOptions: { value: Theme; label: string; icon: React.FC<{ className?: string }> }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User profile and menu"
        aria-expanded={isOpen}
        className={cn(
          'w-full flex items-center gap-2.5 p-1.5 rounded-lg text-left transition-all select-none',
          'hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
          isOpen ? 'bg-muted/70 border-border/80' : 'border border-transparent'
        )}
      >
        <div className="relative shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.githubUsername}
              className="w-7 h-7 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground border border-border">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background" />
        </div>

        {!compact && (
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-foreground truncate leading-tight">
              {user.displayName || user.githubUsername}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono truncate leading-tight mt-0.5">
              @{user.githubUsername}
            </div>
          </div>
        )}

        {!compact && (
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0',
              isOpen && 'rotate-180 text-foreground'
            )}
          />
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 w-64 p-1.5 rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl backdrop-blur-xl animate-fade-in',
            align === 'top' ? 'bottom-full mb-1.5 left-0 sm:left-auto sm:right-0' : 'top-full mt-1.5 right-0'
          )}
        >
          {/* Header Profile Info */}
          <div className="px-3 py-2.5 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.githubUsername}
                  className="w-8 h-8 rounded-full border border-border object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs text-foreground truncate">
                  {user.displayName || user.githubUsername}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                  github.com/{user.githubUsername}
                </div>
              </div>
            </div>
          </div>

          {/* Theme selector */}
          <div className="p-2 border-b border-border/60">
            <div className="px-1 mb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Theme
            </div>
            <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-muted/60 border border-border/40">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      'flex items-center justify-center gap-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition-all select-none',
                      isSelected
                        ? 'bg-card text-foreground shadow-xs border border-border/60 font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="p-1 space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors text-left"
            >
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Preferences</span>
            </button>

            <a
              href={`https://github.com/${user.githubUsername}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors text-left"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                <span>GitHub Profile</span>
              </span>
            </a>

            <div className="pt-1 border-t border-border/60 mt-1">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-50 text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isLoggingOut ? 'Logging out...' : 'Sign out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

