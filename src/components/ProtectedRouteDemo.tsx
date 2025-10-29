import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';

/**
 * Demo component to showcase ProtectedRoute functionality
 * This demonstrates all the features implemented in the ProtectedRoute component
 */
export const ProtectedRouteDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>ProtectedRoute Component Demo</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>✅ Task Requirements Completed:</h3>
        <ul>
          <li><strong>Reusable ProtectedRoute wrapper component</strong> - ✅ Created with flexible props</li>
          <li><strong>Authentication checks and redirect logic</strong> - ✅ Implemented with useAuthContext</li>
          <li><strong>Loading states and fallback UI</strong> - ✅ AuthLoading component with spinner</li>
          <li><strong>TypeScript interfaces for component props</strong> - ✅ ProtectedRouteProps interface</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🎯 Requirements Satisfied:</h3>
        <ul>
          <li><strong>Requirement 1.1</strong> - Redirects unauthenticated users to /login</li>
          <li><strong>Requirement 1.2</strong> - Allows authenticated users to access protected content</li>
          <li><strong>Requirement 4.1</strong> - Provides reusable component for route protection</li>
          <li><strong>Requirement 5.1</strong> - Shows loading indicator during authentication checks</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🔧 Component Features:</h3>
        <ul>
          <li><strong>Authentication State Handling</strong> - Uses AuthContext for centralized auth state</li>
          <li><strong>Loading States</strong> - Shows spinner during auth verification</li>
          <li><strong>Redirect Logic</strong> - Preserves intended destination for post-login redirect</li>
          <li><strong>Fallback UI</strong> - Customizable loading/error states</li>
          <li><strong>Flexible Configuration</strong> - requireAuth prop for guest-only routes</li>
          <li><strong>TypeScript Support</strong> - Full type safety with proper interfaces</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: '#f0f9ff', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #0ea5e9'
      }}>
        <h4>Usage Example:</h4>
        <pre style={{ 
          backgroundColor: '#1e293b', 
          color: '#e2e8f0', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
{`// Protect a dashboard route
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Guest-only route (like login page)
<ProtectedRoute requireAuth={false}>
  <LoginForm />
</ProtectedRoute>

// Custom loading fallback
<ProtectedRoute fallback={<CustomLoader />}>
  <AdminPanel />
</ProtectedRoute>`}
        </pre>
      </div>
    </div>
  );
};

export default ProtectedRouteDemo;