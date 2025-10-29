import React, { createContext, useContext, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useErrorNotification } from '../hooks/useErrorNotification';
import { useNotificationSystem } from '../hooks/useNotificationSystem';
import { LoginRequest, AuthContextType, AuthProviderProps } from '../types';
import { ErrorNotification } from '../components/ErrorNotification';
import { NotificationSystem } from '../components/NotificationSystem';
import { AuthStatusIndicator } from '../components/AuthStatusIndicator';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component that wraps the existing useAuth hook
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  const errorNotification = useErrorNotification();
  const notificationSystem = useNotificationSystem();
  
  // Enhanced login with error handling
  const handleLogin = useCallback(async (credentials: LoginRequest, rememberMe?: boolean) => {
    try {
      await auth.login(credentials, rememberMe);
      errorNotification.clearError(); // Clear any previous errors on successful login
      
      // Show success notification after successful login
      if (auth.user) {
        notificationSystem.addAuthSuccess(`Welcome back, ${auth.user.merchantName || 'User'}!`);
      } else {
        notificationSystem.addAuthSuccess('Successfully logged in!');
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // Show error in both old and new notification systems for compatibility
      errorNotification.showAuthError(
        error instanceof Error ? error : new Error('Login failed'),
        () => handleLogin(credentials, rememberMe)
      );
      
      notificationSystem.addAuthError(
        error instanceof Error ? error : new Error('Login failed'),
        () => handleLogin(credentials, rememberMe)
      );
      
      throw error; // Re-throw to maintain existing error handling
    }
  }, [auth.login, auth.user, errorNotification, notificationSystem]);

  // Enhanced logout with error handling
  const handleLogout = useCallback(async () => {
    try {
      await auth.logout();
      errorNotification.clearError(); // Clear errors on logout
      
      // Show success notification after successful logout
      notificationSystem.addAuthSuccess('You have been logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Show error in both old and new notification systems for compatibility
      errorNotification.showAuthError(
        error instanceof Error ? error : new Error('Logout failed'),
        () => handleLogout()
      );
      
      notificationSystem.addAuthError(
        error instanceof Error ? error : new Error('Logout failed'),
        () => handleLogout()
      );
      
      // Don't re-throw logout errors as they should not prevent logout
    }
  }, [auth.logout, errorNotification, notificationSystem]);

  // Enhanced auth status check with error handling
  const checkAuthStatus = useCallback(async () => {
    try {
      if (auth.refetchUser) {
        await auth.refetchUser();
      }
      return auth.isAuthenticated;
    } catch (error) {
      console.error('Failed to check auth status:', error);
      errorNotification.showAuthError(
        error instanceof Error ? error : new Error('Failed to check authentication status'),
        () => checkAuthStatus()
      );
      return false;
    }
  }, [auth.refetchUser, auth.isAuthenticated, errorNotification]);
  
  // Map the existing useAuth hook to the AuthContext interface
  const contextValue: AuthContextType = {
    // State
    isAuthenticated: auth.isAuthenticated,
    user: auth.user as any || null,
    
    // Loading states
    isLoading: auth.isLoadingUser,
    isLoggingIn: auth.isLoggingIn,
    isLoggingOut: auth.isLoggingOut,
    
    // Error states
    error: auth.loginError?.message || auth.userError?.message || null,
    
    // Actions with enhanced error handling
    login: handleLogin,
    logout: handleLogout,
    clearError: () => {
      errorNotification.clearError();
      // Clear errors by refetching user data
      // This will reset the error state in the underlying queries
      if (auth.refetchUser) {
        auth.refetchUser();
      }
    },
    
    // Utilities
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      
      {/* Legacy error notification component for backward compatibility */}
      <ErrorNotification
        error={errorNotification.notification.error}
        type={errorNotification.notification.type}
        showRetry={errorNotification.notification.showRetry}
        onRetry={errorNotification.notification.onRetry}
        onDismiss={errorNotification.clearError}
      />
      
      {/* New comprehensive notification system */}
      <NotificationSystem
        notifications={notificationSystem.notifications}
        onDismiss={notificationSystem.dismissNotification}
        position="top-right"
        maxNotifications={3}
      />
      
      {/* Authentication status indicator for loading states */}
      <AuthStatusIndicator
        position="top-right"
        showOnlyDuringTransitions={true}
      />
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

// Export the context for testing purposes
export { AuthContext };