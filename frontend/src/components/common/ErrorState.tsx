import React from 'react';
import { AlertCircle, RefreshCw, ShieldAlert, FileQuestion, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  status?: number;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  status,
  onRetry,
  className,
}) => {
  let displayTitle = title;
  let displayMessage = message;
  let Icon = AlertCircle;

  if (status === 401) {
    Icon = ShieldAlert;
    displayTitle = displayTitle || 'Session Expired';
    displayMessage = displayMessage || 'Please sign in again to access DevPilot.';
  } else if (status === 403) {
    Icon = ShieldAlert;
    displayTitle = displayTitle || 'Access Denied';
    displayMessage = displayMessage || "You do not have permission to access this repository.";
  } else if (status === 404) {
    Icon = FileQuestion;
    displayTitle = displayTitle || 'Not Found';
    displayMessage = displayMessage || "The requested resource could not be found.";
  } else if (status === 500) {
    Icon = AlertCircle;
    displayTitle = displayTitle || 'Something went wrong';
    displayMessage = displayMessage || 'DevPilot backend encountered an unexpected error. Please try again.';
  } else if (message?.toLowerCase().includes('network') || !status) {
    if (!status && message?.toLowerCase().includes('network')) {
      Icon = WifiOff;
      displayTitle = displayTitle || 'Unable to connect to DevPilot';
      displayMessage = displayMessage || 'Please ensure the backend is running at http://localhost:8080 and try again.';
    }
  }

  displayTitle = displayTitle || 'Something went wrong';
  displayMessage = displayMessage || 'An unexpected error occurred. Please try again.';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-destructive/20 bg-destructive/5 max-w-lg mx-auto',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-foreground tracking-tight">{displayTitle}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">{displayMessage}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
};

