import React, { useState } from 'react';
import { AuthLoading, AuthLoadingPresets } from './AuthLoading';

export const AuthLoadingDemo: React.FC = () => {
  const [currentDemo, setCurrentDemo] = useState<string>('default');

  const demos = {
    default: <AuthLoading />,
    customMessage: <AuthLoading message="Custom loading message..." />,
    withProgress: <AuthLoading message="Loading with progress..." showProgress={true} />,
    smallSpinner: <AuthLoading message="Small spinner" size="small" variant="spinner" />,
    mediumDots: <AuthLoading message="Medium dots" size="medium" variant="dots" />,
    largePulse: <AuthLoading message="Large pulse" size="large" variant="pulse" />,
    routeCheck: AuthLoadingPresets.routeCheck,
    loginProgress: AuthLoadingPresets.loginProgress,
    logoutProgress: AuthLoadingPresets.logoutProgress,
    tokenRefresh: AuthLoadingPresets.tokenRefresh,
  };

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-4">AuthLoading Component Demo</h2>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.keys(demos).map((demoKey) => (
          <button
            key={demoKey}
            onClick={() => setCurrentDemo(demoKey)}
            className={`px-3 py-1 rounded text-sm ${
              currentDemo === demoKey
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {demoKey}
          </button>
        ))}
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
        {demos[currentDemo as keyof typeof demos]}
      </div>

      <div className="text-sm text-gray-600">
        <h3 className="font-semibold mb-2">Current Demo: {currentDemo}</h3>
        <p>This demo showcases the AuthLoading component with different configurations.</p>
        <p>The component meets requirements 5.1 and 5.2 by providing:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Loading indicators during authentication verification</li>
          <li>Clear visual feedback with customizable messages</li>
          <li>Progress bars for enhanced user experience</li>
          <li>Accessible loading states with proper ARIA attributes</li>
          <li>Multiple variants (spinner, dots, pulse) and sizes</li>
          <li>Preset configurations for common use cases</li>
        </ul>
      </div>
    </div>
  );
};