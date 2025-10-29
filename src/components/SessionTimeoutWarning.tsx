import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface SessionTimeoutWarningProps {
  warningThresholdMs?: number; // Show warning when this much time is left
  onExtendSession?: () => void;
  onLogout?: () => void;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  warningThresholdMs = 5 * 60 * 1000, // 5 minutes default
  onExtendSession,
  onLogout,
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const checkSessionTimeout = () => {
      const timeUntilExpiry = authService.getTimeUntilExpiry();
      
      if (timeUntilExpiry !== null && timeUntilExpiry > 0) {
        setTimeLeft(timeUntilExpiry);
        
        if (timeUntilExpiry <= warningThresholdMs && authService.isAuthenticated()) {
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      } else {
        setShowWarning(false);
        setTimeLeft(0);
      }
    };

    // Check immediately
    checkSessionTimeout();

    // Check every 30 seconds
    const interval = setInterval(checkSessionTimeout, 30000);

    return () => clearInterval(interval);
  }, [warningThresholdMs]);

  const handleExtendSession = () => {
    // Trigger a user activity to extend the session
    if (onExtendSession) {
      onExtendSession();
    }
    setShowWarning(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      authService.logout();
    }
    setShowWarning(false);
  };

  const formatTimeLeft = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Session Expiring Soon
            </h3>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Your session will expire in{' '}
            <span className="font-semibold text-red-600">
              {formatTimeLeft(timeLeft)}
            </span>
            . Would you like to extend your session?
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleExtendSession}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Extend Session
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;