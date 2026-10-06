import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  Settings,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/auth/UserMenu';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onNavigate }) => {
  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      end: false,
    },
  ];

  return (
    <aside
      className={cn(
        'w-60 h-screen flex flex-col border-r border-border bg-card/70 backdrop-blur-md select-none',
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-13 flex items-center gap-2.5 px-4 border-b border-border/60">
        <div className="w-7.5 h-7.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-primary shadow-2xs shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-xs tracking-tight text-foreground flex items-center justify-between">
            <span className="truncate">DevPilot</span>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
              v1.0
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono truncate">Codebase Assistant</div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        <div>
          <div className="px-2.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Platform
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Tips / Info banner */}
        <div className="mx-1 p-2.5 rounded-lg border border-primary/20 bg-primary/5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
            <GitBranch className="w-3 h-3" />
            <span>GitHub Connected</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Index codebases to query logic with exact citations.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-medium"
          >
            GitHub portal <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Bottom Profile / User Menu */}
      <div className="p-2 border-t border-border/60">
        <UserMenu align="top" />
      </div>
    </aside>
  );
};
