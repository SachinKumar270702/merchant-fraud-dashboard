import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '../components/LoginForm';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the auth service with successful login
const mockAuthService = {
  login: vi.fn(() => Promise.resolve({ user: { id: '1', email: 'test@example.com', merchantName: 'Test Merchant', role: 'admin', preferences: { theme: 'light', defaultTimeRange: '30d', notifications: true } } })),
  logout: vi.fn(() => Promise.resolve()),
  isAuthenticated: vi.fn(() => false),
  subscribe: vi.fn(() => () => {}),
  restoreAuthState: vi.fn(() => Promise.resolve({ isAuthenticated: false, user: null })),
  getCurrentUser: vi.fn(),
  getTimeUntilExpiry: vi.fn(),
  isSessionExpiringSoon: vi.fn(),
  getAuthState: vi.fn(),
};

vi.mock('../services/authService', () => ({
  authService: mockAuthService,
}));

// Mock the notification hooks
vi.mock('../hooks/useErrorNotification', () => ({
  useErrorNotification: () => ({
    notification: { error: null, type: null, showRetry: false, onRetry: null },
    showAuthError: vi.fn(),
    clearError: vi.fn(),
  }),
}));

vi.mock('../hooks/useNotificationSystem', () => ({
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

  it('integrates with AuthContext successfully', () => {
    const Wrapper = createTestWrapper();
    
    // Should render without throwing errors
    expect(() => {
      render(<LoginForm />, { wrapper: Wrapper });
    }).not.toThrow();

    // Should display the login form
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles form submission through AuthContext', async () => {
    const Wrapper = createTestWrapper();
    render(<LoginForm />, { wrapper: Wrapper });

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Fill in the form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Should call the auth service login method
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password123' },
        { rememberMe: false }
      );
    });
  });

  it('shows loading state during login', async () => {
    const Wrapper = createTestWrapper();
    render(<LoginForm />, { wrapper: Wrapper });

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Fill in the form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Should show loading state
    expect(submitButton).toHaveTextContent(/signing in/i);
    expect(submitButton).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });

  it('handles remember me functionality', async () => {
    const Wrapper = createTestWrapper();
    render(<LoginForm />, { wrapper: Wrapper });

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Fill in the form and check remember me
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(rememberMeCheckbox);

    // Submit the form
    fireEvent.click(submitButton);

    // Should call the auth service with rememberMe: true
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password123' },
        { rememberMe: true }
      );
    });
  });

  it('fills demo credentials correctly', () => {
    const Wrapper = createTestWrapper();
    render(<LoginForm />, { wrapper: Wrapper });

    const fillButton = screen.getByRole('button', { name: /fill demo credentials/i });
    fireEvent.click(fillButton);

    expect(screen.getByDisplayValue('merchant@bobssneakers.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('password')).toBeInTheDocument();
  });
});