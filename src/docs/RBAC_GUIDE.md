# Role-Based Access Control (RBAC) Guide

This guide explains how to use the role-based access control system implemented in the merchant fraud dashboard.

## Overview

The RBAC system provides fine-grained control over user access to different parts of the application based on:
- **User Roles**: Predefined roles with specific permission sets
- **Permissions**: Granular access controls for specific features
- **Role Hierarchy**: Higher-level roles inherit permissions from lower levels

## User Roles

### Role Hierarchy (lowest to highest)

1. **Viewer** (hierarchy: 1)
   - Basic read-only access
   - Can view dashboard and transactions
   - Permissions: `dashboard:view`, `transactions:view`

2. **Analyst** (hierarchy: 2)
   - Read-only access with export capabilities
   - Can access basic analytics
   - Permissions: `dashboard:view`, `dashboard:export`, `transactions:view`, `transactions:export`, `analytics:view`

3. **Manager** (hierarchy: 3)
   - Advanced access with transaction management
   - Can access advanced analytics and settings
   - Permissions: All analyst permissions + `transactions:manage`, `analytics:advanced`, `settings:view`

4. **Admin** (hierarchy: 4)
   - Full system access
   - Can manage users and system settings
   - Permissions: All manager permissions + `settings:manage`, `users:view`, `users:manage`

## Available Permissions

### Dashboard Permissions
- `dashboard:view` - View dashboard content
- `dashboard:export` - Export dashboard data

### Transaction Permissions
- `transactions:view` - View transaction data
- `transactions:export` - Export transaction data
- `transactions:manage` - Manage transaction statuses and settings

### Analytics Permissions
- `analytics:view` - View basic analytics
- `analytics:advanced` - Access advanced analytics features

### Settings Permissions
- `settings:view` - View application settings
- `settings:manage` - Modify application settings

### User Management Permissions
- `users:view` - View user information
- `users:manage` - Create, modify, and delete users

## Using ProtectedRoute with RBAC

### Basic Authentication Protection

```tsx
import { ProtectedRoute } from '../components/ProtectedRoute';

// Requires authentication only
<ProtectedRoute>
  <DashboardContent />
</ProtectedRoute>
```

### Role-Based Protection

```tsx
// Require specific roles
<ProtectedRoute requiredRoles={['admin', 'manager']}>
  <AdminPanel />
</ProtectedRoute>

// Require minimum role level
<ProtectedRoute minimumRole="analyst">
  <AnalyticsPage />
</ProtectedRoute>
```

### Permission-Based Protection

```tsx
// Require specific permissions (ANY)
<ProtectedRoute requiredPermissions={['transactions:manage', 'settings:manage']}>
  <ManagementTools />
</ProtectedRoute>

// Require all permissions (ALL)
<ProtectedRoute 
  requiredPermissions={['users:view', 'users:manage']} 
  requireAllPermissions={true}
>
  <UserManagement />
</ProtectedRoute>
```

### Custom Access Denied Component

```tsx
<ProtectedRoute 
  requiredPermissions={['admin:only']}
  accessDeniedComponent={<CustomAccessDenied />}
>
  <SuperSecretFeature />
</ProtectedRoute>
```

## Using Permission Hooks

### usePermissions Hook

```tsx
import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasMinimumRole,
    getUserPermissions,
    getUserRoleInfo,
  } = usePermissions();

  return (
    <div>
      {hasPermission('dashboard:export') && (
        <button>Export Data</button>
      )}
      
      {hasMinimumRole('manager') && (
        <div>Manager Tools</div>
      )}
    </div>
  );
}
```

### Individual Permission Hooks

```tsx
import { 
  useHasPermission, 
  useHasRole, 
  useUserRoleInfo 
} from '../hooks/usePermissions';

function ToolbarComponent() {
  const canExport = useHasPermission('dashboard:export');
  const isAdmin = useHasRole('admin');
  const roleInfo = useUserRoleInfo();

  return (
    <div>
      <span>Welcome, {roleInfo?.displayName}</span>
      {canExport && <button>Export</button>}
      {isAdmin && <button>Admin Panel</button>}
    </div>
  );
}
```

## Using Permission Utilities

### Direct Permission Checking

```tsx
import { hasPermission, hasMinimumRole } from '../utils/permissions';

function checkUserAccess(user: User) {
  if (hasPermission(user, 'users:manage')) {
    // User can manage other users
  }
  
  if (hasMinimumRole(user, 'manager')) {
    // User has manager-level access or higher
  }
}
```

### Permission Groups

