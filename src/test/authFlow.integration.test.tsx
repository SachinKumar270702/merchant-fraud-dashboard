import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuthContext } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { User, LoginRequest } from '../types';

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
const LoginForm: React.FC = () => {
  const { login, isLoggingIn, error } = useAuthContext();
  const [credentials, setCredentials] = React.useState<LoginRequest>({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(credentials);
  };

  return (
    <div data-testid="login-form">
      <form onSubmit={handleSubmit}>
        <input
          data-testid="email-input"
          type="email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          placeholder="Email"
        />
        <input
          data-testid="password-input"
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          placeholder="Password"
        />
        <button 
          data-testid="login-button" 
          type="submit" 
          disabled={isLoggingIn}
        >
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <div data-testid="login-error">{error}</div>}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, logout, isLoggingOut } = useAuthContext();

  return (
    <div data-testid="dashboard">
      <h1>Dashboard</h1>
      <div data-testid="user-info">
        Welcome, {user?.merchantName || user?.email || 'User'}!
      </div>
      <button 
        data-testid="logout-button" 
        onClick={logout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
};

const LocationDisplay: React.FC = () => {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
};

// Main app component for integration testing
const TestApp: React.FC = () => {
  return (
    <BrowserRouter>
      <LocationDisplay />
      <Routes>
        <Route 
          path="/login" 
          element={
            <ProtectedRoute requireAuth={false}>
              <LoginForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<div data-testid="home">Home</div>} />
      </Routes>
    </BrowserRouter>
  );
};

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TestApp />
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Authentication Flow - Integration Tests', () => {
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

    // Mock window.history for navigation
    Object.defineProperty(window, 'history', {
      value: {
        pushState: jest.fn(),
        replaceState: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Complete Authentication Flow', () => {
    it('completes successful login flow from start to finish', async () => {
      // Start with unauthenticated state
      mockAuth.isAuthenticated = false;
      mockAuth.user = null;

      renderApp();

      // Navigate to dashboard (should redirect to login)
      window.history.pushState({}, '', '/dashboard');

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent('/login');
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });

      // Fill in login form
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' }
      });

      // Mock successful login
      const mockLogin = jest.fn().mockImplementation(async () => {
        // Simulate successful login by updating auth state
        mockAuth.isAuthenticated = true;
        mockAuth.user = mockUser;
        mockAuth.isLoggingIn = false;
      });
      mockAuth.login = mockLogin;

      // Submit login form
      await act(async () => {
        fireEvent.click(screen.getByTestId('login-button'));
      });

      // Verify login was called with correct credentials
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });

      // After successful login, should redirect to dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome, Test Merchant!');
      });
    });

    it('handles login failure and retry', async () => {
      mockAuth.isAuthenticated = false;

      renderApp();

      // Navigate to login
      window.history.pushState({}, '', '/login');

      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });

      // Fill in login form
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'wrongpassword' }
      });

      // Mock failed login
      const loginError = new Error('Invalid credentials');
      const mockLogin = jest.fn().mockRejectedValue(loginError);
      mockAuth.login = mockLogin;
      mockAuth.loginError = { message: 'Invalid credentials' };

      // Submit login form
      await act(async () => {
        fireEvent.click(screen.getByTestId('login-button'));
      });

      // Should show error
      await waitFor(() => {
        expect(screen.getByTestId('login-error')).toHaveTextContent('Invalid credentials');
      });

      // Verify error notifications were called
      expect(mockErrorNotification.showAuthError).toHaveBeenCalledWith(
        loginError,
        expect.any(Function)
      );
      expect(mockNotificationSystem.addAuthError).toHaveBeenCalledWith(
        loginError,
        expect.any(Function)
      );

      // Now simulate successful retry
      const mockRetryLogin = jest.fn().mockImplementation(async () => {
        mockAuth.isAuthenticated = true;
        mockAuth.user = mockUser;
        mockAuth.loginError = null;
      });
      mockAuth.login = mockRetryLogin;

      // Fix password and retry
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'correctpassword' }
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('login-button'));
      });

      // Should now succeed and redirect to dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    it('completes logout flow', async () => {
      // Start authenticated
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      renderApp();

      // Navigate to dashboard
      window.history.pushState({}, '', '/dashboard');

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome, Test Merchant!');
      });

      // Mock logout
      const mockLogout = jest.fn().mockImplementation(async () => {
        mockAuth.isAuthenticated = false;
        mockAuth.user = null;
        mockAuth.isLoggingOut = false;
      });
      mockAuth.logout = mockLogout;

      // Click logout
      await act(async () => {
        fireEvent.click(screen.getByTestId('logout-button'));
      });

      // Verify logout was called
      expect(mockLogout).toHaveBeenCalled();

      // Should redirect to login after logout
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });

      // Verify success notification
      expect(mockNotificationSystem.addAuthSuccess).toHaveBeenCalledWith(
        'You have been logged out successfully'
      );
    });
  });

  describe('Route Protection Integration', () => {
    it('protects dashboard route from unauthenticated access', async () => {
      mockAuth.isAuthenticated = false;

      renderApp();

      // Try to access dashboard directly
      window.history.pushState({}, '', '/dashboard');

      // Should redirect to login
      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent('/login');
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
        expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
      });
    });

    it('redirects authenticated users away from login page', async () => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      renderApp();

      // Try to access login page while authenticated
      window.history.pushState({}, '', '/login');

      // Should redirect to dashboard
      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent('/dashboard');
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
      });
    });

    it('handles session expiration during protected route access', async () => {
      // Start authenticated
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      renderApp();

      // Access dashboard
      window.history.pushState({}, '', '/dashboard');

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Simulate session expiration
      mockAuth.isAuthenticated = false;
      mockAuth.user = null;
      mockAuth.loginError = { message: 'Session expired' };

      // Re-render to trigger auth check
      renderApp();

      // Should show error UI
      await waitFor(() => {
        expect(screen.getByText('Authentication Error')).toBeInTheDocument();
        expect(screen.getByText('Session expired')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States Integration', () => {
    it('shows loading states during authentication process', async () => {
      mockAuth.isLoadingUser = true;

      renderApp();

      window.history.pushState({}, '', '/dashboard');

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Checking authentication status...')).toBeInTheDocument();
        expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
        expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
      });
    });

    it('shows login loading state during login process', async () => {
      mockAuth.isAuthenticated = false;
      mockAuth.isLoggingIn = true;

      renderApp();

      window.history.pushState({}, '', '/login');

      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
        expect(screen.getByText('Logging in...')).toBeInTheDocument();
        expect(screen.getByTestId('login-button')).toBeDisabled();
      });
    });

    it('shows logout loading state during logout process', async () => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;
      mockAuth.isLoggingOut = true;

      renderApp();

      window.history.pushState({}, '', '/dashboard');

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.getByText('Logging out...')).toBeInTheDocument();
        expect(screen.getByTestId('logout-button')).toBeDisabled();
      });
    });
  });

  describe('Error Recovery Integration', () => {
    it('recovers from authentication errors', async () => {
      // Start with auth error
      mockAuth.isAuthenticated = false;
      mockAuth.loginError = { message: 'Network error' };

      renderApp();

      window.history.pushState({}, '', '/dashboard');

      // Should show error UI
      await waitFor(() => {
        expect(screen.getByText('Authentication Error')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Clear error and authenticate
      mockAuth.loginError = null;
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      // Re-render to simulate error recovery
      renderApp();

      window.history.pushState({}, '', '/dashboard');

      // Should now show dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.queryByText('Authentication Error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Requirements Validation - Integration', () => {
    // Integration test for requirement 1.1 and 1.2
    it('validates complete authentication flow requirements', async () => {
      // Start unauthenticated (1.1)
      mockAuth.isAuthenticated = false;

      renderApp();

      // Try to access protected route
      window.history.pushState({}, '', '/dashboard');

      // Should redirect to login (1.1)
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });

      // Authenticate user
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      // Re-render and try dashboard again
      renderApp();
      window.history.pushState({}, '', '/dashboard');

      // Should now show dashboard (1.2)
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    // Integration test for requirement 1.4 - authentication state changes
    it('validates authentication state change handling', async () => {
      // Start authenticated
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      renderApp();
      window.history.pushState({}, '', '/dashboard');

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Simulate authentication expiration
      mockAuth.isAuthenticated = false;
      mockAuth.user = null;

      // Re-render to simulate state change
      renderApp();
      window.history.pushState({}, '', '/dashboard');

      // Should redirect to login
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });
    });
  });
});