import { authService } from '../authService';
import { LoginRequest } from '../../types/api';

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock document for activity tracking
Object.defineProperty(global, 'document', {
  value: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
});

describe('AuthService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    sessionStorageMock.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    authService.cleanup();
  });

  describe('login', () => {
    const validCredentials: LoginRequest = {
      email: 'merchant@bobssneakers.com',
      password: 'password',
    };

    it('should login successfully with valid credentials', async () => {
      const response = await authService.login(validCredentials);

      expect(response.user.email).toBe(validCredentials.email);
      expect(response.token).toBeDefined();
      expect(response.refreshToken).toBeDefined();
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should store auth data in sessionStorage by default', async () => {
      await authService.login(validCredentials);

      expect(sessionStorageMock.getItem('auth_token')).toBeDefined();
      expect(sessionStorageMock.getItem('auth_user')).toBeDefined();
      expect(sessionStorageMock.getItem('auth_expires_at')).toBeDefined();
    });

    it('should store auth data in localStorage when rememberMe is true', async () => {
      await authService.login(validCredentials, { rememberMe: true });

      expect(localStorageMock.getItem('auth_token')).toBeDefined();
      expect(localStorageMock.getItem('auth_user')).toBeDefined();
      expect(localStorageMock.getItem('auth_expires_at')).toBeDefined();
    });

    it('should throw error for invalid credentials', async () => {
      const invalidCredentials: LoginRequest = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(invalidCredentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should clear all auth data on logout', async () => {
      const validCredentials: LoginRequest = {
        email: 'merchant@bobssneakers.com',
        password: 'password',
      };

      await authService.login(validCredentials);
      expect(authService.isAuthenticated()).toBe(true);

      await authService.logout();
      expect(authService.isAuthenticated()).toBe(false);
      expect(localStorageMock.getItem('auth_token')).toBeNull();
      expect(sessionStorageMock.getItem('auth_token')).toBeNull();
    });
  });

  describe('authentication state', () => {
    it('should restore authentication state from storage', async () => {
      const validCredentials: LoginRequest = {
        email: 'merchant@bobssneakers.com',
        password: 'password',
      };

      // Login and store data
      await authService.login(validCredentials);
      const initialState = authService.getAuthState();

      // Simulate app restart by creating new service instance
      const restoredState = await authService.restoreAuthState();

      expect(restoredState.isAuthenticated).toBe(true);
      expect(restoredState.user?.email).toBe(validCredentials.email);
    });

    it('should handle expired tokens correctly', () => {
      // Manually set expired token
      const expiredTime = Date.now() - 1000; // 1 second ago
      localStorageMock.setItem('auth_token', 'expired-token');
      localStorageMock.setItem('auth_expires_at', expiredTime.toString());
      localStorageMock.setItem('auth_user', JSON.stringify({ email: 'test@example.com' }));

      const authState = authService.getAuthState();
      expect(authState.isAuthenticated).toBe(false);
    });
  });

  describe('session timeout', () => {
    it('should provide time until expiry', async () => {
      const validCredentials: LoginRequest = {
        email: 'merchant@bobssneakers.com',
        password: 'password',
      };

      await authService.login(validCredentials);
      const timeUntilExpiry = authService.getTimeUntilExpiry();

      expect(timeUntilExpiry).toBeGreaterThan(0);
      expect(timeUntilExpiry).toBeLessThanOrEqual(3600 * 1000); // Should be <= 1 hour
    });

    it('should detect when session is expiring soon', async () => {
      const validCredentials: LoginRequest = {
        email: 'merchant@bobssneakers.com',
        password: 'password',
      };

      await authService.login(validCredentials);
      
      // Manually set expiration to be soon
      const soonExpiry = Date.now() + 2 * 60 * 1000; // 2 minutes from now
      localStorageMock.setItem('auth_expires_at', soonExpiry.toString());

      expect(authService.isSessionExpiringSoon()).toBe(true);
    });
  });

  describe('event subscription', () => {
    it('should notify subscribers of auth state changes', async () => {
      const mockListener = jest.fn();
      const unsubscribe = authService.subscribe(mockListener);

      const validCredentials: LoginRequest = {
        email: 'merchant@bobssneakers.com',
        password: 'password',
      };

      await authService.login(validCredentials);
      
      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          isAuthenticated: true,
          user: expect.objectContaining({
            email: validCredentials.email,
          }),
        })
      );

      unsubscribe();
    });
  });
});