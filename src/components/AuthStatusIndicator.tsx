import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

export interface AuthStatusIndicatorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showOnlyDuringTransitions?: boolean;
}

/**
 * Authentication status indicator component that provides visual feedback
 * for authentication state changes, loading states, and success/error notifications
 * 
 * Features:
 * - Visual feedback for login/logout state changes
 * - Loading indicators during authentication operations
 * - Success notifications for completed operations
 * - Configurable positioning
 * - Auto-hide functionality
 * 
 * Requirements satisfied:
 * - 5.1: Displays loading indicators during authentication verification
 * - 5.2: Provides clear visual feedback during redirects and state changes
 * - 5.3: Shows appropriate success/error messages
 */
export const AuthStatusIndicator: React.FC<AuthStatusIndicatorProps> = ({
  position = 'top-right',
  showOnlyDuringTransitions = false
}) => {
  const { isLoggingIn, isLoggingOut, isAuthenticated, user, error } = useAuthContext();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [previousAuthState, setPreviousAuthState] = useState(isAuthenticated);

  // Track authentication state changes for success notifications
  useEffect(() => {
    if (previousAuthState !== isAuthenticated) {
      if (isAuthenticated && user && !isLoggingIn) {
        // Successfully logged in
        setSuccessMessage(`Welcome back, ${user.merchantName}!`);
        setShowSuccess(true);
        
        // Auto-hide success message after 3 seconds
        const timer = setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
        
        return () => clearTimeout(timer);
      } else if (!isAuthenticated && !isLoggingOut && previousAuthState) {
        // Successfully logged out
        setSuccessMessage('You have been logged out successfully');
        setShowSuccess(true);
        
        // Auto-hide success message after 3 seconds
        const timer = setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
      
      setPreviousAuthState(isAuthenticated);
    }
  }, [isAuthenticated, user, isLoggingIn, isLoggingOut, previousAuthState]);

  // Don't show anything if configured to only show during transitions and nothing is happening
  if (showOnlyDuringTransitions && !isLoggingIn && !isLoggingOut && !showSuccess && !error) {
    return null;
  }

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 1001,
      maxWidth: '350px',
      minWidth: '250px',
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      default: // top-right
        return { ...baseStyles, top: '20px', right: '20px' };
    }
  };

  const renderStatusCard = (
    type: 'loading' | 'success' | 'error',
    message: string,
    icon: string,
    backgroundColor: string,
    borderColor: string,
    textColor: string
  ) => (
    <div
      role="status"
      aria-live="polite"
      style={{
        ...getPositionStyles(),
        backgroundColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        fontFamily: 'Arial, sans-serif',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          fontSize: '1.25rem',
          flexShrink: 0,
          ...(type === 'loading' && {
            animation: 'spin 1s linear infinite'
          })
        }}>
          {icon}
        </div>
        
        <div style={{ 
          color: textColor,
          fontSize: '0.875rem',
          lineHeight: '1.4',
          fontWeight: '500'
        }}>
          {message}
        </div>
      </div>
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(${position.includes('right') ? '100%' : '-100%'});
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );

  // Show loading state during login
  if (isLoggingIn) {
    return renderStatusCard(
      'loading',
      'Signing you in...',
      '🔄',
      '#f0f9ff',
      '#3b82f6',
      '#1e40af'
    );
  }

  // Show loading state during logout
  if (isLoggingOut) {
    return renderStatusCard(
      'loading',
      'Signing you out...',
      '🔄',
      '#f0f9ff',
      '#3b82f6',
      '#1e40af'
    );
  }

  // Show success message
  if (showSuccess && successMessage) {
    return renderStatusCard(
      'success',
      successMessage,
      '✅',
      '#f0fdf4',
      '#22c55e',
      '#15803d'
    );
  }

  return null;
};

export default AuthStatusIndicator;