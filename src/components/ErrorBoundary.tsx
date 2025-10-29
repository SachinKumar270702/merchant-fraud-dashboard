import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f8fafc;
`;

const ErrorCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  max-width: 600px;
  width: 100%;
`;

const ErrorTitle = styled.h1`
  color: #e53e3e;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  color: #4a5568;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const ErrorDetails = styled.details`
  margin-top: 1rem;
  
  summary {
    cursor: pointer;
    color: #667eea;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
`;

const ErrorStack = styled.pre`
  background: #f7fafc;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  overflow-x: auto;
  color: #2d3748;
  border: 1px solid #e2e8f0;
`;

const ReloadButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background: #5a67d8;
  }
`;

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorCard>
            <ErrorTitle>🚨 Something went wrong</ErrorTitle>
            <ErrorMessage>
              The application encountered an unexpected error. This is likely a development issue that needs to be fixed.
            </ErrorMessage>
            
            {this.state.error && (
              <ErrorMessage>
                <strong>Error:</strong> {this.state.error.message}
              </ErrorMessage>
            )}
            
            <ReloadButton onClick={this.handleReload}>
              Reload Page
            </ReloadButton>
            
            {this.state.error && (
              <ErrorDetails>
                <summary>Technical Details</summary>
                <ErrorStack>
                  {this.state.error.stack}
                  {this.state.errorInfo && (
                    <>
                      {'\n\nComponent Stack:'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </ErrorStack>
              </ErrorDetails>
            )}
          </ErrorCard>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}