import React from 'react';
import styled from 'styled-components';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { DeclineReasonsChartProps } from '../types';
import { formatPercentage, formatCurrency } from '../utils';

const ChartContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 1.5rem 0;
`;

const ChartContent = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const PieContainer = styled.div`
  flex: 1;
  min-height: 300px;
`;

const LegendContainer = styled.div`
  flex: 1;
  max-width: 300px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: background-color 0.2s;
  cursor: pointer;

  &:hover {
    background-color: #f7fafc;
  }
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 0.75rem;
`;

const LegendLabel = styled.div`
  flex: 1;
  font-size: 0.875rem;
  color: #4a5568;
`;

const LegendStats = styled.div`
  text-align: right;
`;

const LegendCount = styled.div`
  font-weight: 600;
  color: #1a202c;
  font-size: 0.875rem;
`;

const LegendPercentage = styled.div`
  font-size: 0.75rem;
  color: #718096;
`;

const LoadingContainer = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
`;

const ErrorContainer = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e53e3e;
  text-align: center;
`;

const EmptyState = styled.div`
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #718096;
  text-align: center;
`;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#1a202c' }}>
          {data.displayName}
        </p>
        <p style={{ margin: '4px 0', fontSize: '14px', color: '#4a5568' }}>
          Count: {data.count.toLocaleString()}
        </p>
        <p style={{ margin: '4px 0', fontSize: '14px', color: '#4a5568' }}>
          Percentage: {formatPercentage(data.percentage)}
        </p>
        <p style={{ margin: '4px 0', fontSize: '14px', color: '#4a5568' }}>
          Amount: {formatCurrency(data.totalAmount)}
        </p>
      </div>
    );
  }
  return null;
};

export const DeclineReasonsChart: React.FC<DeclineReasonsChartProps> = ({
  data,
  loading = false,
  error,
  onSegmentClick,
}) => {
  if (loading) {
    return (
      <ChartContainer>
        <ChartTitle>Decline Reasons</ChartTitle>
        <LoadingContainer>
          Loading decline reasons...
        </LoadingContainer>
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer>
        <ChartTitle>Decline Reasons</ChartTitle>
        <ErrorContainer>
          <div>
            <div>Failed to load decline reasons</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>{error}</div>
          </div>
        </ErrorContainer>
      </ChartContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>Decline Reasons</ChartTitle>
        <EmptyState>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <div>No decline data available</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Decline reasons will appear here when transactions are declined
          </div>
        </EmptyState>
      </ChartContainer>
    );
  }

  const handleLegendClick = (reason: string) => {
    const reasonData = data.find(item => item.displayName === reason);
    if (reasonData && onSegmentClick) {
      onSegmentClick(reasonData.reason);
    }
  };

  return (
    <ChartContainer>
      <ChartTitle>Decline Reasons</ChartTitle>
      <ChartContent>
        <PieContainer>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={40}
                paddingAngle={2}
                dataKey="count"
                onClick={(data) => onSegmentClick && onSegmentClick(data.reason)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </PieContainer>
        
        <LegendContainer>
          {data.map((item, index) => (
            <LegendItem 
              key={index}
              onClick={() => handleLegendClick(item.displayName)}
              style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <LegendColor color={item.color} />
                <LegendLabel>{item.displayName}</LegendLabel>
              </div>
              <LegendStats>
                <LegendCount>{item.count}</LegendCount>
                <LegendPercentage>{formatPercentage(item.percentage)}</LegendPercentage>
              </LegendStats>
            </LegendItem>
          ))}
        </LegendContainer>
      </ChartContent>
    </ChartContainer>
  );
};