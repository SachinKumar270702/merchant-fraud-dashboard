import React, { useEffect, useState } from 'react';

export interface ErrorNotificationProps {
  error: string | null;
  onDismiss: () => void;
  autoHideDuration?: number;
  type?: 'error' | 'warning' | 'info';
  showRetry?: boolean;
  onRetry?: () => void;
}

/**
 * Error notification component for displaying user-friendly error messages
 * 
 * Features:
 * - Auto-hide functionality with configurable duration
 * - Different notification types (error, warning, info)
 * - Retry mechanism for recoverable errors
 * - Accessible design with proper ARIA labels
 * 
 * Requirements satisfied:
 * - 5.4: Displays appropriate error messages for authentication errors
 * - 5.3: Provides user-friendly error feedback
 */
export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onDismiss,
  autoHideDuration = 5000,
  type = 'error',
  showRetry = false,
  onRetry
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoHideDuration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoHideDuration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoHideDuration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300); // Wait for animation to complete
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    handleDismiss();
  };

  if (!error || !isVisible) {
    return null;
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          backgroundColor: '#fef3c7',
          borderColor: '#f59e0b',
          textColor: '#92400e',
          iconColor: '#f59e0b',
          icon: '⚠️'
        };
      case 'info':
        return {
          backgroundColor: '#dbeafe',
          borderColor: '#3b82f6',
          textColor: '#1e40af',
          iconColor: '#3b82f6',
          icon: 'ℹ️'
        };
      default: // error
        return {
          backgroundColor: '#fef2f2',
          borderColor: '#ef4444',
          textColor: '#dc2626',
          iconColor: '#ef4444',
          icon: '❌'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        maxWidth: '400px',
        backgroundColor: styles.backgroundColor,
        border: `1px solid ${styles.borderColor}`,
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ 
          fontSize: '1.25rem',
          color: styles.iconColor,
          flexShrink: 0
        }}>
          {styles.icon}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            color: styles.textColor,
            fontSize: '0.875rem',
            lineHeight: '1.4',
            marginBottom: showRetry ? '12px' : '0'
          }}>
            {error}
          </div>
          
          {showRetry && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={handleRetry}
                style={{
                  backgroundColor: styles.iconColor,
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={handleDismiss}
          aria-label="Dismiss notification"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: styles.textColor,
            cursor: 'pointer',
            fontSize: '1.25rem',
            padding: '0',
            lineHeight: '1',
            flexShrink: 0
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ErrorNotification;