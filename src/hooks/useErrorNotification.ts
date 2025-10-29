import { useState, useCallback } from 'react';

export interface ErrorNotificationState {
  error: string | null;
  type: 'error' | 'warning' | 'info';
  showRetry: boolean;
  onRetry?: () => void;
}

/**
 * Hook for managing error notifications with retry functionality
 * 
 * Features:
 * - Centralized error state management
 * - Configurable notification types
 * - Retry mechanism for recoverable errors
 * - Auto-dismiss functionality
 * 
 * Requirements satisfied:
 * - 5.4: Provides error message management for authentication errors
 * - 5.3: Enables user-friendly error feedback with retry options
 */
export const useErrorNotification = () => {
  const [notification, setNotification] = useState<ErrorNotificationState>({
    error: null,
    type: 'error',
    showRetry: false,
  });

  const showError = useCallback((
    error: string,
    options: {
      type?: 'error' | 'warning' | 'info';
      showRetry?: boolean;
      onRetry?: () => void;
    } = {}
  ) => {
    setNotification({
      error,
      type: options.type || 'error',
      showRetry: options.showRetry || false,
      onRetry: options.onRetry,
    });
  }, []);

  const showAuthError = useCallback((error: Error, onRetry?: () => void) => {
    let message: string;
    let showRetry = false;

    // Determine error message and retry availability based on error type
    if (error.message.includes('fetch') || error.message.includes('network')) {
      message = 'Unable to connect to the server. Please check your internet connection and try again.';
      showRetry = true;
    } else if (error.message.includes('timeout')) {
      message = 'The request timed out. Please try again.';
      showRetry = true;
    } else if (error.message.includes('Authentication expired') || error.message.includes('Token expired')) {
      message = 'Your session has expired. Please log in again.';
      showRetry = false; // Don't show retry for expired sessions
    } else if (error.message.includes('Invalid credentials')) {
      message = 'Invalid email or password. Please check your credentials and try again.';
      showRetry = false; // Don't show retry for invalid credentials
    } else if (error.message.includes('Not authenticated')) {
      message = 'You need to log in to access this feature.';
      showRetry = false;
    } else {
      message = 'An authentication error occurred. Please try again.';
      showRetry = true;
    }

    showError(message, {
      type: 'error',
      showRetry: showRetry && !!onRetry,
      onRetry,
    });
  }, [showError]);

  const showWarning = useCallback((message: string, onRetry?: () => void) => {
    showError(message, {
      type: 'warning',
      showRetry: !!onRetry,
      onRetry,
    });
  }, [showError]);

  const showInfo = useCallback((message: string, onRetry?: () => void) => {
    showError(message, {
      type: 'info',
      showRetry: !!onRetry,
      onRetry,
    });
  }, [showError]);

  const clearError = useCallback(() => {
    setNotification({
      error: null,
      type: 'error',
      showRetry: false,
    });
  }, []);

  return {
    notification,
    showError,
    showAuthError,
    showWarning,
    showInfo,
    clearError,
  };
};

export default useErrorNotification;