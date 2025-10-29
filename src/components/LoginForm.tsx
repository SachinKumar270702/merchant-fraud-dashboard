import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthContext } from '../contexts/AuthContext';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 24px;
  margin: 0 auto 1rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #718096;
  text-align: center;
  margin: 0 0 2rem 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background-color: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
`;

const DemoCredentials = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0369a1;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

const DemoTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const DemoInfo = styled.div`
  font-family: monospace;
  background: white;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: #667eea;
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
`;

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { 
    login, 
    isLoggingIn, 
    error: loginError, 
    isAuthenticated, 
    user,
    clearError 
  } = useAuthContext();
  const navigate = useNavigate();

  // Redirect to dashboard after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Clear errors when component mounts or when user starts typing
  useEffect(() => {
    return () => {
      if (loginError) {
        clearError();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any existing errors before attempting login
    if (loginError) {
      clearError();
    }
    
    try {
      // Use the enhanced login from AuthContext
      await login({ email, password }, rememberMe);
    } catch (error) {
      // Error handling is managed by AuthContext, but we can log for debugging
      console.error('Login error:', error);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('merchant@bobssneakers.com');
    setPassword('password');
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <LogoIcon>FD</LogoIcon>
          <Title>Fraud Dashboard</Title>
          <Subtitle>Sign in to your merchant account</Subtitle>
        </Logo>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Clear errors when user starts typing
                if (loginError) {
                  clearError();
                }
              }}
              placeholder="Enter your email"
              required
              disabled={isLoggingIn}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Clear errors when user starts typing
                if (loginError) {
                  clearError();
                }
              }}
              placeholder="Enter your password"
              required
              disabled={isLoggingIn}
            />
          </FormGroup>

          <CheckboxGroup>
            <Checkbox
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoggingIn}
            />
            <CheckboxLabel htmlFor="rememberMe">
              Remember me for 30 days
            </CheckboxLabel>
          </CheckboxGroup>

          {loginError && (
            <ErrorMessage>
              {loginError || 'Login failed. Please try again.'}
            </ErrorMessage>
          )}

          <Button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>

        <DemoCredentials>
          <DemoTitle>Demo Credentials</DemoTitle>
          <div>Use these credentials to try the dashboard:</div>
          <DemoInfo>
            Email: merchant@bobssneakers.com<br />
            Password: password
          </DemoInfo>
          <Button
            type="button"
            onClick={fillDemoCredentials}
            style={{ 
              marginTop: '0.5rem', 
              padding: '0.5rem', 
              fontSize: '0.875rem',
              background: '#0369a1'
            }}
          >
            Fill Demo Credentials
          </Button>
        </DemoCredentials>
      </LoginCard>
    </LoginContainer>
  );
};