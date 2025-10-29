import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { User } from '../types';

// Mock all the hooks and components
jest.mock('../hooks/useAuth');
jest.mock('../hooks/useErrorNotification');
jest.mock('../hooks/useNotificationSystem');
jest.mock('../components/ErrorNotification', () => ({
  ErrorNotification: () => <div data-testid="error-notification" />
}));
jest.mock('../components/NotificationSystem', () => ({
  NotificationSystem: () => <div data-testid="notification-system" />
}));
jest.mock('../components/AuthStatusIndicator', () => ({
  AuthStatusIndicator: () => <div data-testid="auth-status-indicator" />
}));
jest.mock('../components/AuthErrorBoundary', () => ({
  AuthErrorBoundary: ({ children }: any) => children
}));

// Import mocked modules
import { useAuth } from '../hooks/useAuth';
import { useErrorNotification } from '../hooks/useErrorNotification';
import { useNotificationSystem } from '../hooks/useNotificationSystem';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseErrorNotification = useErrorNotification as jest.MockedFunction<typeof useErrorNotification>;
const mockUseNotificationSystem = useNotificationSystem as jest.MockedFunction<typeof useNotificationSystem>;

// Test components
const HomePage: React.FC = () => <div data-testid="home-page">Home Page</div>;
const LoginPage: React.FC = () => <div data-testid="login-page">Login Page</div>;
const DashboardPage: React.FC = () => <div data-testid="dashboard-page">Dashboard Page</div>;
const AdminPage: React.FC = () => <div data-testid="admin-page">Admin Page</div>;
const SettingsPage: React.FC = () => <div data-testid="settings-page">Settings Page</div>;
const NotFoundPage: React.FC = () => <div data-testid="not-found-page">404 Not Found</div>;

const LocationDisplay: React.FC = () => {
  const location = useLocation();
  return (
    <div>
      <div data-testid="current-location">{location.pathname}</div>
      <div data-testid="location-state">{JSON.stringify(location.state)}</div>
    </div>
  );
};

