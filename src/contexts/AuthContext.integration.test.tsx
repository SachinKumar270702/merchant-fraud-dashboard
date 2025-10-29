/**
 * Integration test to verify AuthContext works with the existing useAuth hook
 */
import React from 'react';
import { AuthProvider, useAuthContext } from './AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Simple test component to verify the context works
const TestAuthComponent: React.FC = () => {
  const auth = useAuthContext();
  
  return (
    <div>
      <div data-testid="auth-status">
        {auth.isAuthenticated ? 'authenticated' : 'not authenticated'}
      </div>
      <div data-testid="loading-status">
        {auth.isLoading ? 'loading' : 'not loading'}
      </div>
      <div data-testid="user-info">
        {auth.user ? auth.user.email : 'no user'}
      </div>
    </div>
  );
};

// Integration test setup
const IntegrationTest: React.FC = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default IntegrationTest;