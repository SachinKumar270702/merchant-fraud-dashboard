import React from 'react';
import styled from 'styled-components';
import { User } from '../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Container = styled.div`
  min-height: 100vh;
  background-color: #f8fafc;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserInfo = styled.div`
  text-align: right;
`;

const UserName = styled.div`
  font-weight: 500;
  color: #2d3748;
  font-size: 0.875rem;
`;

const MerchantName = styled.div`
  font-size: 0.75rem;
  color: #718096;
`;

const LogoutButton = styled.button`
  background: #e53e3e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #c53030;
  }
`;

const Main = styled.main`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  user,
  onLogout,
}) => {
  return (
    <Container>
      <Header>
        <Logo>
          <LogoIcon>FD</LogoIcon>
          <Title>Fraud Dashboard</Title>
        </Logo>
        <UserSection>
          <UserInfo>
            <UserName>{user.email}</UserName>
            <MerchantName>{user.merchantName}</MerchantName>
          </UserInfo>
          <LogoutButton onClick={onLogout}>
            Logout
          </LogoutButton>
        </UserSection>
      </Header>
      <Main>
        {children}
      </Main>
    </Container>
  );
};