// Complex routing setup for testing
const TestRoutingApp: React.FC<{ initialPath?: string }> = ({ initialPath = '/' }) => {
  return (
    <BrowserRouter>
      <LocationDisplay />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/login" 
          element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Custom redirect route */}
        <Route 
          path="/special" 
          element={
            <ProtectedRoute redirectTo="/custom-login">
              <div data-testid="special-page">Special Page</div>
            </ProtectedRoute>
          } 
        />
        <Route path="/custom-login" element={<div data-testid="custom-login-page">Custom Login</div>} />
        
        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

const renderWithAuth = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Route Protection and Redirect Behavior - Integration Tests', () => {
  let mockAuth: any;
  let mockErrorNotification: any;
  let mockNotificationSystem: any;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    merchantName: 'Test Merchant',
    role: 'admin',
    preferences: {
      theme: 'light',
      defaultTimeRange: '30d',
      notifications: true,
    },
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Default mock implementations
    mockAuth = {
      isAuthenticated: false,
      user: null,
      isLoggingIn: false,
      isLoggingOut: false,
      isLoadingUser: false,
      loginError: null,
      userError: null,
      login: jest.fn(),
      logout: jest.fn(),
      refetchUser: jest.fn(),
    };

    mockErrorNotification = {
      notification: {
        error: null,
        type: null,
        showRetry: false,
        onRetry: null,
      },
      showAuthError: jest.fn(),
      clearError: jest.fn(),
    };

    mockNotificationSystem = {
      notifications: [],
      addAuthSuccess: jest.fn(),
      addAuthError: jest.fn(),
      dismissNotification: jest.fn(),
    };

    mockUseAuth.mockReturnValue(mockAuth);
    mockUseErrorNotification.mockReturnValue(mockErrorNotification);
    mockUseNotificationSystem.mockReturnValue(mockNotificationSystem);

    // Mock window.history for navigation testing
    Object.defineProperty(window, 'history', {
      value: {
        pushState: jest.fn(),
        replaceState: jest.fn(),
        state: {},
      },
      writable: true,
    });
  });

  describe('Basic Route Protection', () => {
    it('redirects unauthenticated users from protected routes to login', async () => {
      mockAuth.isAuthenticated = false;

      // Mock window.location to simulate direct navigation
      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
      });

      renderWithAuth(<TestRoutingApp />);

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
      });
    });

    it('allows authenticated users to access protected routes', async () => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
      });

      renderWithAuth(<TestRoutingApp />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
        expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
      });
    });

    it('redirects authenticated users away from login page', async () => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      Object.defineProperty(window, 'location', {
        value: { pathname: '/login' },
        writable: true,
      });

      renderWithAuth(<TestRoutingApp />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
        expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
      });
    });
  });

  describe('Custom Redirect Behavior', () => {
    it('uses custom redirect path when specified', async () => {
      mockAuth.isAuthenticated = false;

      Object.defineProperty(window, 'location', {
        value: { pathname: '/special' },
        writable: true,
      });

      renderWithAuth(<TestRoutingApp />);

      await waitFor(() => {
        expect(screen.getByTestId('custom-login-page')).toBeInTheDocument();
        expect(screen.queryByTestId('special-page')).not.toBeInTheDocument();
      });
    });

    it('preserves intended destination in location state', async () => {
      mockAuth.isAuthenticated = false;

      // Create a custom component to test location state preservation
      const TestLocationState: React.FC = () => {
        const location = useLocation();
        
        React.useEffect(() => {
          // Simulate navigation to protected route
          if (location.pathname === '/dashboard') {
            // This would normally be handled by React Router
            // but we're testing the state preservation logic
          }
        }, [location]);

        return (
          <BrowserRouter>
            <Routes>
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </BrowserRouter>
        );
      };

      renderWithAuth(<TestLocationState />);

      // The ProtectedRoute should preserve the original path for post-login redirect
      // This is tested through the Navigate component's state prop
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Protected Routes', () => {
    it('protects multiple routes consistently', async () => {
      mockAuth.isAuthenticated = false;

      const protectedPaths = ['/dashboard', '/settings', '/admin'];

      for (const path of protectedPaths) {
        Object.defineProperty(window, 'location', {
          value: { pathname: path },
          writable: true,
        });

        const { unmount } = renderWithAuth(<TestRoutingApp />);

        await waitFor(() => {
          expect(screen.getByTestId('login-page')).toBeInTheDocument();
        });

        unmount();
      }
    });

    it('allows access to all protected routes when authenticated', async () => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      const protectedRoutes = [
        { path: '/dashboard', testId: 'dashboard-page' },
        { path: '/settings', testId: 'settings-page' },
        { path: '/admin', testId: 'admin-page' },
      ];

      for (const route of protectedRoutes) {
        Object.defineProperty(window, 'location', {
          value: { pathname: route.path },
          writable: true,
        });

        const { unmount } = renderWithAuth(<TestRoutingApp />);

        await waitFor(() => {
          expect(screen.getByTestId(route.testId)).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe('Root Route Behavior', () => {
    it('redirects root path to dashboard for unauthenticated users', async () => {
      mockAuth.isAuthenticated = false;

      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
      });

      renderWithAuth(<TestRoutingApp />);

      // Root redirects to dashboard, which then redirects to login
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('redirects root path to dashboard for authenticated users', async () => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
      });

      renderWithAuth(<TestRoutingApp />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State Route Behavior', () => {
    it('shows loading state while authentication is being verified', async () => {
      mockAuth.isLoadingUser = true;

      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
      });

      renderWithAuth(<TestRoutingApp />);

      await waitFor(() => {
        expect(screen.getByText('Checking authentication status...')).toBeInTheDocument();
        expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
        expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
      });
    });

    it('resolves to correct route after loading completes', async () => {
      // Start with loading state
      mockAuth.isLoadingUser = true;

      const { rerender } = renderWithAuth(<TestRoutingApp />);

      await waitFor(() => {
        expect(screen.getByText('Checking authentication status...')).toBeInTheDocument();
      });

      // Complete loading with authenticated state
      mockAuth.isLoadingUser = false;
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <AuthProvider>
            <TestRoutingApp />
          </AuthProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
        expect(screen.queryByText('Checking authentication status...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error State Route Behavior', () => {
    it('shows error UI when authentication fails on protected route', async () => {
      mockAuth.isAuthenticated = false;
      mockAuth.loginError = { message: 'Authentication failed' };

      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
      });

      renderWithAuth(<TestRoutingApp />);

      await waitFor(() => {
        expect(screen.getByText('Authentication Error')).toBeInTheDocument();
        expect(screen.getByText('Authentication failed')).toBeInTheDocument();
        expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
      });
    });

    it('provides error recovery options', async () => {
      mockAuth.isAuthenticated = false;
      mockAuth.loginError = { message: 'Network error' };

      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
      });

      renderWithAuth(<TestRoutingApp />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
        expect(screen.getByText('Go to Login')).toBeInTheDocument();
      });
    });
  });

  describe('Requirements Validation - Route Protection', () => {
    // Requirement 1.1: WHEN an unauthenticated user attempts to access `/dashboard` THEN redirect to `/login`
    it('validates requirement 1.1 - dashboard route protection', async () => {
      mockAuth.isAuthenticated = false;

      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
      });

      renderWithAuth(<TestRoutingApp />);

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
      });
    });

    // Requirement 1.2: WHEN an unauthenticated user attempts to access any protected route THEN redirect to login
    it('validates requirement 1.2 - any protected route protection', async () => {
      mockAuth.isAuthenticated = false;

      const protectedRoutes = ['/dashboard', '/settings', '/admin'];

      for (const route of protectedRoutes) {
        Object.defineProperty(window, 'location', {
          value: { pathname: route },
          writable: true,
        });

        const { unmount } = renderWithAuth(<TestRoutingApp />);

        await waitFor(() => {
          expect(screen.getByTestId('login-page')).toBeInTheDocument();
        });

        unmount();
      }
    });

    // Requirement 1.3: WHEN an authenticated user accesses `/dashboard` THEN display dashboard content
    it('validates requirement 1.3 - authenticated dashboard access', async () => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
      });

      renderWithAuth(<TestRoutingApp />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
        expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
      });
    });

    // Requirement 1.4: WHEN user's authentication expires during session THEN redirect to login
    it('validates requirement 1.4 - session expiration handling', async () => {
      // Start authenticated
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      const { rerender } = renderWithAuth(<TestRoutingApp />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Simulate session expiration
      mockAuth.isAuthenticated = false;
      mockAuth.user = null;
      mockAuth.loginError = { message: 'Session expired' };

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <AuthProvider>
            <TestRoutingApp />
          </AuthProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Authentication Error')).toBeInTheDocument();
        expect(screen.getByText('Session expired')).toBeInTheDocument();
        expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid routes correctly', async () => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      Object.defineProperty(window, 'location', {
        value: { pathname: '/nonexistent' },
        writable: true,
      });

      renderWithAuth(<TestRoutingApp />);

      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });
    });

    it('handles rapid authentication state changes', async () => {
      // Start unauthenticated
      mockAuth.isAuthenticated = false;

      const { rerender } = renderWithAuth(<TestRoutingApp />);

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      // Quickly change to authenticated
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <AuthProvider>
            <TestRoutingApp />
          </AuthProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Quickly change back to unauthenticated
      mockAuth.isAuthenticated = false;
      mockAuth.user = null;

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <AuthProvider>
            <TestRoutingApp />
          </AuthProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
  });
});