import React, { Component, ReactNode } from 'react';
import { ApiError } from '../services/api';

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error boundary specifically designed for authentication-related errors
 * 
 * Features:
 * - Catches authentication errors and provides user-friendly fallback UI
 * - Automatic retry mechanism for transient auth failures
 * - Customizable error display and retry behavior
 * - Logging and error reporting capabilities
 * 
 * Requirements satisfied:
 * - 5.3: Implements proper error boundaries for auth failures
 * - 5.4: Provides user-friendly error messages and retry mechanisms
 */
export class AuthErrorBoundary extends Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging and monitoring
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry for certain types of errors
    this.handleAutoRetry(error);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private handleAutoRetry = (error: Error) => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    // Only auto-retry for network errors or temporary auth issues
    const shouldAutoRetry = this.shouldAutoRetry(error) && retryCount < maxRetries;

    if (shouldAutoRetry) {
      // Exponential backoff: 1s, 2s, 4s
      const retryDelay = Math.pow(2, retryCount) * 1000;
      
      console.log(`Auto-retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, retryDelay);
    }
  };

  private shouldAutoRetry = (error: Error): boolean => {
    // Auto-retry for network errors and temporary server issues
    if (error instanceof ApiError) {
      return error.status === 0 || // Network error
             error.status >= 500 || // Server error
             error.code === 'NETWORK_ERROR' ||
             error.code === 'TIMEOUT_ERROR';
    }
    
    // Auto-retry for generic network errors
    return error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('timeout');
  };

  private handleRetry = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0, // Reset retry count for manual retries
    });
  };

  private getErrorMessage = (error: Error): string => {
    if (error instanceof ApiError) {
      switch (error.code) {
        case 'NOT_AUTHENTICATED':
          return 'Your session has expired. Please log in again.';
        case 'TOKEN_EXPIRED':
          return 'Your session has expired. Please log in again.';
        case 'INVALID_CREDENTIALS':
          return 'Invalid email or password. Please check your credentials and try again.';
        case 'NETWORK_ERROR':
          return 'Unable to connect to the server. Please check your internet connection and try again.';
        case 'TIMEOUT_ERROR':
          return 'The request timed out. Please try again.';
        default:
          if (error.status >= 500) {
            return 'A server error occurred. Please try again in a few moments.';
          }
          return error.message || 'An authentication error occurred.';
      }
    }
    
    // Generic error messages
    if (error.message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  private renderDefaultFallback = (error: Error, retry: () => void) => {
    const { retryCount } = this.state;
    const { maxRetries = 3 } = this.props;
    const errorMessage = this.getErrorMessage(error);
    const canRetry = retryCount < maxRetries;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '2rem',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '1rem',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem',
          color: '#dc2626'
        }}>
          ⚠️
        </div>
        
        <h2 style={{ 
          color: '#dc2626', 
          marginBottom: '1rem',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          Authentication Error
        </h2>
        
        <p style={{ 
          color: '#7f1d1d', 
          marginBottom: '1.5rem',
          fontSize: '1rem',
          lineHeight: '1.5',
          maxWidth: '500px'
        }}>
          {errorMessage}
        </p>

        {retryCount > 0 && (
          <p style={{ 
            color: '#92400e', 
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            Retry attempt {retryCount} of {maxRetries}
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {canRetry && (
            <button
              onClick={retry}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
            >
              Try Again
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              backgroundColor: 'white',
              color: '#dc2626',
              border: '2px solid #dc2626',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#dc2626';
            }}
          >
            Go to Login
          </button>
        </div>

        {import.meta.env.DEV && (
          <details style={{ 
            marginTop: '2rem', 
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: '#374151',
            maxWidth: '600px',
            textAlign: 'left'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Error Details (Development)
            </summary>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    );
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided, otherwise use default
      if (fallback) {
        return fallback(error, this.handleManualRetry);
      }
      
      return this.renderDefaultFallback(error, this.handleManualRetry);
    }

    return children;
  }
}

export default AuthErrorBoundary;