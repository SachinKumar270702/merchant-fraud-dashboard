# Authentication Context

This directory contains the authentication context infrastructure for the merchant fraud dashboard.

## AuthContext

The `AuthContext` provides a centralized way to manage authentication state across the application. It wraps the existing `useAuth` hook and provides a consistent interface for all components.

### Usage

```tsx
import { AuthProvider, useAuthContext } from './contexts';

// Wrap your app with AuthProvider
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <YourAppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Use the context in components
function MyComponent() {
  const auth = useAuthContext();
  
  if (auth.isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!auth.isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {auth.user?.email}!</div>;
}
```

### Interface

The `AuthContextType` interface provides:

- **State**: `isAuthenticated`, `user`
- **Loading states**: `isLoading`, `isLoggingIn`, `isLoggingOut`
- **Error states**: `error`
- **Actions**: `login()`, `logout()`, `clearError()`
- **Utilities**: `checkAuthStatus()`

### Implementation Details

- Wraps the existing `useAuth` hook from `src/hooks/useAuth.ts`
- Maintains backward compatibility with current authentication logic
- Provides proper TypeScript types for all authentication state
- Includes error handling and loading state management
- Ready for integration with protected routes and other authentication features

### Requirements Satisfied

- **4.1**: Provides reusable authentication context for consistent patterns
- **4.3**: Uses proper TypeScript types for authentication state management