```tsx
import { PERMISSION_GROUPS, hasAnyPermission } from '../utils/permissions';

function DashboardComponent({ user }: { user: User }) {
  const canAccessDashboard = hasAnyPermission(user, PERMISSION_GROUPS.DASHBOARD_ACCESS);
  const hasFullTransactionAccess = hasAnyPermission(user, PERMISSION_GROUPS.TRANSACTIONS_FULL);
  
  return (
    <div>
      {canAccessDashboard && <DashboardView />}
      {hasFullTransactionAccess && <TransactionManagement />}
    </div>
  );
}
```

## Available Permission Groups

```tsx
PERMISSION_GROUPS = {
  DASHBOARD_ACCESS: ['dashboard:view'],
  DASHBOARD_FULL: ['dashboard:view', 'dashboard:export'],
  TRANSACTIONS_READ: ['transactions:view'],
  TRANSACTIONS_FULL: ['transactions:view', 'transactions:export', 'transactions:manage'],
  ANALYTICS_BASIC: ['analytics:view'],
  ANALYTICS_ADVANCED: ['analytics:view', 'analytics:advanced'],
  SETTINGS_READ: ['settings:view'],
  SETTINGS_FULL: ['settings:view', 'settings:manage'],
  ADMIN_ONLY: ['users:manage'],
}
```

## Route Configuration Examples

### App.tsx Route Setup

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';
import { PERMISSION_GROUPS } from './utils/permissions';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginForm />} />
      
      {/* Basic authenticated routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Role-based routes */}
      <Route path="/analytics" element={
        <ProtectedRoute minimumRole="analyst">
          <AnalyticsPage />
        </ProtectedRoute>
      } />
      
      {/* Permission-based routes */}
      <Route path="/settings" element={
        <ProtectedRoute requiredPermissions={PERMISSION_GROUPS.SETTINGS_READ}>
          <SettingsPage />
        </ProtectedRoute>
      } />
      
      {/* Admin-only routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredPermissions={PERMISSION_GROUPS.ADMIN_ONLY}>
          <AdminRoutes />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

## Best Practices

### 1. Use Permission Groups
Instead of hardcoding permission arrays, use the predefined permission groups:

```tsx
// ✅ Good
<ProtectedRoute requiredPermissions={PERMISSION_GROUPS.DASHBOARD_FULL}>

// ❌ Avoid
<ProtectedRoute requiredPermissions={['dashboard:view', 'dashboard:export']}>
```

### 2. Prefer Minimum Role for Hierarchical Access
When you need "this role or higher", use `minimumRole`:

```tsx
// ✅ Good - allows manager, admin
<ProtectedRoute minimumRole="manager">

// ❌ Avoid - requires explicit role list
<ProtectedRoute requiredRoles={['manager', 'admin']}>
```

### 3. Use Hooks for Conditional Rendering
For UI elements that should appear/disappear based on permissions:

```tsx
// ✅ Good
const canExport = useHasPermission('dashboard:export');
return (
  <div>
    {canExport && <ExportButton />}
  </div>
);

// ❌ Avoid wrapping every small element in ProtectedRoute
```

### 4. Combine Multiple Protection Methods
You can combine role and permission requirements:

```tsx
<ProtectedRoute 
  minimumRole="analyst"
  requiredPermissions={['analytics:advanced']}
>
  <AdvancedAnalytics />
</ProtectedRoute>
```

## Testing RBAC

### Mock Users for Testing

```tsx
const createTestUser = (role: UserRole, additionalPermissions: Permission[] = []): User => ({
  id: 'test-user',
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

// Test with different roles
const adminUser = createTestUser('admin');
const viewerUser = createTestUser('viewer');
const analystWithExtraPerms = createTestUser('analyst', ['users:view']);
```

### Testing Components

```tsx
import { render } from '@testing-library/react';
import { AuthContext } from '../contexts/AuthContext';

function renderWithUser(component: React.ReactElement, user: User) {
  const mockAuthContext = {
    user,
    isAuthenticated: true,
    isLoading: false,
    // ... other auth context values
  };

  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  );
}
```

## Troubleshooting

### Common Issues

1. **Access Denied for Expected Users**
   - Check if the user's role includes the required permissions
   - Verify the role hierarchy is correct
   - Ensure permissions are properly configured in `ROLE_CONFIGS`

2. **Hooks Not Working**
   - Ensure components are wrapped with `AuthProvider`
   - Check that user data is properly loaded in the auth context

3. **TypeScript Errors**
   - Import types from `../types`: `UserRole`, `Permission`
   - Ensure all permission strings match the `Permission` type definition

### Debug User Permissions

Use the `RoleBasedAccessDemo` component to debug user permissions:

```tsx
import { RoleBasedAccessDemo } from '../components/RoleBasedAccessDemo';

// Add to your app temporarily to debug
<RoleBasedAccessDemo />
```

This will show all current user permissions, role information, and permission checks.