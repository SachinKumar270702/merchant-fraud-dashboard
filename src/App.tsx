import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout, Dashboard, LoginForm, ProtectedRoute, AuthStatusManager, AuthStatusDemo } from './components';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthErrorBoundary } from './components/AuthErrorBoundary';
import { SessionTimeoutWarning } from './components/SessionTimeoutWarning';
import { AuthProvider, useAuthContext } from './contexts';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { Transaction } from './types';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});



const AppContent: React.FC = () => {
  console.log('🔄 AppContent component rendering...');
  
  const { isAuthenticated, user, logout, isLoading } = useAuthContext();
  
  // Session timeout management
  const {
    showWarning: showSessionWarning,
    extendSession,
    logout: sessionLogout,
  } = useSessionTimeout({
    warningThresholdMs: 5 * 60 * 1000, // 5 minutes
    onSessionExpired: () => {
      console.log('Session expired, logging out...');
      logout();
    },
  });
  
  console.log('🔐 Auth state:', { isAuthenticated, user: user?.email, isLoading });

  const handleTransactionClick = (transaction: Transaction) => {
    console.log('Transaction selected:', transaction);
    // Here you could open a modal or navigate to a detail page
  };

  const handleLogout = () => {
    logout();
  };

  // Show loading while checking authentication
  if (isLoading) {
    console.log('⏳ Loading user...');
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        color: '#718096',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        <div>Loading Merchant Fraud Dashboard...</div>
        <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.7 }}>
          Checking authentication...
        </div>
      </div>
    );
  }

  // Router-based navigation
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout user={user!} onLogout={handleLogout}>
                  <Dashboard onTransactionClick={handleTransactionClick} />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/demo" 
            element={<AuthStatusDemo />} 
          />
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } 
          />
        </Routes>
      </BrowserRouter>
      
      {/* Session timeout warning modal */}
      {showSessionWarning && (
        <SessionTimeoutWarning
          onExtendSession={extendSession}
          onLogout={sessionLogout}
        />
      )}
      
      {/* Global authentication status manager */}
      <AuthStatusManager
        showLoadingOverlay={true}
        showInlineStatus={false}
        overlayBackdrop={false}
        position="center"
      />
    </>
  );
};

function App() {
  console.log('🚀 App component rendering...');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthErrorBoundary
          onError={(error, errorInfo) => {
            console.error('Authentication error caught by boundary:', error, errorInfo);
          }}
        >
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </AuthErrorBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;