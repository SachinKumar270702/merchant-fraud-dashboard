import React from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SalesChartProps } from '../types';
import { formatCurrency, formatDate } from '../utils';

const ChartContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const DateRangeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const DateButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.active ? '#667eea' : '#e2e8f0'};
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    background: ${props => props.active ? '#5a67d8' : '#f7fafc'};
  }
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#1a202c' }}>
          {formatDate(label)}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ 
            margin: '4px 0', 
            color: entry.color,
            fontSize: '14px'
          }}>
            {entry.name}: {
              entry.dataKey === 'sales' 
                ? formatCurrency(entry.value)
                : entry.value.toLocaleString()
            }
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const SalesChart: React.FC<SalesChartProps> = ({
  data,
  dateRange,
  loading = false,
  error,
  height = 300,
}) => {
  const dateRangeOptions = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
  ];

  if (loading) {
    return (
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>Sales Overview</ChartTitle>
          <DateRangeSelector>
            {dateRangeOptions.map(option => (
              <DateButton key={option.key}>
                {option.label}
              </DateButton>
            ))}
          </DateRangeSelector>
        </ChartHeader>
        <LoadingContainer>
          Loading chart data...
        </LoadingContainer>
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>Sales Overview</ChartTitle>
        </ChartHeader>
        <ErrorContainer>
          <div>
            <div>Failed to load chart data</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>{error}</div>
          </div>
        </ErrorContainer>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>Sales Overview</ChartTitle>
        <DateRangeSelector>
          {dateRangeOptions.map(option => (
            <DateButton 
              key={option.key}
              active={dateRange.preset === option.key}
            >
              {option.label}
            </DateButton>
          ))}
        </DateRangeSelector>
      </ChartHeader>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => formatDate(value, { month: 'short', day: 'numeric' })}
            stroke="#718096"
            fontSize={12}
          />
          <YAxis 
            yAxisId="sales"
            orientation="left"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            stroke="#718096"
            fontSize={12}
          />
          <YAxis 
            yAxisId="orders"
            orientation="right"
            stroke="#718096"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="sales"
            type="monotone"
            dataKey="sales"
            stroke="#667eea"
            strokeWidth={3}
            dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2 }}
            name="Sales ($)"
          />
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="ordersCount"
            stroke="#38a169"
            strokeWidth={2}
            dot={{ fill: '#38a169', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#38a169', strokeWidth: 2 }}
            name="Orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};