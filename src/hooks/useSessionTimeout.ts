import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

interface UseSessionTimeoutOptions {
  warningThresholdMs?: number;
  onSessionExpired?: () => void;
  onWarningShown?: () => void;
  onWarningDismissed?: () => void;
}

export const useSessionTimeout = (options: UseSessionTimeoutOptions = {}) => {
  const {
    warningThresholdMs = 5 * 60 * 1000, // 5 minutes default
    onSessionExpired,
    onWarningShown,
    onWarningDismissed,
  } = options;

  const [showWarning, setShowWarning] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);
  const [isSessionExpiringSoon, setIsSessionExpiringSoon] = useState(false);

  const checkSessionStatus = useCallback(() => {
    if (!authService.isAuthenticated()) {
      setShowWarning(false);
      setTimeUntilExpiry(null);
      setIsSessionExpiringSoon(false);
      return;
    }

    const timeLeft = authService.getTimeUntilExpiry();
    setTimeUntilExpiry(timeLeft);

    if (timeLeft !== null) {
      const expiringSoon = timeLeft <= warningThresholdMs;
      setIsSessionExpiringSoon(expiringSoon);

      if (expiringSoon && !showWarning) {
        setShowWarning(true);
        onWarningShown?.();
      } else if (!expiringSoon && showWarning) {
        setShowWarning(false);
        onWarningDismissed?.();
      }

      // If session has expired
      if (timeLeft <= 0) {
        setShowWarning(false);
        onSessionExpired?.();
      }
    }
  }, [warningThresholdMs, showWarning, onSessionExpired, onWarningShown, onWarningDismissed]);

  const extendSession = useCallback(async () => {
    try {
      // Trigger a user activity by checking auth status
      await authService.getCurrentUser();
      setShowWarning(false);
      onWarningDismissed?.();
    } catch (error) {
      console.error('Failed to extend session:', error);
      // If extending fails, logout
      authService.logout();
    }
  }, [onWarningDismissed]);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    onWarningDismissed?.();
  }, [onWarningDismissed]);

  const logout = useCallback(() => {
    authService.logout();
    setShowWarning(false);
  }, []);

  useEffect(() => {
    // Check session status immediately
    checkSessionStatus();

    // Set up periodic checks
    const interval = setInterval(checkSessionStatus, 30000); // Check every 30 seconds

    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((authState) => {
      if (!authState.isAuthenticated) {
        setShowWarning(false);
        setTimeUntilExpiry(null);
        setIsSessionExpiringSoon(false);
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [checkSessionStatus]);

  return {
    showWarning,
    timeUntilExpiry,
    isSessionExpiringSoon,
    extendSession,
    dismissWarning,
    logout,
  };
};

export default useSessionTimeout;