import React, { useState } from 'react';
import { AuthStatusIndicator } from './AuthStatusIndicator';
import { NotificationSystem } from './NotificationSystem';
import { LoadingOverlay } from './LoadingOverlay';
import { useNotificationSystem } from '../hooks/useNotificationSystem';

/**
 * Demo component to showcase authentication status indicators
 * This component demonstrates all the authentication status features implemented
 * 
 * Features demonstrated:
 * - Loading overlays with different configurations
 * - Success/error notifications
 * - Authentication status indicators
 * - Notification system with different types
 */
export const AuthStatusDemo: React.FC = () => {
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [overlayBackdrop, setOverlayBackdrop] = useState(false);
  
  const {
    notifications,
    addSuccess,
    addError,
    addWarning,
    addInfo,
    addAuthSuccess,
    addAuthError,
    dismissNotification,
    dismissAll,
  } = useNotificationSystem();

  const simulateLoading = (message: string, duration: number = 2000) => {
    setLoadingMessage(message);
    setShowLoadingOverlay(true);
    setTimeout(() => {
      setShowLoadingOverlay(false);
    }, duration);
  };

  const simulateAuthError = () => {
    const errors = [
      new Error('Invalid credentials'),
      new Error('Network connection failed'),
      new Error('Authentication expired'),
      new Error('Server timeout'),
    ];
    const randomError = errors[Math.floor(Math.random() * errors.length)];
    addAuthError(randomError, () => {
      addInfo('Retry attempted!');
    });
  };

  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ marginBottom: '2rem', color: '#1f2937' }}>
        Authentication Status Indicators Demo
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Loading Overlay Controls */}
        <div style={{ 
          padding: '1.5rem', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px',
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Loading Overlays</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={overlayBackdrop}
                onChange={(e) => setOverlayBackdrop(e.target.checked)}
              />
              Show backdrop
            </label>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => simulateLoading('Signing you in...', 3000)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Simulate Login Loading
            </button>
            
            <button
              onClick={() => simulateLoading('Signing you out...', 2000)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Simulate Logout Loading
            </button>
            
            <button
              onClick={() => simulateLoading('Checking authentication...', 1500)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Simulate Auth Check
            </button>
          </div>
        </div>

        {/* Notification Controls */}
        <div style={{ 
          padding: '1.5rem', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px',
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Notifications</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => addAuthSuccess('Welcome back, John Doe!')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Show Login Success
            </button>
            
            <button
              onClick={() => addAuthSuccess('You have been logged out successfully')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Show Logout Success
            </button>
            
            <button
              onClick={simulateAuthError}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Show Auth Error
            </button>
            
            <button
              onClick={() => addWarning('Your session will expire in 5 minutes')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Show Session Warning
            </button>
            
            <button
              onClick={() => addInfo('Authentication status updated')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Show Info Message
            </button>
          </div>
        </div>
      </div>

      {/* Notification Management */}
      <div style={{ 
        padding: '1.5rem', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px',
        backgroundColor: '#f9fafb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>
          Notification Management ({notifications.length} active)
        </h3>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={dismissAll}
            disabled={notifications.length === 0}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: notifications.length === 0 ? '#9ca3af' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: notifications.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Dismiss All
          </button>
        </div>
        
        {notifications.length > 0 && (
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Active notifications:
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              {notifications.map(notification => (
                <li key={notification.id} style={{ marginBottom: '0.25rem' }}>
                  <span style={{ 
                    color: notification.type === 'error' ? '#dc2626' : 
                           notification.type === 'success' ? '#059669' :
                           notification.type === 'warning' ? '#d97706' : '#2563eb'
                  }}>
                    [{notification.type.toUpperCase()}]
                  </span> {notification.message}
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.125rem 0.25rem',
                      fontSize: '0.75rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Feature Description */}
      <div style={{ 
        padding: '1.5rem', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px',
        backgroundColor: '#f0f9ff'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#1e40af' }}>
          ✅ Implemented Features (Task 9)
        </h3>
        
        <ul style={{ color: '#374151', lineHeight: '1.6' }}>
          <li><strong>Visual feedback for authentication state changes:</strong> Success/error notifications appear automatically during login/logout operations</li>
          <li><strong>Loading states during login/logout:</strong> Loading overlays and indicators show progress during authentication operations</li>
          <li><strong>Success/error notifications:</strong> Comprehensive notification system with different types (success, error, warning, info)</li>
          <li><strong>Auto-dismiss functionality:</strong> Notifications automatically disappear after configurable durations</li>
          <li><strong>Retry mechanisms:</strong> Error notifications include retry buttons for recoverable errors</li>
          <li><strong>Accessible design:</strong> All components include proper ARIA labels and screen reader support</li>
          <li><strong>Configurable positioning:</strong> Notifications and indicators can be positioned in different screen locations</li>
        </ul>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={showLoadingOverlay}
        message={loadingMessage}
        backdrop={overlayBackdrop}
        size="medium"
      />

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
        position="top-right"
        maxNotifications={5}
      />
    </div>
  );
};

export default AuthStatusDemo;