import React, { useEffect, useState } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  showRetry?: boolean;
  onRetry?: () => void;
  persistent?: boolean;
}

export interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
}

/**
 * Comprehensive notification system for displaying various types of notifications
 * including success, error, warning, and info messages with auto-dismiss functionality
 * 
 * Features:
 * - Multiple notification types with distinct styling
 * - Auto-dismiss with configurable duration
 * - Manual dismiss functionality
 * - Retry mechanism for recoverable errors
 * - Stacking of multiple notifications
 * - Accessible design with proper ARIA labels
 * 
 * Requirements satisfied:
 * - 5.1: Displays loading indicators and status feedback
 * - 5.2: Provides clear visual feedback for state changes
 * - 5.3: Shows appropriate success/error messages
 */
export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss,
  position = 'top-right',
  maxNotifications = 5
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);

  // Track which notifications are visible for animation purposes
  useEffect(() => {
    const newVisible = notifications.map(n => n.id);
    setVisibleNotifications(newVisible);
  }, [notifications]);

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 1002,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      maxWidth: '400px',
      minWidth: '300px',
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px', flexDirection: 'column-reverse' as const };
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px', flexDirection: 'column-reverse' as const };
      default: // top-right
        return { ...baseStyles, top: '20px', right: '20px' };
    }
  };

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#f0fdf4',
          borderColor: '#22c55e',
          textColor: '#15803d',
          iconColor: '#22c55e',
          icon: '✅'
        };
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

  const handleDismiss = (id: string) => {
    setVisibleNotifications(prev => prev.filter(nId => nId !== id));
    setTimeout(() => {
      onDismiss(id);
    }, 300); // Wait for animation to complete
  };

  const handleRetry = (notification: Notification) => {
    if (notification.onRetry) {
      notification.onRetry();
    }
    handleDismiss(notification.id);
  };

  // Auto-dismiss notifications
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    notifications.forEach(notification => {
      if (!notification.persistent && notification.duration !== 0) {
        const duration = notification.duration || 5000;
        const timer = setTimeout(() => {
          handleDismiss(notification.id);
        }, duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications]);

  if (notifications.length === 0) {
    return null;
  }

  // Limit the number of visible notifications
  const displayedNotifications = notifications.slice(0, maxNotifications);

  return (
    <div style={getPositionStyles()}>
      <style>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
            max-height: 200px;
          }
          to {
            transform: translateX(${position.includes('right') ? '100%' : '-100%'});
            opacity: 0;
            max-height: 0;
          }
        }
      `}</style>
      
      {displayedNotifications.map(notification => {
        const styles = getNotificationStyles(notification.type);
        const isVisible = visibleNotifications.includes(notification.id);
        
        return (
          <div
            key={notification.id}
            role="alert"
            aria-live="polite"
            style={{
              backgroundColor: styles.backgroundColor,
              border: `1px solid ${styles.borderColor}`,
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              fontFamily: 'Arial, sans-serif',
              animation: isVisible 
                ? `slideInFrom${position.includes('right') ? 'Right' : 'Left'} 0.3s ease-out`
                : 'slideOut 0.3s ease-in forwards',
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
                  marginBottom: notification.showRetry ? '12px' : '0'
                }}>
                  {notification.message}
                </div>
                
                {notification.showRetry && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={() => handleRetry(notification)}
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
                onClick={() => handleDismiss(notification.id)}
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
      })}
    </div>
  );
};

export default NotificationSystem;