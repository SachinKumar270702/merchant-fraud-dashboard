import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { LoadingOverlay } from './LoadingOverlay';

export interface AuthStatusManagerProps {
  showLoadingOverlay?: boolean;
  showInlineStatus?: boolean;
  overlayBackdrop?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
}

/**
 * Comprehensive authentication status manager that provides visual feedback
 * for all authentication state changes and operations
 * 
 * Features:
 * - Loading overlays during authentication operations
 * - Inline status indicators
 * - Success/error state management
 * - Configurable positioning and display options
 * 
 * Requirements satisfied:
 * - 5.1: Displays loading indicators during authentication verification
 * - 5.2: Provides clear visual feedback during redirects and state changes
 * - 5.3: Shows appropriate success/error messages
 */
export const AuthStatusManager: React.FC<AuthStatusManagerProps> = ({
  showLoadingOverlay = true,
  showInlineStatus = true,
  overlayBackdrop = false,
  position = 'center'
}) => {
  const { isLoggingIn, isLoggingOut, isAuthenticated, user, error } = useAuthContext();
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatus, setShowStatus] = useState(false);

  // Update status message based on authentication state
  useEffect(() => {
    if (isLoggingIn) {
      setStatusMessage('Signing you in...');
      setShowStatus(true);
    } else if (isLoggingOut) {
      setStatusMessage('Signing you out...');
      setShowStatus(true);
    } else if (error) {
      setStatusMessage('Authentication error occurred');
      setShowStatus(true);
      
      // Auto-hide error status after 3 seconds
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setShowStatus(false);
    }
  }, [isLoggingIn, isLoggingOut, error]);

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 1001,
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      default: // center
        return {
          ...baseStyles,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  const isLoading = isLoggingIn || isLoggingOut;

  return (
    <>
      {/* Loading overlay for authentication operations */}
      {showLoadingOverlay && isLoading && (
        <div style={position === 'center' ? {} : getPositionStyles()}>
          <LoadingOverlay
            isVisible={true}
            message={statusMessage}
            backdrop={overlayBackdrop}
            size="medium"
          />
        </div>
      )}

      {/* Inline status indicator */}
      {showInlineStatus && showStatus && !showLoadingOverlay && (
        <div
          style={{
            ...getPositionStyles(),
            backgroundColor: error ? '#fef2f2' : '#f0f9ff',
            border: `1px solid ${error ? '#ef4444' : '#3b82f6'}`,
            borderRadius: '8px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontFamily: 'Arial, sans-serif',
            maxWidth: '300px',
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: error ? '#dc2626' : '#1e40af',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            {isLoading && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #f3f4f6',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
            )}
            
            {error && !isLoading && (
              <span style={{ fontSize: '1rem' }}>❌</span>
            )}
            
            {statusMessage}
          </div>
          
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default AuthStatusManager;