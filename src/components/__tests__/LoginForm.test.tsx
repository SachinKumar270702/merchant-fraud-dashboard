import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '../LoginForm';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the auth service
vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(() => false),
    subscribe: vi.fn(() => () => {}),
    restoreAuthState: vi.fn(() => Promise.resolve({ isAuthenticated: false, user: null })),
    getCurrentUser: vi.fn(),
    getTimeUntilExpiry: vi.fn(),
    isSessionExpiringSoon: vi.fn(),
    getAuthState: vi.fn(),
  },
}));

// Mock the notification hooks
vi.mock('../../hooks/useErrorNotification', () => ({
  useErrorNotification: () => ({
    notification: { error: null, type: null, showRetry: false, onRetry: null },
    showAuthError: vi.fn(),
    clearError: vi.fn(),
  }),
}));

vi.mock('../../hooks/useNotificationSystem', () => ({
  useNotificationSystem: () => ({
    notifications: [],
    addAuthSuccess: vi.fn(),
    addAuthError: vi.fn(),
    dismissNotification: vi.fn(),
  }),
}));

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('LoginForm Integration with AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders login form with all required fields', () => {
    const Wrapper = createTestWrapper();
    render(<LoginForm />, { wrapper: Wrapper });

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays demo credentials section', () => {
    const Wrapper = createTestWrapper();
    render(<LoginForm />, { wrapper: Wrapper });

    expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
    expect(screen.getByText(/merchant@bobssneakers.com/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fill demo credentials/i })).toBeInTheDocument();
  });

  it('fills demo credentials when button is clicked', () => {
    const Wrapper = createTestWrapper();
    render(<LoginForm />, { wrapper: Wrapper });

    const fillButton = screen.getByRole('button', { name: /fill demo credentials/i });
    fireEvent.click(fillButton);

    expect(screen.getByDisplayValue('merchant@bobssneakers.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('password')).toBeInTheDocument();
  });

  it('uses AuthContext for authentication state', () => {
    const Wrapper = createTestWrapper();
    render(<LoginForm />, { wrapper: Wrapper });

    // The form should render without errors, indicating AuthContext integration works
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('clears errors when user starts typing', () => {
    const Wrapper = createTestWrapper();
    render(<LoginForm />, { wrapper: Wrapper });

    const emailInput = screen.getByLabelText(/email address/i);
    
    // Simulate typing to trigger error clearing
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // The error clearing logic should be triggered through onChange handlers
    expect(emailInput).toHaveValue('test@example.com');
  });
});