import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  KPICard, 
  SalesChart, 
  DeclineReasonsChart, 
  TransactionTable 
} from './index';
import { 
  useDashboardData, 
  usePrefetchDashboardData 
} from '../hooks';
import { 
  DateRange, 
  DateRangePreset, 
  Transaction, 
  DeclineReason 
} from '../types';
import { 
  getDateRangeFromPreset, 
  formatCurrency, 
  formatNumber 
} from '../utils';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const DashboardTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
`;

const DateRangeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const DateButton = styled.button<{ active?: boolean }>`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.active ? '#667eea' : '#e2e8f0'};
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    background: ${props => props.active ? '#5a67d8' : '#f7fafc'};
  }
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LastUpdated = styled.div`
  text-align: center;
  color: #718096;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

interface DashboardProps {
  onTransactionClick?: (transaction: Transaction) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onTransactionClick }) => {
  const [dateRange, setDateRange] = useState<DateRange>(
    getDateRangeFromPreset('30d')
  );
  
  const { prefetchForDateRange } = usePrefetchDashboardData();
  
  const {
    kpis,
    salesChart,
    declineReasons,
    transactions,
    isLoading,
    isError,
    error,
  } = useDashboardData(dateRange);

  const dateRangeOptions: { key: DateRangePreset; label: string }[] = [
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '90d', label: 'Last 90 Days' },
  ];

  const handleDateRangeChange = (preset: DateRangePreset) => {
    const newDateRange = getDateRangeFromPreset(preset);
    setDateRange(newDateRange);
    
    // Prefetch data for better UX
    prefetchForDateRange(newDateRange);
  };

  const handleDeclineReasonClick = (reason: DeclineReason) => {
    console.log('Decline reason clicked:', reason);
    // Here you could filter transactions by decline reason
    // or show a detailed view of that decline reason
  };

  const getLastUpdated = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>Fraud Protection Dashboard</DashboardTitle>
        <DateRangeSelector>
          {dateRangeOptions.map(option => (
            <DateButton
              key={option.key}
              active={dateRange.preset === option.key}
              onClick={() => handleDateRangeChange(option.key)}
            >
              {option.label}
            </DateButton>
          ))}
        </DateRangeSelector>
      </DashboardHeader>

      {/* KPI Cards */}
      <KPIGrid>
        <KPICard
          title="Total Sales"
          value={kpis.data?.totalSales.value || 0}
          trend={kpis.data?.totalSales.trend}
          loading={kpis.isLoading}
          error={kpis.error?.message}
          format="currency"
          currency={kpis.data?.totalSales.currency}
          tooltip="Total approved transaction value for the selected period"
        />
        
        <KPICard
          title="Orders Approved"
          value={kpis.data?.ordersApproved.value || 0}
          trend={kpis.data?.ordersApproved.trend}
          loading={kpis.isLoading}
          error={kpis.error?.message}
          format="number"
          tooltip="Number of transactions approved by fraud protection"
        />
        
        <KPICard
          title="Orders Declined"
          value={kpis.data?.ordersDeclined.value || 0}
          trend={kpis.data?.ordersDeclined.trend}
          loading={kpis.isLoading}
          error={kpis.error?.message}
          format="number"
          tooltip="Number of transactions declined due to fraud risk"
        />
        
        <KPICard
          title="Revenue Protected"
          value={kpis.data?.revenueProtected.value || 0}
          trend={kpis.data?.revenueProtected.trend}
          loading={kpis.isLoading}
          error={kpis.error?.message}
          format="currency"
          currency={kpis.data?.revenueProtected.currency}
          tooltip="Estimated revenue saved by preventing fraudulent transactions"
        />
      </KPIGrid>

      {/* Charts */}
      <ChartsGrid>
        <SalesChart
          data={salesChart.data || []}
          dateRange={dateRange}
          loading={salesChart.isLoading}
          error={salesChart.error?.message}
        />
        
        <DeclineReasonsChart
          data={declineReasons.data || []}
          loading={declineReasons.isLoading}
          error={declineReasons.error?.message}
          onSegmentClick={handleDeclineReasonClick}
        />
      </ChartsGrid>

      {/* Recent Transactions */}
      <TransactionTable
        transactions={transactions.data || []}
        loading={transactions.isLoading}
        error={transactions.error?.message}
        onTransactionClick={onTransactionClick}
      />

      {/* Last Updated Indicator */}
      {!isLoading && (
        <LastUpdated>
          Last updated: {getLastUpdated()}
        </LastUpdated>
      )}
    </DashboardContainer>
  );
};