import React from 'react';
import styled from 'styled-components';
import { KPICardProps } from '../types';
import { formatCurrency, formatNumber, formatPercentage } from '../utils';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #718096;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TooltipIcon = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: help;
  
  &:hover {
    background: #cbd5e0;
  }
`;

const Value = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
  line-height: 1;
`;

const TrendContainer = styled.div<{ direction: 'up' | 'down' | 'neutral' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${props => 
    props.direction === 'up' ? '#38a169' : 
    props.direction === 'down' ? '#e53e3e' : 
    '#718096'
  };
`;

const TrendIcon = styled.span<{ direction: 'up' | 'down' | 'neutral' }>`
  font-size: 0.75rem;
  
  &::before {
    content: ${props => 
      props.direction === 'up' ? '"↗"' : 
      props.direction === 'down' ? '"↘"' : 
      '"→"'
    };
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const LoadingSkeleton = styled.div<{ width?: string; height?: string }>`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '1rem'};

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const ErrorContainer = styled.div`
  color: #e53e3e;
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
`;

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  trend,
  tooltip,
  loading = false,
  error,
  currency,
  format = 'number',
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return formatCurrency(val, currency);
      case 'percentage':
        return formatPercentage(val);
      default:
        return formatNumber(val);
    }
  };

  if (loading) {
    return (
      <Card>
        <LoadingContainer>
          <LoadingSkeleton width="60%" height="0.875rem" />
          <LoadingSkeleton width="80%" height="2rem" />
          <LoadingSkeleton width="40%" height="0.875rem" />
        </LoadingContainer>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Header>
          <Title>{title}</Title>
        </Header>
        <ErrorContainer>
          {error}
        </ErrorContainer>
      </Card>
    );
  }

  return (
    <Card>
      <Header>
        <Title>{title}</Title>
        {tooltip && (
          <TooltipIcon title={tooltip}>
            ?
          </TooltipIcon>
        )}
      </Header>
      
      <Value>
        {formatValue(value)}
      </Value>
      
      {trend && (
        <TrendContainer direction={trend.direction}>
          <TrendIcon direction={trend.direction} />
          <span>
            {formatPercentage(trend.percentage)} {trend.comparisonPeriod}
          </span>
        </TrendContainer>
      )}
    </Card>
  );
};