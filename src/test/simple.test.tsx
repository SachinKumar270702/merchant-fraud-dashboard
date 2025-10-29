/**
 * Simple test to verify the testing environment is working
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

const SimpleComponent: React.FC = () => {
  return <div data-testid="simple">Hello World</div>;
};

describe('Simple Component Test', () => {
  it('renders a simple component', () => {
    render(<SimpleComponent />);
    expect(screen.getByTestId('simple')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});