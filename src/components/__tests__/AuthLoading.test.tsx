import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthLoading, AuthLoadingPresets } from '../AuthLoading';

describe('AuthLoading Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<AuthLoading />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
      const customMessage = 'Custom loading message';
      render(<AuthLoading message={customMessage} />);
      
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('renders without message when message is empty', () => {
      render(<AuthLoading message="" />);
      
      expect(screen.queryByText('Verifying authentication...')).not.toBeInTheDocument();
    });
  });

  describe('Loading Variants', () => {
    it('renders spinner variant by default', () => {
      render(<AuthLoading />);
      
      const spinner = screen.getByLabelText('Loading');
      expect(spinner).toHaveClass('animate-spin');
      expect(spinner).toHaveClass('border-t-blue-600');
    });

    it('renders dots variant', () => {
      render(<AuthLoading variant="dots" />);
      
      const dotsContainer = screen.getByRole('status');
      expect(dotsContainer).toBeInTheDocument();
      // Check for multiple dots
      const dots = dotsContainer.querySelectorAll('div');
      expect(dots).toHaveLength(3);
    });

    it('renders pulse variant', () => {
      render(<AuthLoading variant="pulse" />);
      
      const pulseElement = screen.getByLabelText('Loading');
      expect(pulseElement).toHaveClass('animate-pulse');
      expect(pulseElement).toHaveClass('bg-blue-600');
    });
  });

  describe('Size Variants', () => {
    it('renders small size', () => {
      render(<AuthLoading size="small" />);
      
      const container = screen.getByRole('status').parentElement;
      expect(container).toHaveClass('text-sm');
    });

    it('renders medium size by default', () => {
      render(<AuthLoading />);
      
      const container = screen.getByRole('status').parentElement;
      expect(container).toHaveClass('text-base');
    });

    it('renders large size', () => {
      render(<AuthLoading size="large" />);
      
      const container = screen.getByRole('status').parentElement;
      expect(container).toHaveClass('text-lg');
    });
  });

  describe('Progress Bar', () => {
    it('does not show progress bar by default', () => {
      render(<AuthLoading />);
      
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('shows progress bar when showProgress is true', () => {
      render(<AuthLoading showProgress={true} />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-label', 'Authentication progress');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<AuthLoading />);
      
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
      expect(statusElement).toHaveAttribute('aria-busy', 'true');
    });

    it('has screen reader only text', () => {
      render(<AuthLoading message="Test message" />);
      
      const srText = screen.getByText(/Test message.*Please wait while we verify your authentication/);
      expect(srText).toHaveClass('sr-only');
    });

    it('has proper loading indicator labels', () => {
      render(<AuthLoading />);
      
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('has message with proper id', () => {
      render(<AuthLoading message="Test message" />);
      
      const messageElement = screen.getByText('Test message');
      expect(messageElement).toHaveAttribute('id', 'loading-message');
    });
  });

  describe('AuthLoadingPresets', () => {
    it('provides routeCheck preset', () => {
      render(AuthLoadingPresets.routeCheck);
      
      expect(screen.getByText('Checking access permissions...')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('provides loginProgress preset with progress bar', () => {
      render(AuthLoadingPresets.loginProgress);
      
      expect(screen.getByText('Signing you in...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('provides logoutProgress preset', () => {
      render(AuthLoadingPresets.logoutProgress);
      
      expect(screen.getByText('Signing you out...')).toBeInTheDocument();
    });

    it('provides tokenRefresh preset', () => {
      render(AuthLoadingPresets.tokenRefresh);
      
      expect(screen.getByText('Refreshing session...')).toBeInTheDocument();
    });

    it('provides fullPage preset with overlay', () => {
      render(AuthLoadingPresets.fullPage);
      
      expect(screen.getByText('Loading application...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Check for full page overlay classes
      const overlay = screen.getByText('Loading application...').closest('.fixed');
      expect(overlay).toHaveClass('fixed', 'inset-0', 'bg-white', 'bg-opacity-90');
    });
  });

  describe('Requirements Compliance', () => {
    it('meets requirement 5.1 - displays loading indicator during authentication verification', () => {
      render(<AuthLoading message="Verifying authentication..." />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
      expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();
    });

    it('meets requirement 5.2 - provides clear visual feedback during redirects', () => {
      render(<AuthLoading message="Redirecting..." showProgress={true} />);
      
      expect(screen.getByText('Redirecting...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('supports different loading states for various authentication scenarios', () => {
      // Test login progress
      const { rerender } = render(
        <AuthLoading message="Signing you in..." variant="dots" showProgress={true} />
      );
      expect(screen.getByText('Signing you in...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Test route checking
      rerender(<AuthLoading message="Checking access..." variant="spinner" />);
      expect(screen.getByText('Checking access...')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();

      // Test token refresh
      rerender(<AuthLoading message="Refreshing session..." variant="pulse" size="small" />);
      expect(screen.getByText('Refreshing session...')).toBeInTheDocument();
    });
  });
});