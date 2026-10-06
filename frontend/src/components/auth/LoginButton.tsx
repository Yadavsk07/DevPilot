import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { GithubIcon } from '@/components/common/GithubIcon';
import { cn } from '@/lib/utils';

interface LoginButtonProps {
  className?: string;
  size?: 'default' | 'lg';
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  className,
  size = 'default',
}) => {
  const { login } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleClick = async () => {
    try {
      setIsRedirecting(true);
      await login();
    } catch {
      setIsRedirecting(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isRedirecting}
      className={cn(
        'inline-flex items-center justify-center gap-2.5 font-semibold transition-all duration-150 select-none rounded-xl shadow-xs',
        'bg-[#24292F] hover:bg-[#1a1f24] text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:opacity-70 disabled:cursor-not-allowed',
        size === 'lg' ? 'px-5 py-3 text-sm sm:text-base w-full' : 'h-10 px-4 text-xs sm:text-sm',
        className
      )}
    >
      {isRedirecting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirecting to GitHub...</span>
        </>
      ) : (
        <>
          <GithubIcon className="w-4 h-4 fill-current" />
          <span>Continue with GitHub</span>
        </>
      )}
    </button>
  );
};

