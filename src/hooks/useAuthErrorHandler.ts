import { useState, useCallback, useRef } from 'react';
import { ApiError } from '../services/api';
import { useAuthContext } from '../contexts/AuthContext';

export interface AuthErrorState {
  error: string | null;
  isRetrying: boolean;
  retryCount: number;
  canRetry: boolean;
  lastRetryAt: number | null;
}

export interface AuthErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  autoRetry?: boolean;
  onError?: (error: Error) => void;
  onRetrySuccess?: () => void;
  onRetryFailure?: (error: Error) => void;
}

/**
 * Hook for handling authentication errors with retry mechanisms
 * 
 * Features:
 * - Automatic retry for transient errors
 * - Manual retry functionality
 * - Exponential backoff for retries
 * - Error state management
 * - Integration with AuthContext
 * 
 * Requirements satisfied:
 * - 5.3: Provides user-friendly error handling
 * - 5.4: Implements retry mechanisms for failed authentication
 */
export const useAuthErrorHandler = (options: AuthErrorHandlerOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    autoRetry = true,
    onError,
    onRetrySuccess,
    onRetryFailure,
  } = options;

  const { login, logout, checkAuthStatus } = useAuthContext();
  const retryTimeoutRef = useRef<number | null>(null);

  const [errorState, setErrorState] = useState<AuthErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    canRetry: true,
    lastRetryAt: null,
  });

  // Clear any pending retry timeout
  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    clearRetryTimeout();
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      canRetry: true,
      lastRetryAt: null,
    });
  }, [clearRetryTimeout]);

  // Get user-friendly error message
  const getErrorMessage = useCallback((error: Error): string => {
    if (error instanceof ApiError) {
      switch (error.code) {
        case 'NOT_AUTHENTICATED':
        case 'TOKEN_EXPIRED':
          return 'Your session has expired. Please log in again.';
        case 'INVALID_CREDENTIALS':
          return 'Invalid email or password. Please check your credentials and try again.';
        case 'NETWORK_ERROR':
          return 'Unable to connect to the server. Please check your internet connection and try again.';
        case 'TIMEOUT_ERROR':
          return 'The request timed out. Please try again.';
        case 'RATE_LIMITED':
          return 'Too many login attempts. Please wait a moment before trying again.';
        case 'ACCOUNT_LOCKED':
          return 'Your account has been temporarily locked. Please contact support.';
        case 'SERVER_ERROR':
          return 'A server error occurred. Please try again in a few moments.';
        default:
          if (error.status >= 500) {
            return 'A server error occurred. Please try again in a few moments.';
          }
          return error.message || 'An authentication error occurred.';
      }
    }
    
    // Handle network and generic errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    if (error.message.includes('timeout')) {
      return 'The request timed out. Please try again.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  }, []);

  // Check if error should be auto-retried
  const shouldAutoRetry = useCallback((error: Error): boolean => {
    if (error instanceof ApiError) {
      // Don't retry authentication errors that require user action
      if (['INVALID_CREDENTIALS', 'ACCOUNT_LOCKED', 'RATE_LIMITED'].includes(error.code)) {
        return false;
      }
      
      // Retry network errors and server errors
      return error.status === 0 || // Network error
             error.status >= 500 || // Server error
             error.code === 'NETWORK_ERROR' ||
             error.code === 'TIMEOUT_ERROR';
    }
    
    // Retry generic network errors
    return error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('timeout');
  }, []);

  // Handle authentication error
  const handleError = useCallback((error: Error) => {
    const errorMessage = getErrorMessage(error);
    const canRetry = shouldAutoRetry(error) && errorState.retryCount < maxRetries;
    
    console.error('Authentication error:', error);
    
    setErrorState(prev => ({
      ...prev,
      error: errorMessage,
      canRetry,
    }));

    // Call error callback
    if (onError) {
      onError(error);
    }

    // Auto-retry if enabled and conditions are met
    if (autoRetry && canRetry) {
      const delay = retryDelay * Math.pow(2, errorState.retryCount); // Exponential backoff
      
      console.log(`Auto-retrying in ${delay}ms (attempt ${errorState.retryCount + 1}/${maxRetries})`);
      
      retryTimeoutRef.current = setTimeout(() => {
        handleRetry();
      }, delay);
    }
  }, [
    getErrorMessage,
    shouldAutoRetry,
    errorState.retryCount,
    maxRetries,
    onError,
    autoRetry,
    retryDelay,
  ]);

  // Manual retry function
  const handleRetry = useCallback(async () => {
    if (errorState.retryCount >= maxRetries) {
      console.warn('Maximum retry attempts reached');
      return;
    }

    clearRetryTimeout();
    
    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
      lastRetryAt: Date.now(),
    }));

    try {
      // Attempt to check auth status to verify connection
      const isAuthenticated = await checkAuthStatus();
      
      if (isAuthenticated) {
        // Success - clear error state
        setErrorState({
          error: null,
          isRetrying: false,
          retryCount: 0,
          canRetry: true,
          lastRetryAt: null,
        });
        
        if (onRetrySuccess) {
          onRetrySuccess();
        }
      } else {
        throw new ApiError('Authentication check failed', 401, 'NOT_AUTHENTICATED');
      }
    } catch (error) {
      console.error('Retry failed:', error);
      
      const retryError = error instanceof Error ? error : new Error('Retry failed');
      const canRetryAgain = shouldAutoRetry(retryError) && errorState.retryCount < maxRetries;
      
      setErrorState(prev => ({
        ...prev,
        error: getErrorMessage(retryError),
        isRetrying: false,
        canRetry: canRetryAgain,
      }));

      if (onRetryFailure) {
        onRetryFailure(retryError);
      }

      // Schedule another retry if conditions are met
      if (autoRetry && canRetryAgain) {
        const delay = retryDelay * Math.pow(2, errorState.retryCount);
        
        retryTimeoutRef.current = setTimeout(() => {
          handleRetry();
        }, delay);
      }
    }
  }, [
    errorState.retryCount,
    maxRetries,
    clearRetryTimeout,
    checkAuthStatus,
    onRetrySuccess,
    shouldAutoRetry,
    getErrorMessage,
    onRetryFailure,
    autoRetry,
    retryDelay,
  ]);

  // Wrapper for login with error handling
  const loginWithErrorHandling = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    clearError();
    
    try {
      await login({ email, password }, rememberMe);
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Login failed');
      handleError(authError);
      throw authError; // Re-throw so calling code can handle it
    }
  }, [login, clearError, handleError]);

  // Wrapper for logout with error handling
  const logoutWithErrorHandling = useCallback(async () => {
    try {
      await logout();
      clearError();
    } catch (error) {
      console.error('Logout error:', error);
      // For logout, we usually want to clear auth state even if the API call fails
      clearError();
    }
  }, [logout, clearError]);

  // Force logout (for critical auth errors)
  const forceLogout = useCallback(() => {
    clearError();
    logoutWithErrorHandling();
  }, [clearError, logoutWithErrorHandling]);

  return {
    // Error state
    ...errorState,
    
    // Actions
    handleError,
    clearError,
    retry: handleRetry,
    
    // Enhanced auth methods
    loginWithErrorHandling,
    logoutWithErrorHandling,
    forceLogout,
    
    // Utilities
    getErrorMessage,
    shouldAutoRetry,
  };
};

export default useAuthErrorHandler;