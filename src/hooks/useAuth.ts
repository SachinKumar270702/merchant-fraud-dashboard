import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { LoginRequest, User } from '../types';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authState = authService.isAuthenticated();
    console.log('🔐 Initial auth state:', authState);
    return authState;
  });

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authService.subscribe((authState) => {
      setIsAuthenticated(authState.isAuthenticated);
      if (authState.user) {
        queryClient.setQueryData(['user'], authState.user);
      } else {
        queryClient.removeQueries({ queryKey: ['user'] });
      }
    });

    // Restore auth state on mount
    authService.restoreAuthState().then((authState) => {
      setIsAuthenticated(authState.isAuthenticated);
      if (authState.user) {
        queryClient.setQueryData(['user'], authState.user);
      }
    });

    return unsubscribe;
  }, [queryClient]);

  // Login mutation with enhanced persistence options
  const loginMutation = useMutation({
    mutationFn: ({ credentials, rememberMe }: { credentials: LoginRequest; rememberMe?: boolean }) => 
      authService.login(credentials, { rememberMe }),
    onSuccess: (data) => {
      setIsAuthenticated(true);
      // Cache user data
      queryClient.setQueryData(['user'], data.user);
    },
    onError: (error) => {
      setIsAuthenticated(false);
      console.error('Login failed:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      setIsAuthenticated(false);
      // Clear all cached data
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      setIsAuthenticated(false);
      queryClient.clear();
    },
  });

  // Current user query
  const userQuery = useQuery<User>({
    queryKey: ['user'],
    queryFn: () => {
      console.log('🔍 Fetching current user...');
      return authService.getCurrentUser();
    },
    enabled: isAuthenticated,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,

  });

  return {
    // State
    isAuthenticated,
    user: userQuery.data,
    
    // Loading states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isLoadingUser: userQuery.isLoading,
    
    // Error states
    loginError: loginMutation.error,
    userError: userQuery.error,
    
    // Actions
    login: (credentials: LoginRequest, rememberMe?: boolean) => 
      loginMutation.mutate({ credentials, rememberMe }),
    logout: logoutMutation.mutate,
    
    // Utilities
    refetchUser: userQuery.refetch,
    
    // Enhanced auth utilities
    getTimeUntilExpiry: () => authService.getTimeUntilExpiry(),
    isSessionExpiringSoon: () => authService.isSessionExpiringSoon(),
    getAuthState: () => authService.getAuthState(),
  };
};