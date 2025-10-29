import React from 'react';

export interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  backdrop?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Loading overlay component for displaying loading states with optional backdrop
 * 
 * Features:
 * - Configurable loading spinner sizes
 * - Optional backdrop for modal-like behavior
 * - Customizable loading messages
 * - Accessible design with proper ARIA labels
 * 
 * Requirements satisfied:
 * - 5.1: Displays loading indicators during authentication verification
 * - 5.2: Provides clear visual feedback during state changes
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  backdrop = false,
  size = 'medium'
}) => {
  if (!isVisible) {
    return null;
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: '24px', height: '24px', borderWidth: '2px' };
      case 'large':
        return { width: '48px', height: '48px', borderWidth: '4px' };
      default: // medium
        return { width: '32px', height: '32px', borderWidth: '3px' };
    }
  };

  const sizeStyles = getSizeStyles();

  const spinnerStyle = {
    ...sizeStyles,
    border: `${sizeStyles.borderWidth} solid #f3f4f6`,
    borderTop: `${sizeStyles.borderWidth} solid #3b82f6`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const overlayContent = (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '24px',
        backgroundColor: backdrop ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        borderRadius: backdrop ? '8px' : '0',
        boxShadow: backdrop ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
      }}
    >
      <div style={spinnerStyle} />
      
      {message && (
        <div style={{
          color: '#374151',
          fontSize: '0.875rem',
          fontWeight: '500',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif'
        }}>
          {message}
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (backdrop) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1003,
        }}
      >
        {overlayContent}
      </div>
    );
  }

  return overlayContent;
};

export default LoadingOverlay;