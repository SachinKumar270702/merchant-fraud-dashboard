/**
 * Integration test for authentication persistence functionality
 * This test verifies that the enhanced authentication service properly
 * handles token storage, session timeout, and state restoration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService } from '../services/authService';

// Mock timers for testing timeout functionality
vi.useFakeTimers();

describe('Authentication Persistence Integration', () => {
  beforeEach(() => {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset timers
    vi.clearAllTimers();
  });

  afterEach(() => {
    authService.cleanup();
    vi.clearAllTimers();
  });

  it('should persist authentication state across sessions', async () => {
    const credentials = {
      email: 'merchant@bobssneakers.com',
      password: 'password',
    };

    // Login with remember me
    await authService.login(credentials, { rememberMe: true });
    
    // Verify initial state
    expect(authService.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('auth_token')).toBeTruthy();
    
    // Simulate app restart by restoring state
    const restoredState = await authService.restoreAuthState();
    
    expect(restoredState.isAuthenticated).toBe(true);
    expect(restoredState.user?.email).toBe(credentials.email);
  });

  it('should handle session timeout correctly', async () => {
    const credentials = {
      email: 'merchant@bobssneakers.com',
      password: 'password',
    };

    // Login without remember me (session storage)
    await authService.login(credentials, { rememberMe: false });
    
    expect(authService.isAuthenticated()).toBe(true);
    expect(sessionStorage.getItem('auth_token')).toBeTruthy();
    
    // Simulate session timeout by setting expired timestamp
    const expiredTime = Date.now() - 1000;
    sessionStorage.setItem('auth_expires_at', expiredTime.toString());
    
    // Check if session is expired
    const authState = authService.getAuthState();
    expect(authState.isAuthenticated).toBe(false);
  });

  it('should detect expiring sessions', async () => {
    const credentials = {
      email: 'merchant@bobssneakers.com',
      password: 'password',
    };

    await authService.login(credentials);
    
    // Set expiration to 2 minutes from now (within warning threshold)
    const soonExpiry = Date.now() + 2 * 60 * 1000;
    sessionStorage.setItem('auth_expires_at', soonExpiry.toString());
    
    expect(authService.isSessionExpiringSoon()).toBe(true);
  });

  it('should clear all auth data on logout', async () => {
    const credentials = {
      email: 'merchant@bobssneakers.com',
      password: 'password',
    };

    // Login with remember me
    await authService.login(credentials, { rememberMe: true });
    
    expect(localStorage.getItem('auth_token')).toBeTruthy();
    expect(localStorage.getItem('auth_user')).toBeTruthy();
    
    // Logout
    await authService.logout();
    
    expect(authService.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  it('should notify subscribers of auth state changes', async () => {
    const mockListener = vi.fn();
    const unsubscribe = authService.subscribe(mockListener);

    const credentials = {
      email: 'merchant@bobssneakers.com',
      password: 'password',
    };

    // Login should trigger notification
    await authService.login(credentials);
    
    expect(mockListener).toHaveBeenCalledWith(
      expect.objectContaining({
        isAuthenticated: true,
        user: expect.objectContaining({
          email: credentials.email,
        }),
      })
    );

    // Logout should trigger notification
    await authService.logout();
    
    expect(mockListener).toHaveBeenCalledWith(
      expect.objectContaining({
        isAuthenticated: false,
        user: null,
      })
    );

    unsubscribe();
  });

  it('should handle invalid credentials properly', async () => {
    const invalidCredentials = {
      email: 'invalid@example.com',
      password: 'wrongpassword',
    };

    await expect(authService.login(invalidCredentials)).rejects.toThrow('Invalid credentials');
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('should provide accurate time until expiry', async () => {
    const credentials = {
      email: 'merchant@bobssneakers.com',
      password: 'password',
    };

    await authService.login(credentials);
    
    const timeUntilExpiry = authService.getTimeUntilExpiry();
    expect(timeUntilExpiry).toBeGreaterThan(0);
    expect(timeUntilExpiry).toBeLessThanOrEqual(3600 * 1000); // Should be <= 1 hour
  });
});