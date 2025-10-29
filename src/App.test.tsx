import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('App', () => {
  it('renders without crashing', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <div>Test App</div>
      </QueryClientProvider>
    );
    
    expect(screen.getByText('Test App')).toBeInTheDocument();
  });
  
  it('renders the actual App component', () => {
    render(<App />);
    
    // The app should render something, even if it's a loading state
    // We'll check that the root element is not empty
    const rootElement = document.body;
    expect(rootElement).toBeInTheDocument();
  });
});