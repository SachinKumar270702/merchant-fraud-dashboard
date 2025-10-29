/**
 * Tests for role-based access control utilities
 */

import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  hasMinimumRole,
  getUserPermissions,
  getUserRoleInfo,
  canAccessRoute,
  PERMISSION_GROUPS,
} from '../permissions';
import { User, UserRole, Permission } from '../../types';

// Mock user data for testing
const createMockUser = (role: UserRole, additionalPermissions: Permission[] = []): User => ({
  id: '1',
  email: 'test@example.com',
  merchantName: 'Test Merchant',
  role,
  permissions: additionalPermissions,
  preferences: {
    theme: 'light',
    defaultTimeRange: '30d',
    notifications: true,
  },
});

describe('Permission Utilities', () => {
  describe('hasPermission', () => {
    it('should return true for admin user with dashboard:view permission', () => {
      const user = createMockUser('admin');
      expect(hasPermission(user, 'dashboard:view')).toBe(true);
    });

    it('should return false for viewer user with users:manage permission', () => {
      const user = createMockUser('viewer');
      expect(hasPermission(user, 'users:manage')).toBe(false);
    });

    it('should return true for user with direct permission', () => {
      const user = createMockUser('viewer', ['analytics:advanced']);
      expect(hasPermission(user, 'analytics:advanced')).toBe(true);
    });

    it('should return false for null user', () => {
      expect(hasPermission(null, 'dashboard:view')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has at least one permission', () => {
      const user = createMockUser('analyst');
      expect(hasAnyPermission(user, ['dashboard:view', 'users:manage'])).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      const user = createMockUser('viewer');
      expect(hasAnyPermission(user, ['users:manage', 'settings:manage'])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all permissions', () => {
      const user = createMockUser('admin');
      expect(hasAllPermissions(user, ['dashboard:view', 'transactions:view'])).toBe(true);
    });

    it('should return false if user is missing any permission', () => {
      const user = createMockUser('viewer');
      expect(hasAllPermissions(user, ['dashboard:view', 'users:manage'])).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true for matching role', () => {
      const user = createMockUser('admin');
      expect(hasRole(user, 'admin')).toBe(true);
    });

    it('should return false for non-matching role', () => {
      const user = createMockUser('viewer');
      expect(hasRole(user, 'admin')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true if user has one of the roles', () => {
      const user = createMockUser('manager');
      expect(hasAnyRole(user, ['admin', 'manager'])).toBe(true);
    });

    it('should return false if user has none of the roles', () => {
      const user = createMockUser('viewer');
      expect(hasAnyRole(user, ['admin', 'manager'])).toBe(false);
    });
  });

  describe('hasMinimumRole', () => {
    it('should return true for admin when minimum is viewer', () => {
      const user = createMockUser('admin');
      expect(hasMinimumRole(user, 'viewer')).toBe(true);
    });

    it('should return false for viewer when minimum is admin', () => {
      const user = createMockUser('viewer');
      expect(hasMinimumRole(user, 'admin')).toBe(false);
    });

    it('should return true for same role level', () => {
      const user = createMockUser('analyst');
      expect(hasMinimumRole(user, 'analyst')).toBe(true);
    });
  });

  describe('getUserPermissions', () => {
    it('should return all permissions for admin', () => {
      const user = createMockUser('admin');
      const permissions = getUserPermissions(user);
      expect(permissions).toContain('dashboard:view');
      expect(permissions).toContain('users:manage');
    });

    it('should combine role and direct permissions', () => {
      const user = createMockUser('viewer', ['analytics:advanced']);
      const permissions = getUserPermissions(user);
      expect(permissions).toContain('dashboard:view'); // from role
      expect(permissions).toContain('analytics:advanced'); // direct permission
    });

    it('should remove duplicates', () => {
      const user = createMockUser('viewer', ['dashboard:view']); // duplicate permission
      const permissions = getUserPermissions(user);
      const dashboardViewCount = permissions.filter(p => p === 'dashboard:view').length;
      expect(dashboardViewCount).toBe(1);
    });
  });

  describe('getUserRoleInfo', () => {
    it('should return role configuration for valid user', () => {
      const user = createMockUser('admin');
      const roleInfo = getUserRoleInfo(user);
      expect(roleInfo?.name).toBe('admin');
      expect(roleInfo?.displayName).toBe('Administrator');
    });

    it('should return null for null user', () => {
      expect(getUserRoleInfo(null)).toBeNull();
    });
  });

  describe('canAccessRoute', () => {
    it('should return true if user has required permissions', () => {
      const user = createMockUser('admin');
      expect(canAccessRoute(user, ['dashboard:view'])).toBe(true);
    });

    it('should return false if user lacks required permissions', () => {
      const user = createMockUser('viewer');
      expect(canAccessRoute(user, ['users:manage'])).toBe(false);
    });

    it('should work with requireAll=true', () => {
      const user = createMockUser('admin');
      expect(canAccessRoute(user, ['dashboard:view', 'users:manage'], true)).toBe(true);
      
      const limitedUser = createMockUser('viewer');
      expect(canAccessRoute(limitedUser, ['dashboard:view', 'users:manage'], true)).toBe(false);
    });
  });

  describe('PERMISSION_GROUPS', () => {
    it('should contain expected permission groups', () => {
      expect(PERMISSION_GROUPS.DASHBOARD_ACCESS).toEqual(['dashboard:view']);
      expect(PERMISSION_GROUPS.ADMIN_ONLY).toEqual(['users:manage']);
    });
  });
});