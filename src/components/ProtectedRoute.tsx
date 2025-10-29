import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { AuthErrorBoundary } from './AuthErrorBoundary';
import { UserRole, Permission } from '../types';
import { hasAnyRole, hasMinimumRole, hasAnyPermission, canAccessRoute } from '../utils/permissions';

// TypeScript interfaces for component props
export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  // Role-based access control props
  requiredRoles?: UserRole[];
  minimumRole?: UserRole;
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean;
  // Custom access denied component
  accessDeniedComponent?: React.ReactNode;
}

// Enhanced loading component for authentication states
const AuthLoading: React.FC<{ message?: string }> = ({ 
  message = "Verifying authentication..." 
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#718096',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        fontSize: '2rem', 
        marginBottom: '1rem',
        animation: 'spin 1s linear infinite'
      }}>
        🔄
      </div>
      <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
        {message}
      </div>
      <div style={{ 
        fontSize: '0.875rem', 
        opacity: 0.7,
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        Please wait while we check your access permissions...
      </div>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

// Access denied component for insufficient permissions
const AccessDenied: React.FC<{ 
  message?: string;
  userRole?: string;
  requiredAccess?: string;
}> = ({ 
  message = "Access Denied",
  userRole,
  requiredAccess
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#fef2f2',
      color: '#7f1d1d',
      fontFamily: 'Arial, sans-serif',
      padding: '2rem'
    }}>
      <div style={{ 
        fontSize: '4rem', 
        marginBottom: '1rem'
      }}>
        🚫
      </div>
      <h1 style={{ 
        fontSize: '2rem', 
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        {message}
      </h1>
      <p style={{ 
        fontSize: '1.125rem', 
        marginBottom: '1rem',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        You don't have the required permissions to access this page.
      </p>
      {userRole && (
        <p style={{ 
          fontSize: '0.875rem', 
          opacity: 0.8,
          marginBottom: '0.5rem'
        }}>
          Your current role: <strong>{userRole}</strong>
        </p>
      )}
      {requiredAccess && (
        <p style={{ 
          fontSize: '0.875rem', 
          opacity: 0.8,
          marginBottom: '2rem'
        }}>
          Required access: <strong>{requiredAccess}</strong>
        </p>
      )}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Go Back
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          style={{
            backgroundColor: 'white',
            color: '#dc2626',
            border: '2px solid #dc2626',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

/**
 * ProtectedRoute component that wraps routes requiring authentication and authorization
 * 
 * Features:
 * - Authentication checks with redirect logic
 * - Role-based access control
 * - Permission-based access control
 * - Loading states during authentication verification
 * - Customizable fallback UI
 * - Preserves intended destination for post-login redirect
 * 
 * Requirements satisfied:
 * - 1.1: Redirects unauthenticated users to login
 * - 1.2: Allows authenticated users to access protected content
 * - 4.1: Provides reusable component for route protection
 * - 4.4: Implements role-based access control foundation
 * - 5.1: Shows loading indicator during authentication checks
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  redirectTo = '/login',
  requireAuth = true,
  requiredRoles,
  minimumRole,
  requiredPermissions,
  requireAllPermissions = false,
  accessDeniedComponent
}) => {
  const { isAuthenticated, isLoading, user, error } = useAuthContext();
  const location = useLocation();

  // Show loading state while authentication is being verified
  if (isLoading) {
    return fallback || <AuthLoading message="Checking authentication status..." />;
  }

  // If there's an authentication error, wrap in error boundary
  if (error) {
    return (
      <AuthErrorBoundary
        fallback={(authError, retry) => (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>
              Authentication Error
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#7f1d1d' }}>
              {error}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={retry}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                style={{
                  backgroundColor: 'white',
                  color: '#dc2626',
                  border: '2px solid #dc2626',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      >
        {children}
      </AuthErrorBoundary>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Preserve the current location for redirect after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // If authentication is required but user data is not available
  if (requireAuth && isAuthenticated && !user) {
    return fallback || <AuthLoading message="Loading user profile..." />;
  }

  // Role and permission checking for authenticated users
  if (requireAuth && isAuthenticated && user) {
    let hasAccess = true;
    let accessDeniedReason = '';

    // Check role requirements
    if (requiredRoles && requiredRoles.length > 0) {
      if (!hasAnyRole(user, requiredRoles)) {
        hasAccess = false;
        accessDeniedReason = `Required roles: ${requiredRoles.join(', ')}`;
      }
    }

    // Check minimum role requirement
    if (hasAccess && minimumRole) {
      if (!hasMinimumRole(user, minimumRole)) {
        hasAccess = false;
        accessDeniedReason = `Minimum role required: ${minimumRole}`;
      }
    }

    // Check permission requirements
    if (hasAccess && requiredPermissions && requiredPermissions.length > 0) {
      if (!canAccessRoute(user, requiredPermissions, requireAllPermissions)) {
        hasAccess = false;
        const permissionType = requireAllPermissions ? 'all' : 'any';
        accessDeniedReason = `Required permissions (${permissionType}): ${requiredPermissions.join(', ')}`;
      }
    }

    // If access is denied, show access denied component
    if (!hasAccess) {
      if (accessDeniedComponent) {
        return <>{accessDeniedComponent}</>;
      }
      
      return (
        <AccessDenied
          userRole={user.role}
          requiredAccess={accessDeniedReason}
        />
      );
    }
  }

  // If authentication is not required but user is authenticated, 
  // this allows for "guest-only" routes like login page
  if (!requireAuth && isAuthenticated && user) {
    // For routes like /login, redirect authenticated users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed, render the protected content with error boundary
  return (
    <AuthErrorBoundary>
      {children}
    </AuthErrorBoundary>
  );
};

export default ProtectedRoute;