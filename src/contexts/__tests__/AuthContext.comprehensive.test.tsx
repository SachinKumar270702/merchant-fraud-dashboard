import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuthContext } from '../AuthContext';
import type { LoginRequest, User } from '../../types';

// Mock all the hooks and components
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useErrorNotification');
jest.mock('../../hooks/useNotificationSystem');
jest.mock('../../components/ErrorNotification', () => ({
  ErrorNotification: () => <div data-testid="error-notification" />
}));
jest.mock('../../components/NotificationSystem', () => ({
  NotificationSystem: () => <div data-testid="notification-system" />
}));
jest.mock('../../components/AuthStatusIndicator', () => ({
  AuthStatusIndicator: () => <div data-testid="auth-status-indicator" />
}));

// Import mocked modules
import { useAuth } from '../../hooks/useAuth';
import { useErrorNotification } from '../../hooks/useErrorNotification';
import { useNotificationSystem } from '../../hooks/useNotificationSystem';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseErrorNotification = useErrorNotification as jest.MockedFunction<typeof useErrorNotification>;
const mockUseNotificationSystem = useNotificationSystem as jest.MockedFunction<typeof useNotificationSystem>;

// Test component that uses the AuthContext
const TestComponent: React.FC = () => {
  const auth = useAuthContext();
  
  return (
    <div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="isLoading">{auth.isLoading.toString()}</div>
      <div data-testid="isLoggingIn">{auth.isLoggingIn.toString()}</div>
      <div data-testid="isLoggingOut">{auth.isLoggingOut.toString()}</div>
      <div data-testid="user">{auth.user ? auth.user.email : 'null'}</div>
      <div data-testid="error">{auth.error || 'null'}</div>
      <button data-testid="login-btn" onClick={() => auth.login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => auth.logout()}>
        Logout
      </button>
      <button data-testid="clear-error-btn" onClick={() => auth.clearError()}>
        Clear Error
      </button>
      <button data-testid="check-auth-btn" onClick={() => auth.checkAuthStatus()}>
        Check Auth
      </button>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
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

describe('AuthContext - Comprehensive Tests', () => {
  let mockAuth: any;
  let mockErrorNotification: any;
  let mockNotificationSystem: any;

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
  });

  describe('Context Provider', () => {
    it('provides authentication context to child components', () => {
      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      expect(screen.getByTestId('isLoggingIn')).toHaveTextContent('false');
      expect(screen.getByTestId('isLoggingOut')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });

    it('throws error when useAuthContext is used outside AuthProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuthContext must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('renders notification components', () => {
      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('error-notification')).toBeInTheDocument();
      expect(screen.getByTestId('notification-system')).toBeInTheDocument();
      expect(screen.getByTestId('auth-status-indicator')).toBeInTheDocument();
    });
  });

  describe('Authentication State', () => {
    it('reflects authenticated state correctly', () => {
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

      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;

      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    it('reflects loading states correctly', () => {
      mockAuth.isLoadingUser = true;
      mockAuth.isLoggingIn = true;
      mockAuth.isLoggingOut = true;

      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('isLoading')).toHaveTextContent('true');
      expect(screen.getByTestId('isLoggingIn')).toHaveTextContent('true');
      expect(screen.getByTestId('isLoggingOut')).toHaveTextContent('true');
    });

    it('reflects error states correctly', () => {
      mockAuth.loginError = { message: 'Login failed' };

      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('error')).toHaveTextContent('Login failed');
    });

    it('prioritizes login error over user error', () => {
      mockAuth.loginError = { message: 'Login failed' };
      mockAuth.userError = { message: 'User fetch failed' };

      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('error')).toHaveTextContent('Login failed');
    });

    it('shows user error when no login error', () => {
      mockAuth.userError = { message: 'User fetch failed' };

      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('error')).toHaveTextContent('User fetch failed');
    });
  });

  describe('Login Functionality', () => {
    it('calls login with correct credentials', async () => {
      const mockLogin = jest.fn().mockResolvedValue(undefined);
      mockAuth.login = mockLogin;

      renderWithProviders(<TestComponent />);

      fireEvent.click(screen.getByTestId('login-btn'));

      expect(mockLogin).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password' },
        undefined
      );
    });

    it('clears error on successful login', async () => {
      const mockLogin = jest.fn().mockResolvedValue(undefined);
      mockAuth.login = mockLogin;
      mockAuth.user = { email: 'test@example.com', merchantName: 'Test Merchant' };

      renderWithProviders(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('login-btn'));
      });

      expect(mockErrorNotification.clearError).toHaveBeenCalled();
    });

    it('shows success notification on successful login with user', async () => {
      const mockLogin = jest.fn().mockResolvedValue(undefined);
      mockAuth.login = mockLogin;
      mockAuth.user = { email: 'test@example.com', merchantName: 'Test Merchant' };

      renderWithProviders(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('login-btn'));
      });

      expect(mockNotificationSystem.addAuthSuccess).toHaveBeenCalledWith(
        'Welcome back, Test Merchant!'
      );
    });

    it('shows generic success notification when no user name', async () => {
      const mockLogin = jest.fn().mockResolvedValue(undefined);
      mockAuth.login = mockLogin;
      mockAuth.user = { email: 'test@example.com' };

      renderWithProviders(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('login-btn'));
      });

      expect(mockNotificationSystem.addAuthSuccess).toHaveBeenCalledWith(
        'Successfully logged in!'
      );
    });

    it('handles login errors correctly', async () => {
      const loginError = new Error('Invalid credentials');
      const mockLogin = jest.fn().mockRejectedValue(loginError);
      mockAuth.login = mockLogin;

      renderWithProviders(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('login-btn'));
      });

      expect(mockErrorNotification.showAuthError).toHaveBeenCalledWith(
        loginError,
        expect.any(Function)
      );
      expect(mockNotificationSystem.addAuthError).toHaveBeenCalledWith(
        loginError,
        expect.any(Function)
      );
    });

    it('handles non-Error login failures', async () => {
      const mockLogin = jest.fn().mockRejectedValue('String error');
      mockAuth.login = mockLogin;

      renderWithProviders(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('login-btn'));
      });

      expect(mockErrorNotification.showAuthError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Login failed' }),
        expect.any(Function)
      );
    });
  });

  describe('Logout Functionality', () => {
    it('calls logout correctly', async () => {
      const mockLogout = jest.fn().mockResolvedValue(undefined);
      mockAuth.logout = mockLogout;

      renderWithProviders(<TestComponent />);

      fireEvent.click(screen.getByTestId('logout-btn'));

      expect(mockLogout).toHaveBeenCalled();
    });

    it('clears error and shows success notification on successful logout', async () => {
      const mockLogout = jest.fn().mockResolvedValue(undefined);
      mockAuth.logout = mockLogout;

      renderWithProviders(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('logout-btn'));
      });

      expect(mockErrorNotification.clearError).toHaveBeenCalled();
      expect(mockNotificationSystem.addAuthSuccess).toHaveBeenCalledWith(
        'You have been logged out successfully'
      );
    });

    it('handles logout errors without throwing', async () => {
      const logoutError = new Error('Logout failed');
      const mockLogout = jest.fn().mockRejectedValue(logoutError);
      mockAuth.logout = mockLogout;

      renderWithProviders(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('logout-btn'));
      });

      expect(mockErrorNotification.showAuthError).toHaveBeenCalledWith(
        logoutError,
        expect.any(Function)
      );
      expect(mockNotificationSystem.addAuthError).toHaveBeenCalledWith(
        logoutError,
        expect.any(Function)
      );
    });
  });

  describe('Error Handling', () => {
    it('clears error correctly', async () => {
      const mockRefetchUser = jest.fn();
      mockAuth.refetchUser = mockRefetchUser;

      renderWithProviders(<TestComponent />);

      fireEvent.click(screen.getByTestId('clear-error-btn'));

      expect(mockErrorNotification.clearError).toHaveBeenCalled();
      expect(mockRefetchUser).toHaveBeenCalled();
    });

    it('handles missing refetchUser gracefully', () => {
      mockAuth.refetchUser = undefined;

      renderWithProviders(<TestComponent />);

      expect(() => {
        fireEvent.click(screen.getByTestId('clear-error-btn'));
      }).not.toThrow();

      expect(mockErrorNotification.clearError).toHaveBeenCalled();
    });
  });

  describe('Auth Status Check', () => {
    it('checks auth status successfully', async () => {
      const mockRefetchUser = jest.fn().mockResolvedValue(undefined);
      mockAuth.refetchUser = mockRefetchUser;
      mockAuth.isAuthenticated = true;

      renderWithProviders(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('check-auth-btn'));
      });

      expect(mockRefetchUser).toHaveBeenCalled();
    });

    it('handles auth status check errors', async () => {
      const authError = new Error('Auth check failed');
      const mockRefetchUser = jest.fn().mockRejectedValue(authError);
      mockAuth.refetchUser = mockRefetchUser;

      renderWithProviders(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('check-auth-btn'));
      });

      expect(mockErrorNotification.showAuthError).toHaveBeenCalledWith(
        authError,
        expect.any(Function)
      );
    });

    it('returns false when auth check fails', async () => {
      const mockRefetchUser = jest.fn().mockRejectedValue(new Error('Failed'));
      mockAuth.refetchUser = mockRefetchUser;

      const TestCheckAuthComponent: React.FC = () => {
        const auth = useAuthContext();
        const [result, setResult] = React.useState<boolean | null>(null);

        const handleCheck = async () => {
          const authResult = await auth.checkAuthStatus();
          setResult(authResult);
        };

        return (
          <div>
            <button data-testid="check-btn" onClick={handleCheck}>Check</button>
            <div data-testid="result">{result?.toString() || 'null'}</div>
          </div>
        );
      };

      renderWithProviders(<TestCheckAuthComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('check-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('result')).toHaveTextContent('false');
      });
    });

    it('handles missing refetchUser in auth check', async () => {
      mockAuth.refetchUser = undefined;
      mockAuth.isAuthenticated = true;

      const TestCheckAuthComponent: React.FC = () => {
        const auth = useAuthContext();
        const [result, setResult] = React.useState<boolean | null>(null);

        const handleCheck = async () => {
          const authResult = await auth.checkAuthStatus();
          setResult(authResult);
        };

        return (
          <div>
            <button data-testid="check-btn" onClick={handleCheck}>Check</button>
            <div data-testid="result">{result?.toString() || 'null'}</div>
          </div>
        );
      };

      renderWithProviders(<TestCheckAuthComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('check-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('result')).toHaveTextContent('true');
      });
    });
  });
});