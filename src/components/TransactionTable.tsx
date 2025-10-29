import React, { useState } from 'react';
import styled from 'styled-components';
import { TransactionTableProps, Transaction } from '../types';
import { formatCurrency, formatDateTime, getRiskColor, getRiskLevel } from '../utils';

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const TableHeaderContainer = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TableTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 200px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: #f7fafc;
`;

const TableRow = styled.tr<{ clickable?: boolean }>`
  border-bottom: 1px solid #e2e8f0;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.clickable ? '#f7fafc' : 'transparent'};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #2d3748;
  vertical-align: middle;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  
  ${props => {
    switch (props.status) {
      case 'approved':
        return `
          background-color: #c6f6d5;
          color: #22543d;
        `;
      case 'declined':
        return `
          background-color: #fed7d7;
          color: #742a2a;
        `;
      case 'in_review':
        return `
          background-color: #feebc8;
          color: #7b341e;
        `;
      default:
        return `
          background-color: #e2e8f0;
          color: #4a5568;
        `;
    }
  }}
`;

const RiskScore = styled.div<{ score: number }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RiskBadge = styled.span<{ score: number }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => getRiskColor(props.score)}20;
  color: ${props => getRiskColor(props.score)};
`;

const LoadingContainer = styled.div`
  padding: 3rem;
  text-align: center;
  color: #718096;
`;

const ErrorContainer = styled.div`
  padding: 3rem;
  text-align: center;
  color: #e53e3e;
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #718096;
`;

const LoadingRow = styled.tr`
  border-bottom: 1px solid #e2e8f0;
`;

const LoadingCell = styled.td`
  padding: 1rem;
`;

const LoadingSkeleton = styled.div<{ width?: string }>`
  height: 1rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  width: ${props => props.width || '100%'};

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  loading = false,
  error,
  onTransactionClick,
  searchQuery: initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      transaction.orderId.toLowerCase().includes(query) ||
      transaction.customerName.toLowerCase().includes(query) ||
      transaction.customerEmail.toLowerCase().includes(query) ||
      transaction.status.toLowerCase().includes(query)
    );
  });

  const renderLoadingRows = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <LoadingRow key={index}>
        <LoadingCell><LoadingSkeleton width="80%" /></LoadingCell>
        <LoadingCell><LoadingSkeleton width="60%" /></LoadingCell>
        <LoadingCell><LoadingSkeleton width="70%" /></LoadingCell>
        <LoadingCell><LoadingSkeleton width="50%" /></LoadingCell>
        <LoadingCell><LoadingSkeleton width="40%" /></LoadingCell>
        <LoadingCell><LoadingSkeleton width="60%" /></LoadingCell>
        <LoadingCell><LoadingSkeleton width="90%" /></LoadingCell>
      </LoadingRow>
    ));
  };

  return (
    <TableContainer>
      <TableHeaderContainer>
        <TableTitle>Recent Transactions</TableTitle>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
      </TableHeaderContainer>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Order ID</TableHeader>
            <TableHeader>Customer</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Risk Score</TableHeader>
            <TableHeader>Decline Reason</TableHeader>
            <TableHeader>Time</TableHeader>
          </TableRow>
        </TableHead>
        <tbody>
          {loading && renderLoadingRows()}
          
          {!loading && error && (
            <TableRow>
              <TableCell colSpan={7}>
                <ErrorContainer>
                  Failed to load transactions: {error}
                </ErrorContainer>
              </TableCell>
            </TableRow>
          )}
          
          {!loading && !error && filteredTransactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>
                <EmptyState>
                  {searchQuery ? 'No transactions match your search' : 'No transactions available'}
                </EmptyState>
              </TableCell>
            </TableRow>
          )}
          
          {!loading && !error && filteredTransactions.map((transaction) => (
            <TableRow
              key={transaction.id}
              clickable={!!onTransactionClick}
              onClick={() => onTransactionClick && onTransactionClick(transaction)}
            >
              <TableCell>
                <div style={{ fontWeight: 500 }}>{transaction.orderId}</div>
              </TableCell>
              <TableCell>
                <div>{transaction.customerName}</div>
                <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                  {transaction.customerEmail}
                </div>
              </TableCell>
              <TableCell>
                <div style={{ fontWeight: 600 }}>
                  {formatCurrency(transaction.amount, transaction.currency)}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={transaction.status}>
                  {transaction.status.replace('_', ' ')}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <RiskScore score={transaction.riskScore}>
                  <RiskBadge score={transaction.riskScore}>
                    {getRiskLevel(transaction.riskScore).toUpperCase()}
                  </RiskBadge>
                  <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                    {transaction.riskScore}/100
                  </span>
                </RiskScore>
              </TableCell>
              <TableCell>
                {transaction.declineReason ? (
                  <span style={{ fontSize: '0.75rem', color: '#e53e3e' }}>
                    {transaction.declineReason.replace(/_/g, ' ')}
                  </span>
                ) : (
                  <span style={{ color: '#a0aec0' }}>—</span>
                )}
              </TableCell>
              <TableCell>
                <div style={{ fontSize: '0.75rem' }}>
                  {formatDateTime(transaction.timestamp)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
};