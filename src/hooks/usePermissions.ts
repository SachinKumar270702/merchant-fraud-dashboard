/**
 * React hook for role-based access control
 * 
 * This hook provides convenient access to permission checking functions
 * within React components, automatically using the current authenticated user.
 */

import { useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { UserRole, Permission } from '../types';
import { createPermissionChecker } from '../utils/permissions';

/**
 * Hook that provides permission checking functions for the current user
 * 
 * @returns Object with permission checking functions
 */
export function usePermissions() {
  const { user } = useAuthContext();
  
  // Memoize the permission checker to avoid recreating on every render
  const permissionChecker = useMemo(() => {
    return createPermissionChecker(user);
  }, [user]);
  
  return permissionChecker;
}

/**
 * Hook that checks if the current user has a specific permission
 * 
 * @param permission - The permission to check
 * @returns boolean indicating if user has the permission
 */
export function useHasPermission(permission: Permission): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

/**
 * Hook that checks if the current user has any of the specified permissions
 * 
 * @param permissions - Array of permissions to check (OR logic)
 * @returns boolean indicating if user has at least one permission
 */
export function useHasAnyPermission(permissions: Permission[]): boolean {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(permissions);
}

/**
 * Hook that checks if the current user has all of the specified permissions
 * 
 * @param permissions - Array of permissions to check (AND logic)
 * @returns boolean indicating if user has all permissions
 */
export function useHasAllPermissions(permissions: Permission[]): boolean {
  const { hasAllPermissions } = usePermissions();
  return hasAllPermissions(permissions);
}

/**
 * Hook that checks if the current user has a specific role
 * 
 * @param role - The role to check
 * @returns boolean indicating if user has the role
 */
export function useHasRole(role: UserRole): boolean {
  const { hasRole } = usePermissions();
  return hasRole(role);
}

/**
 * Hook that checks if the current user has any of the specified roles
 * 
 * @param roles - Array of roles to check (OR logic)
 * @returns boolean indicating if user has at least one role
 */
export function useHasAnyRole(roles: UserRole[]): boolean {
  const { hasAnyRole } = usePermissions();
  return hasAnyRole(roles);
}

/**
 * Hook that checks if the current user has minimum role hierarchy
 * 
 * @param minimumRole - The minimum role required
 * @returns boolean indicating if user meets minimum role requirement
 */
export function useHasMinimumRole(minimumRole: UserRole): boolean {
  const { hasMinimumRole } = usePermissions();
  return hasMinimumRole(minimumRole);
}

/**
 * Hook that gets all permissions for the current user
 * 
 * @returns Array of all permissions the user has
 */
export function useUserPermissions(): Permission[] {
  const { getUserPermissions } = usePermissions();
  return getUserPermissions();
}

/**
 * Hook that gets role information for the current user
 * 
 * @returns Role configuration object or null if no user
 */
export function useUserRoleInfo() {
  const { getUserRoleInfo } = usePermissions();
  return getUserRoleInfo();
}

/**
 * Hook that provides a function to check route access
 * 
 * @returns Function to check if user can access routes with specific permissions
 */
export function useCanAccessRoute() {
  const { canAccessRoute } = usePermissions();
  return canAccessRoute;
}

export default usePermissions;