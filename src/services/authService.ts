// Enhanced Authentication Service with improved persistence and session management

import { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from '../types/api';
import { User } from '../types';
import { ApiError } from './api';

// Authentication storage keys
const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
  EXPIRES_AT: 'auth_expires_at',
  LAST_ACTIVITY: 'auth_last_activity',
} as const;

// Session configuration
const SESSION_CONFIG = {
  // Token expiration buffer (refresh 5 minutes before expiry)
  REFRESH_BUFFER_MS: 5 * 60 * 1000,
  // Session timeout (30 minutes of inactivity)
  SESSION_TIMEOUT_MS: 30 * 60 * 1000,
  // Activity check interval (1 minute)
  ACTIVITY_CHECK_INTERVAL_MS: 60 * 1000,
} as const;

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  lastActivity: number;
}

export interface AuthPersistenceOptions {
  rememberMe?: boolean;
  sessionTimeout?: number;
}

class AuthService {
  private activityTimer: number | null = null;
  private refreshTimer: number | null = null;
  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor() {
    this.initializeActivityTracking();
    this.initializeTokenRefresh();
  }

  /**
   * Initialize activity tracking to handle session timeouts
   */
  private initializeActivityTracking(): void {
    // Track user activity
    const trackActivity = () => {
      this.updateLastActivity();
    };

    // Listen for user activity events
    if (typeof window !== 'undefined') {
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, trackActivity, { passive: true });
      });

      // Check for session timeout periodically
      this.activityTimer = setInterval(() => {
        this.checkSessionTimeout();
      }, SESSION_CONFIG.ACTIVITY_CHECK_INTERVAL_MS);
    }
  }

  /**
   * Initialize automatic token refresh
   */
  private initializeTokenRefresh(): void {
    const scheduleRefresh = () => {
      const expiresAt = this.getExpiresAt();
      if (!expiresAt) return;

      const now = Date.now();
      const timeUntilRefresh = expiresAt - now - SESSION_CONFIG.REFRESH_BUFFER_MS;

      if (timeUntilRefresh > 0) {
        this.refreshTimer = setTimeout(async () => {
          try {
            await this.refreshTokenIfNeeded();
            scheduleRefresh(); // Schedule next refresh
          } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
          }
        }, timeUntilRefresh);
      }
    };

    // Schedule initial refresh if authenticated
    if (this.isAuthenticated()) {
      scheduleRefresh();
    }
  }

  /**
   * Enhanced token storage with expiration and metadata
   */
  private setAuthData(
    token: string,
    refreshToken: string,
    user: User,
    expiresIn: number,
    options: AuthPersistenceOptions = {}
  ): void {
    const now = Date.now();
    const expiresAt = now + (expiresIn * 1000);
    
    const storage = options.rememberMe ? localStorage : sessionStorage;
    
    try {
      storage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
      storage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      storage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
      storage.setItem(AUTH_STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
      storage.setItem(AUTH_STORAGE_KEYS.LAST_ACTIVITY, now.toString());

      // Also set in the other storage for backward compatibility
      const otherStorage = options.rememberMe ? sessionStorage : localStorage;
      otherStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.error('Failed to store auth data:', error);
      throw new Error('Failed to persist authentication data');
    }
  }

  /**
   * Enhanced token retrieval with validation
   */
  private getAuthData(): AuthState {
    const getFromStorage = (key: string): string | null => {
      // Try localStorage first, then sessionStorage
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    };

    try {
      const token = getFromStorage(AUTH_STORAGE_KEYS.TOKEN);
      const refreshToken = getFromStorage(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      const userStr = getFromStorage(AUTH_STORAGE_KEYS.USER);
      const expiresAtStr = getFromStorage(AUTH_STORAGE_KEYS.EXPIRES_AT);
      const lastActivityStr = getFromStorage(AUTH_STORAGE_KEYS.LAST_ACTIVITY);

      const user = userStr ? JSON.parse(userStr) : null;
      const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null;
      const lastActivity = lastActivityStr ? parseInt(lastActivityStr, 10) : Date.now();

      const isAuthenticated = !!(token && user && expiresAt && expiresAt > Date.now());

      return {
        isAuthenticated,
        user,
        token,
        refreshToken,
        expiresAt,
        lastActivity,
      };
    } catch (error) {
      console.error('Failed to retrieve auth data:', error);
      return {
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        expiresAt: null,
        lastActivity: Date.now(),
      };
    }
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    const keys = Object.values(AUTH_STORAGE_KEYS);
    
    keys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Clear timers
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Update last activity timestamp
   */
  private updateLastActivity(): void {
    const now = Date.now();
    const storage = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN) ? localStorage : sessionStorage;
    storage.setItem(AUTH_STORAGE_KEYS.LAST_ACTIVITY, now.toString());
  }

  /**
   * Check if session has timed out due to inactivity
   */
  private checkSessionTimeout(): void {
    if (!this.isAuthenticated()) return;

    const authData = this.getAuthData();
    const now = Date.now();
    const timeSinceActivity = now - authData.lastActivity;

    if (timeSinceActivity > SESSION_CONFIG.SESSION_TIMEOUT_MS) {
      console.log('Session timed out due to inactivity');
      this.logout();
    }
  }

  /**
   * Get token expiration timestamp
   */
  private getExpiresAt(): number | null {
    const expiresAtStr = localStorage.getItem(AUTH_STORAGE_KEYS.EXPIRES_AT) || 
                        sessionStorage.getItem(AUTH_STORAGE_KEYS.EXPIRES_AT);
    return expiresAtStr ? parseInt(expiresAtStr, 10) : null;
  }

  /**
   * Check if token needs refresh and refresh if necessary
   */
  private async refreshTokenIfNeeded(): Promise<void> {
    const authData = this.getAuthData();
    
    if (!authData.refreshToken || !authData.expiresAt) {
      throw new Error('No refresh token available');
    }

    const now = Date.now();
    const timeUntilExpiry = authData.expiresAt - now;

    // Refresh if token expires within the buffer time
    if (timeUntilExpiry <= SESSION_CONFIG.REFRESH_BUFFER_MS) {
      await this.refreshToken(authData.refreshToken);
    }
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(refreshToken: string): Promise<void> {
    try {
      // Mock refresh token logic - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response: RefreshTokenResponse = {
        token: 'mock-refreshed-token-' + Date.now(),
        expiresIn: 3600,
      };

      const authData = this.getAuthData();
      if (authData.user) {
        this.setAuthData(
          response.token,
          refreshToken,
          authData.user,
          response.expiresIn,
          { rememberMe: !!localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN) }
        );
        
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Notify listeners of auth state changes
   */
  private notifyListeners(): void {
    const state = this.getAuthData();
    this.listeners.forEach(listener => listener(state));
  }

  /**
   * Subscribe to auth state changes
   */
  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Login with enhanced persistence options and retry mechanism
   */
  public async login(
    credentials: LoginRequest,
    options: AuthPersistenceOptions = {}
  ): Promise<LoginResponse> {
    const maxRetries = 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Mock network delay with potential for failure
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate network issues occasionally
            if (Math.random() < 0.1 && attempt < maxRetries) {
              reject(new ApiError('Network error', 0, 'NETWORK_ERROR'));
            } else {
              resolve(undefined);
            }
          }, 1000);
        });
        
        if (credentials.email === 'merchant@bobssneakers.com' && credentials.password === 'password') {
          const response: LoginResponse = {
            user: {
              id: '1',
              email: credentials.email,
              merchantName: "Bob's Sneakers",
              role: 'admin',
              preferences: {
                theme: 'light',
                defaultTimeRange: '30d',
                notifications: true,
              },
            },
            token: 'mock-jwt-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now(),
            expiresIn: 3600,
          };

          this.setAuthData(
            response.token,
            response.refreshToken,
            response.user,
            response.expiresIn,
            options
          );

          // Initialize token refresh scheduling
          this.initializeTokenRefresh();
          
          this.notifyListeners();
          return response;
        }
        
        throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Login failed');
        console.error(`Login attempt ${attempt} failed:`, error);
        
        // Don't retry for authentication errors (invalid credentials)
        if (error instanceof ApiError && error.status === 401) {
          throw error;
        }
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Logout and clear all auth data
   */
  public async logout(): Promise<void> {
    try {
      // Mock logout API call - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      this.clearAuthData();
      this.notifyListeners();
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      this.clearAuthData();
      this.notifyListeners();
    }
  }

  /**
   * Get current user with retry mechanism
   */
  public async getCurrentUser(): Promise<User> {
    const maxRetries = 2;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const authData = this.getAuthData();
        
        if (!authData.isAuthenticated || !authData.user) {
          throw new ApiError('Not authenticated', 401, 'NOT_AUTHENTICATED');
        }

        // Refresh token if needed
        try {
          await this.refreshTokenIfNeeded();
        } catch (error) {
          console.error('Token refresh failed during user fetch:', error);
          throw new ApiError('Authentication expired', 401, 'TOKEN_EXPIRED');
        }

        return authData.user;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Failed to get current user');
        console.error(`Get user attempt ${attempt} failed:`, error);
        
        // Don't retry for authentication errors
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          throw error;
        }
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw lastError!;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    const authData = this.getAuthData();
    return authData.isAuthenticated;
  }

  /**
   * Get current authentication state
   */
  public getAuthState(): AuthState {
    return this.getAuthData();
  }

  /**
   * Restore authentication state on app load
   */
  public async restoreAuthState(): Promise<AuthState> {
    const authData = this.getAuthData();
    
    if (authData.isAuthenticated) {
      try {
        // Verify token is still valid by fetching user
        await this.getCurrentUser();
        
        // Initialize token refresh scheduling
        this.initializeTokenRefresh();
        
        console.log('Authentication state restored successfully');
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        this.clearAuthData();
        return this.getAuthData();
      }
    }
    
    return authData;
  }

  /**
   * Get time until token expires
   */
  public getTimeUntilExpiry(): number | null {
    const expiresAt = this.getExpiresAt();
    return expiresAt ? expiresAt - Date.now() : null;
  }

  /**
   * Check if session will expire soon
   */
  public isSessionExpiringSoon(): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry();
    return timeUntilExpiry !== null && timeUntilExpiry <= SESSION_CONFIG.REFRESH_BUFFER_MS;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    this.listeners.clear();
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;