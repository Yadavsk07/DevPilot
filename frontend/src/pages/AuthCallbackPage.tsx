import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/authApi';
import { useQueryClient } from '@tanstack/react-query';
import { Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { refetchUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const verifyAuth = async () => {
    try {
      setError(null);
      // Fetch user profile from /api/auth/me
      const user = await authApi.getMe();
      if (user && user.id) {
        queryClient.setQueryData(['currentUser'], user);
        await refetchUser();
        toast.success(`Welcome back, ${user.displayName || user.githubUsername}!`);
        navigate('/', { replace: true });
      } else {
        throw new Error('Unable to verify user profile from session.');
      }
    } catch (err: any) {
      console.error('Auth verification error:', err);
      const detail = err.response?.data?.message || err.message || 'Authentication failed. Please sign in again.';
      setError(detail);
      toast.error('Authentication Error', detail);
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card shadow-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white mx-auto mb-5 shadow-md glow-primary">
          <Sparkles className="w-6 h-6" />
        </div>

        {error ? (
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Authentication Failed</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={verifyAuth}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry verification</span>
              </button>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="w-full px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Return to Login
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Completing Authentication
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verifying your GitHub credentials and setting up your DevPilot workspace...
            </p>
            <div className="flex items-center justify-center gap-2 py-4 text-xs font-mono text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting session...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

