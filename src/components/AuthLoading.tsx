import React from 'react';

interface AuthLoadingProps {
  message?: string;
  showProgress?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse';
}

export const AuthLoading: React.FC<AuthLoadingProps> = ({
  message = 'Verifying authentication...',
  showProgress = false,
  size = 'medium',
  variant = 'spinner'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const containerSizeClasses = {
    small: 'gap-2 text-sm',
    medium: 'gap-3 text-base',
    large: 'gap-4 text-lg'
  };

  const renderSpinner = () => (
    <div
      className={`${sizeClasses[size]} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1" role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${size === 'small' ? 'w-1 h-1' : size === 'medium' ? 'w-2 h-2' : 'w-3 h-3'} bg-blue-600 rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse opacity-75`}
      role="status"
      aria-label="Loading"
    />
  );

  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} text-gray-600`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {renderLoadingIndicator()}
      
      {message && (
        <span 
          className="text-center font-medium"
          id="loading-message"
        >
          {message}
        </span>
      )}
      
      {showProgress && (
        <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="bg-blue-600 h-1.5 rounded-full animate-pulse"
            style={{
              width: '60%',
              animation: 'progress 2s ease-in-out infinite'
            }}
            role="progressbar"
            aria-valuenow={60}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Authentication progress"
          />
        </div>
      )}
      
      {/* Screen reader only text */}
      <span className="sr-only">
        {message} Please wait while we verify your authentication.
      </span>
      
      <style>{`
        @keyframes progress {
          0% { width: 20%; }
          50% { width: 80%; }
          100% { width: 60%; }
        }
      `}</style>
    </div>
  );
};

// Preset configurations for common use cases
export const AuthLoadingPresets = {
  // For route protection checks
  routeCheck: (
    <AuthLoading 
      message="Checking access permissions..." 
      variant="spinner" 
      size="medium" 
    />
  ),
  
  // For login form submission
  loginProgress: (
    <AuthLoading 
      message="Signing you in..." 
      variant="dots" 
      size="small" 
      showProgress={true}
    />
  ),
  
  // For logout process
  logoutProgress: (
    <AuthLoading 
      message="Signing you out..." 
      variant="pulse" 
      size="small" 
    />
  ),
  
  // For token refresh
  tokenRefresh: (
    <AuthLoading 
      message="Refreshing session..." 
      variant="spinner" 
      size="small" 
    />
  ),
  
  // For full page loading
  fullPage: (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <AuthLoading 
        message="Loading application..." 
        variant="spinner" 
        size="large" 
        showProgress={true}
      />
    </div>
  )
};