/**
 * Role-based access control utilities
 * 
 * This module provides utilities for checking user permissions and roles
 * in the merchant fraud dashboard application.
 */

import { User, UserRole, Permission, ROLE_CONFIGS } from '../types';

/**
 * Check if a user has a specific permission
 * 
 * @param user - The user object to check permissions for
 * @param permission - The permission to check
 * @returns true if user has the permission, false otherwise
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  
  // Check if user has the permission directly
  if (user.permissions.includes(permission)) {
    return true;
  }
  
  // Check if user's role includes the permission
  const roleConfig = ROLE_CONFIGS[user.role];
  return roleConfig.permissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 * 
 * @param user - The user object to check permissions for
 * @param permissions - Array of permissions to check (OR logic)
 * @returns true if user has at least one of the permissions
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user || permissions.length === 0) return false;
  
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if a user has all of the specified permissions
 * 
 * @param user - The user object to check permissions for
 * @param permissions - Array of permissions to check (AND logic)
 * @returns true if user has all of the permissions
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user || permissions.length === 0) return false;
  
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Check if a user has a specific role
 * 
 * @param user - The user object to check role for
 * @param role - The role to check
 * @returns true if user has the role, false otherwise
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Check if a user has any of the specified roles
 * 
 * @param user - The user object to check roles for
 * @param roles - Array of roles to check (OR logic)
 * @returns true if user has at least one of the roles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user || roles.length === 0) return false;
  
  return roles.includes(user.role);
}

/**
 * Check if a user has a role with equal or higher hierarchy level
 * 
 * @param user - The user object to check role hierarchy for
 * @param minimumRole - The minimum role required
 * @returns true if user's role hierarchy is >= minimum role hierarchy
 */
export function hasMinimumRole(user: User | null, minimumRole: UserRole): boolean {
  if (!user) return false;
  
  const userHierarchy = ROLE_CONFIGS[user.role].hierarchy;
  const minimumHierarchy = ROLE_CONFIGS[minimumRole].hierarchy;
  
  return userHierarchy >= minimumHierarchy;
}

/**
 * Get all permissions for a user (role-based + direct permissions)
 * 
 * @param user - The user object to get permissions for
 * @returns Array of all permissions the user has
 */
export function getUserPermissions(user: User | null): Permission[] {
  if (!user) return [];
  
  const rolePermissions = ROLE_CONFIGS[user.role].permissions;
  const allPermissions = [...rolePermissions, ...user.permissions];
  
  // Remove duplicates
  return Array.from(new Set(allPermissions));
}

/**
 * Get user role display information
 * 
 * @param user - The user object to get role info for
 * @returns Role configuration object with display information
 */
export function getUserRoleInfo(user: User | null) {
  if (!user) return null;
  
  return ROLE_CONFIGS[user.role];
}

/**
 * Check if a user can access a specific route based on required permissions
 * 
 * @param user - The user object to check access for
 * @param requiredPermissions - Array of permissions required for the route
 * @param requireAll - If true, user must have ALL permissions. If false, user needs ANY permission
 * @returns true if user can access the route
 */
export function canAccessRoute(
  user: User | null, 
  requiredPermissions: Permission[], 
  requireAll: boolean = false
): boolean {
  if (!user || requiredPermissions.length === 0) return false;
  
  return requireAll 
    ? hasAllPermissions(user, requiredPermissions)
    : hasAnyPermission(user, requiredPermissions);
}

/**
 * Permission checking hook for React components
 * Returns an object with permission checking functions bound to the current user
 */
export function createPermissionChecker(user: User | null) {
  return {
    hasPermission: (permission: Permission) => hasPermission(user, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(user, permissions),
    hasRole: (role: UserRole) => hasRole(user, role),
    hasAnyRole: (roles: UserRole[]) => hasAnyRole(user, roles),
    hasMinimumRole: (minimumRole: UserRole) => hasMinimumRole(user, minimumRole),
    canAccessRoute: (requiredPermissions: Permission[], requireAll?: boolean) => 
      canAccessRoute(user, requiredPermissions, requireAll),
    getUserPermissions: () => getUserPermissions(user),
    getUserRoleInfo: () => getUserRoleInfo(user),
  };
}

// Common permission groups for easier route protection
export const PERMISSION_GROUPS = {
  DASHBOARD_ACCESS: ['dashboard:view'] as Permission[],
  DASHBOARD_FULL: ['dashboard:view', 'dashboard:export'] as Permission[],
  TRANSACTIONS_READ: ['transactions:view'] as Permission[],
  TRANSACTIONS_FULL: ['transactions:view', 'transactions:export', 'transactions:manage'] as Permission[],
  ANALYTICS_BASIC: ['analytics:view'] as Permission[],
  ANALYTICS_ADVANCED: ['analytics:view', 'analytics:advanced'] as Permission[],
  SETTINGS_READ: ['settings:view'] as Permission[],
  SETTINGS_FULL: ['settings:view', 'settings:manage'] as Permission[],
  ADMIN_ONLY: ['users:manage'] as Permission[],
} as const;