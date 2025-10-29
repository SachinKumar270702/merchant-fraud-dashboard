/**
 * Demo component showing role-based access control usage
 * 
 * This component demonstrates how to use the new RBAC features:
 * - ProtectedRoute with role/permission requirements
 * - usePermissions hook for conditional rendering
 * - Permission checking utilities
 */

import React from 'react';
import { usePermissions, useUserRoleInfo } from '../hooks/usePermissions';
import { PERMISSION_GROUPS } from '../utils/permissions';

export const RoleBasedAccessDemo: React.FC = () => {
  const {
    hasPermission,
    hasAnyPermission,
    hasRole,
    hasMinimumRole,
    getUserPermissions,
  } = usePermissions();
  
  const roleInfo = useUserRoleInfo();
  const allPermissions = getUserPermissions();

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h2>Role-Based Access Control Demo</h2>
      
      {/* User Role Information */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <h3>Current User Role</h3>
        {roleInfo ? (
          <div>
            <p><strong>Role:</strong> {roleInfo.displayName}</p>
            <p><strong>Description:</strong> {roleInfo.description}</p>
            <p><strong>Hierarchy Level:</strong> {roleInfo.hierarchy}</p>
          </div>
        ) : (
          <p>No user logged in</p>
        )}
      </div>

      {/* Permission Checks */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Permission Checks</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          
          {/* Dashboard Access */}
          <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h4>Dashboard Access</h4>
            <p>Can view dashboard: {hasPermission('dashboard:view') ? '✅' : '❌'}</p>
            <p>Can export dashboard: {hasPermission('dashboard:export') ? '✅' : '❌'}</p>
            <p>Has dashboard access: {hasAnyPermission(PERMISSION_GROUPS.DASHBOARD_ACCESS) ? '✅' : '❌'}</p>
          </div>

          {/* Transaction Management */}
          <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h4>Transaction Management</h4>
            <p>Can view transactions: {hasPermission('transactions:view') ? '✅' : '❌'}</p>
            <p>Can manage transactions: {hasPermission('transactions:manage') ? '✅' : '❌'}</p>
            <p>Has full transaction access: {hasAnyPermission(PERMISSION_GROUPS.TRANSACTIONS_FULL) ? '✅' : '❌'}</p>
          </div>

          {/* Analytics */}
          <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h4>Analytics</h4>
            <p>Can view analytics: {hasPermission('analytics:view') ? '✅' : '❌'}</p>
            <p>Can access advanced analytics: {hasPermission('analytics:advanced') ? '✅' : '❌'}</p>
            <p>Has advanced analytics: {hasAnyPermission(PERMISSION_GROUPS.ANALYTICS_ADVANCED) ? '✅' : '❌'}</p>
          </div>

          {/* Administration */}
          <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h4>Administration</h4>
            <p>Can manage settings: {hasPermission('settings:manage') ? '✅' : '❌'}</p>
            <p>Can manage users: {hasPermission('users:manage') ? '✅' : '❌'}</p>
            <p>Is admin: {hasRole('admin') ? '✅' : '❌'}</p>
            <p>Has admin privileges: {hasAnyPermission(PERMISSION_GROUPS.ADMIN_ONLY) ? '✅' : '❌'}</p>
          </div>
        </div>
      </div>

      {/* Role Hierarchy Checks */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Role Hierarchy Checks</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center' }}>
            <p><strong>Viewer+</strong></p>
            <p>{hasMinimumRole('viewer') ? '✅' : '❌'}</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center' }}>
            <p><strong>Analyst+</strong></p>
            <p>{hasMinimumRole('analyst') ? '✅' : '❌'}</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center' }}>
            <p><strong>Manager+</strong></p>
            <p>{hasMinimumRole('manager') ? '✅' : '❌'}</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center' }}>
            <p><strong>Admin</strong></p>
            <p>{hasMinimumRole('admin') ? '✅' : '❌'}</p>
          </div>
        </div>
      </div>

      {/* All User Permissions */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>All User Permissions</h3>
        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          {allPermissions.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {allPermissions.map(permission => (
                <li key={permission} style={{ marginBottom: '0.25rem' }}>
                  {permission}
                </li>
              ))}
            </ul>
          ) : (
            <p>No permissions available</p>
          )}
        </div>
      </div>

      {/* Conditional Rendering Examples */}
      <div>
        <h3>Conditional Rendering Examples</h3>
        
        {hasPermission('dashboard:export') && (
          <div style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '8px', marginBottom: '1rem' }}>
            <p>🎉 You can see this export button because you have dashboard:export permission!</p>
            <button style={{ padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px' }}>
              Export Dashboard Data
            </button>
          </div>
        )}

        {hasPermission('users:manage') && (
          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', marginBottom: '1rem' }}>
            <p>⚡ Admin panel visible because you have users:manage permission!</p>
            <button style={{ padding: '0.5rem 1rem', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '4px' }}>
              Manage Users
            </button>
          </div>
        )}

        {hasMinimumRole('manager') && (
          <div style={{ padding: '1rem', backgroundColor: '#e0e7ff', borderRadius: '8px', marginBottom: '1rem' }}>
            <p>🔧 Manager tools available because you have manager+ role!</p>
            <button style={{ padding: '0.5rem 1rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px' }}>
              Advanced Settings
            </button>
          </div>
        )}

        {!hasPermission('analytics:advanced') && (
          <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            <p>🔒 Advanced analytics is not available with your current permissions.</p>
            <p>Contact your administrator to request access.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleBasedAccessDemo;