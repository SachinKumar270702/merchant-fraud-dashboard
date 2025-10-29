import React from 'react';

// Minimal debug version of the app
function AppDebug() {
  console.log('🐛 Debug App rendering...');
  
  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#1a202c' }}>🚀 Merchant Fraud Dashboard</h1>
      <p style={{ color: '#4a5568' }}>Debug version - App is working!</p>
      
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '8px',
        marginTop: '1rem',
        border: '1px solid #e2e8f0'
      }}>
        <h2>System Check:</h2>
        <ul>
          <li>✅ React is working</li>
          <li>✅ Styles are loading</li>
          <li>✅ JavaScript is executing</li>
          <li>✅ Console logging is working</li>
        </ul>
      </div>
      
      <button 
        onClick={() => console.log('Button clicked!')}
        style={{
          background: '#667eea',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          marginTop: '1rem',
          cursor: 'pointer'
        }}
      >
        Test Button (Check Console)
      </button>
    </div>
  );
}

export default AppDebug;