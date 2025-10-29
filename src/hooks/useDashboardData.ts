import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DateRange } from '../types';
import { api } from '../services/api';
import { getDateRangeFromPreset } from '../utils';

// Query keys for React Query
export const queryKeys = {
  kpis: (dateRange: DateRange) => ['kpis', dateRange] as const,
  salesChart: (dateRange: DateRange) => ['salesChart', dateRange] as const,
  declineReasons: (dateRange: DateRange) => ['declineReasons', dateRange] as const,
  transactions: (limit: number) => ['transactions', limit] as const,
  transactionDetails: (id: string) => ['transactionDetails', id] as const,
  user: () => ['user'] as const,
};

// KPI Data Hook
export const useKPIData = (dateRange: DateRange) => {
  return useQuery({
    queryKey: queryKeys.kpis(dateRange),
    queryFn: () => api.dashboard.getKPIs(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3,
  });
};

// Sales Chart Data Hook
export const useSalesChartData = (dateRange: DateRange) => {
  return useQuery({
    queryKey: queryKeys.salesChart(dateRange),
    queryFn: () => api.dashboard.getSalesChartData(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
  });
};

// Decline Reasons Data Hook
export const useDeclineReasonsData = (dateRange: DateRange) => {
  return useQuery({
    queryKey: queryKeys.declineReasons(dateRange),
    queryFn: () => api.dashboard.getDeclineReasons(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
  });
};

// Recent Transactions Hook
export const useRecentTransactions = (limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.transactions(limit),
    queryFn: () => api.dashboard.getRecentTransactions(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
    retry: 3,
  });
};

// Transaction Details Hook
export const useTransactionDetails = (id: string) => {
  return useQuery({
    queryKey: queryKeys.transactionDetails(id),
    queryFn: () => api.dashboard.getTransactionDetails(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Current User Hook
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => api.auth.getCurrentUser(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
};

// Combined Dashboard Data Hook
export const useDashboardData = (dateRange: DateRange) => {
  const kpisQuery = useKPIData(dateRange);
  const salesChartQuery = useSalesChartData(dateRange);
  const declineReasonsQuery = useDeclineReasonsData(dateRange);
  const transactionsQuery = useRecentTransactions();

  return {
    kpis: kpisQuery,
    salesChart: salesChartQuery,
    declineReasons: declineReasonsQuery,
    transactions: transactionsQuery,
    isLoading: 
      kpisQuery.isLoading || 
      salesChartQuery.isLoading || 
      declineReasonsQuery.isLoading || 
      transactionsQuery.isLoading,
    isError: 
      kpisQuery.isError || 
      salesChartQuery.isError || 
      declineReasonsQuery.isError || 
      transactionsQuery.isError,
    error: 
      kpisQuery.error || 
      salesChartQuery.error || 
      declineReasonsQuery.error || 
      transactionsQuery.error,
  };
};

// Hook for invalidating dashboard data (useful for real-time updates)
export const useInvalidateDashboardData = () => {
  const queryClient = useQueryClient();

  return {
    invalidateKPIs: (dateRange?: DateRange) => {
      if (dateRange) {
        queryClient.invalidateQueries({ queryKey: queryKeys.kpis(dateRange) });
      } else {
        queryClient.invalidateQueries({ queryKey: ['kpis'] });
      }
    },
    invalidateSalesChart: (dateRange?: DateRange) => {
      if (dateRange) {
        queryClient.invalidateQueries({ queryKey: queryKeys.salesChart(dateRange) });
      } else {
        queryClient.invalidateQueries({ queryKey: ['salesChart'] });
      }
    },
    invalidateDeclineReasons: (dateRange?: DateRange) => {
      if (dateRange) {
        queryClient.invalidateQueries({ queryKey: queryKeys.declineReasons(dateRange) });
      } else {
        queryClient.invalidateQueries({ queryKey: ['declineReasons'] });
      }
    },
    invalidateTransactions: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
  };
};

// Hook for prefetching data
export const usePrefetchDashboardData = () => {
  const queryClient = useQueryClient();

  return {
    prefetchKPIs: (dateRange: DateRange) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.kpis(dateRange),
        queryFn: () => api.dashboard.getKPIs(dateRange),
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchSalesChart: (dateRange: DateRange) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.salesChart(dateRange),
        queryFn: () => api.dashboard.getSalesChartData(dateRange),
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchForDateRange: (dateRange: DateRange) => {
      // Prefetch all data for a specific date range
      queryClient.prefetchQuery({
        queryKey: queryKeys.kpis(dateRange),
        queryFn: () => api.dashboard.getKPIs(dateRange),
        staleTime: 5 * 60 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: queryKeys.salesChart(dateRange),
        queryFn: () => api.dashboard.getSalesChartData(dateRange),
        staleTime: 5 * 60 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: queryKeys.declineReasons(dateRange),
        queryFn: () => api.dashboard.getDeclineReasons(dateRange),
        staleTime: 5 * 60 * 1000,
      });
    },
  };
};