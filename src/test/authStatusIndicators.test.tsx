import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationSystem } from '../components/NotificationSystem';

describe('Authentication Status Indicators', () => {

  describe('NotificationSystem', () => {
    it('should render notifications correctly', () => {
      const notifications = [
        {
          id: '1',
          type: 'success' as const,
          message: 'Login successful!',
          duration: 3000,
        },
        {
          id: '2',
          type: 'error' as const,
          message: 'Login failed!',
          duration: 5000,
          showRetry: true,
          onRetry: vi.fn(),
        },
      ];

      const mockDismiss = vi.fn();

      render(
        <NotificationSystem
          notifications={notifications}
          onDismiss={mockDismiss}
        />
      );

      expect(screen.getByText('Login successful!')).toBeInTheDocument();
      expect(screen.getByText('Login failed!')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', () => {
      const notifications = [
        {
          id: '1',
          type: 'info' as const,
          message: 'Test notification',
        },
      ];

      const mockDismiss = vi.fn();

      render(
        <NotificationSystem
          notifications={notifications}
          onDismiss={mockDismiss}
        />
      );

      const dismissButton = screen.getByLabelText('Dismiss notification');
      dismissButton.click();

      expect(mockDismiss).toHaveBeenCalledWith('1');
    });
  });

  it('should render basic notification system', () => {
    const notifications = [
      {
        id: '1',
        type: 'success' as const,
        message: 'Test notification',
      },
    ];

    const mockDismiss = vi.fn();

    render(
      <NotificationSystem
        notifications={notifications}
        onDismiss={mockDismiss}
      />
    );

    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });
});