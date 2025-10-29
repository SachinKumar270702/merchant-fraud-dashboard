# AuthLoading Component Usage Examples

The AuthLoading component provides enhanced loading states for authentication processes with accessibility features and multiple variants.

## Basic Usage

```tsx
import { AuthLoading } from './components';

// Default loading state
<AuthLoading />

// Custom message
<AuthLoading message="Checking your credentials..." />

// With progress bar
<AuthLoading message="Signing you in..." showProgress={true} />
```

## Variants and Sizes

```tsx
// Different variants
<AuthLoading variant="spinner" />  // Default
<AuthLoading variant="dots" />
<AuthLoading variant="pulse" />

// Different sizes
<AuthLoading size="small" />
<AuthLoading size="medium" />  // Default
<AuthLoading size="large" />
```

## Preset Configurations

```tsx
import { AuthLoadingPresets } from './components';

// Pre-configured loading states for common scenarios
{AuthLoadingPresets.routeCheck}      // For route protection
{AuthLoadingPresets.loginProgress}   // For login forms
{AuthLoadingPresets.logoutProgress}  // For logout process
{AuthLoadingPresets.tokenRefresh}    // For token refresh
{AuthLoadingPresets.fullPage}        // Full page overlay
```

## Integration with ProtectedRoute

```tsx
import { ProtectedRoute, AuthLoading } from './components';

<ProtectedRoute 
  fallback={<AuthLoading message="Verifying access..." />}
>
  <Dashboard />
</ProtectedRoute>
```

## Integration with Login Form

```tsx
import { AuthLoading } from './components';

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <form>
      {/* form fields */}
      <button disabled={isLoading}>
        {isLoading ? (
          <AuthLoading 
            message="Signing in..." 
            size="small" 
            variant="dots" 
          />
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
};
```

## Accessibility Features

The AuthLoading component includes:

- **ARIA attributes**: `role="status"`, `aria-live="polite"`, `aria-busy="true"`
- **Screen reader support**: Hidden descriptive text for screen readers
- **Progress indicators**: Proper `progressbar` role with value attributes
- **Loading labels**: Clear `aria-label` attributes for loading indicators
- **Semantic markup**: Proper heading structure and focus management

## Requirements Compliance

### Requirement 5.1: Loading Indicators
- ✅ Displays loading indicator during authentication verification
- ✅ Multiple visual variants (spinner, dots, pulse)
- ✅ Customizable sizes and messages

### Requirement 5.2: Clear Visual Feedback
- ✅ Progress bars for enhanced feedback
- ✅ Customizable messages for different states
- ✅ Visual indicators for various authentication processes
- ✅ Accessible loading states with proper ARIA support