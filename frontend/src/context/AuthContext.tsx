import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const {
    data: user = null,
    isLoading,
    isError,
    refetch,
  } = useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const u = await authApi.getMe();
        return u;
      } catch (err: unknown) {
        // If 401 or unauthorized, return null
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const login = useCallback(async () => {
    try {
      const { url } = await authApi.getLoginUrl();
      const redirectTarget = authApi.getDirectLoginRedirectUrl(url || '/oauth2/authorization/github');
      window.location.href = redirectTarget;
    } catch {
      window.location.href = authApi.getDirectLoginRedirectUrl('/oauth2/authorization/github');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear();
      window.location.href = '/login';
    }
  }, [queryClient]);

  const refetchUser = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isError,
        isAuthenticated: !!user,
        login,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

