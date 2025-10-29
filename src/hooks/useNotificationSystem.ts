import { useState, useCallback } from 'react';
import { Notification } from '../components/NotificationSystem';

/**
 * Hook for managing a comprehensive notification system
 * 
 * Features:
 * - Add notifications of different types (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Manual dismiss functionality
 * - Retry mechanism for recoverable errors
 * - Queue management for multiple notifications
 * 
 * Requirements satisfied:
 * - 5.1: Provides loading state and status feedback management
 * - 5.2: Enables clear visual feedback for state changes
 * - 5.3: Manages success/error message display
 */
export const useNotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: Notification['type'],
    message: string,
    options: {
      duration?: number;
      showRetry?: boolean;
      onRetry?: () => void;
      persistent?: boolean;
      id?: string;
    } = {}
  ) => {
    const notification: Notification = {
      id: options.id || `notification-${Date.now()}-${Math.random()}`,
      type,
      message,
      duration: options.duration,
      showRetry: options.showRetry || false,
      onRetry: options.onRetry,
      persistent: options.persistent || false,
    };

    setNotifications(prev => [...prev, notification]);
    return notification.id;
  }, []);

  const addSuccess = useCallback((message: string, options?: {
    duration?: number;
    persistent?: boolean;
    id?: string;
  }) => {
    return addNotification('success', message, {
      duration: options?.duration || 3000,
      persistent: options?.persistent,
      id: options?.id,
    });
  }, [addNotification]);

  const addError = useCallback((message: string, options?: {
    duration?: number;
    showRetry?: boolean;
    onRetry?: () => void;
    persistent?: boolean;
    id?: string;
  }) => {
    return addNotification('error', message, {
      duration: options?.duration || 5000,
      showRetry: options?.showRetry,
      onRetry: options?.onRetry,
      persistent: options?.persistent,
      id: options?.id,
    });
  }, [addNotification]);

  const addWarning = useCallback((message: string, options?: {
    duration?: number;
    showRetry?: boolean;
    onRetry?: () => void;
    persistent?: boolean;
    id?: string;
  }) => {
    return addNotification('warning', message, {
      duration: options?.duration || 4000,
      showRetry: options?.showRetry,
      onRetry: options?.onRetry,
      persistent: options?.persistent,
      id: options?.id,
    });
  }, [addNotification]);

  const addInfo = useCallback((message: string, options?: {
    duration?: number;
    persistent?: boolean;
    id?: string;
  }) => {
    return addNotification('info', message, {
      duration: options?.duration || 4000,
      persistent: options?.persistent,
      id: options?.id,
    });
  }, [addNotification]);

  const addAuthSuccess = useCallback((message: string) => {
    return addSuccess(message, {
      duration: 3000,
      id: 'auth-success', // Use consistent ID to replace existing auth success messages
    });
  }, [addSuccess]);

  const addAuthError = useCallback((error: Error, onRetry?: () => void) => {
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
      showRetry = false;
    } else if (error.message.includes('Invalid credentials')) {
      message = 'Invalid email or password. Please check your credentials and try again.';
      showRetry = false;
    } else if (error.message.includes('Not authenticated')) {
      message = 'You need to log in to access this feature.';
      showRetry = false;
    } else {
      message = 'An authentication error occurred. Please try again.';
      showRetry = true;
    }

    return addError(message, {
      showRetry: showRetry && !!onRetry,
      onRetry,
      id: 'auth-error', // Use consistent ID to replace existing auth error messages
    });
  }, [addError]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const dismissByType = useCallback((type: Notification['type']) => {
    setNotifications(prev => prev.filter(notification => notification.type !== type));
  }, []);

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id 
        ? { ...notification, ...updates }
        : notification
    ));
  }, []);

  const hasNotificationType = useCallback((type: Notification['type']) => {
    return notifications.some(notification => notification.type === type);
  }, [notifications]);

  const getNotificationCount = useCallback((type?: Notification['type']) => {
    if (type) {
      return notifications.filter(notification => notification.type === type).length;
    }
    return notifications.length;
  }, [notifications]);

  return {
    notifications,
    addNotification,
    addSuccess,
    addError,
    addWarning,
    addInfo,
    addAuthSuccess,
    addAuthError,
    dismissNotification,
    dismissAll,
    dismissByType,
    updateNotification,
    hasNotificationType,
    getNotificationCount,
  };
};

export default useNotificationSystem;