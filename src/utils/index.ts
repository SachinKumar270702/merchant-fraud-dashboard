// Utility functions for the Merchant Fraud Dashboard

import { 
  RiskLevel, 
  RISK_SCORE_CONFIG, 
  DeclineReason, 
  DECLINE_REASON_DISPLAY_NAMES,
  DateRange,
  DateRangePreset,
  TrendData
} from '../types';

// Risk Score Utilities
export const getRiskLevel = (score: number): RiskLevel => {
  if (score <= RISK_SCORE_CONFIG.low.max) return 'low';
  if (score <= RISK_SCORE_CONFIG.medium.max) return 'medium';
  return 'high';
};

export const getRiskColor = (score: number): string => {
  const level = getRiskLevel(score);
  return RISK_SCORE_CONFIG[level].color;
};

export const formatRiskScore = (score: number): string => {
  return `${score}/100`;
};

// Currency Formatting
export const formatCurrency = (
  amount: number, 
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (
  value: number,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale).format(value);
};

export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

// Date Utilities
export const formatDate = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getDateRangeFromPreset = (preset: DateRangePreset): DateRange => {
  const endDate = new Date();
  const startDate = new Date();

  switch (preset) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    default:
      // For custom, return last 30 days as default
      startDate.setDate(endDate.getDate() - 30);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    preset: preset !== 'custom' ? preset : undefined,
  };
};

export const isDateInRange = (date: string, range: DateRange): boolean => {
  const checkDate = new Date(date);
  const start = new Date(range.startDate);
  const end = new Date(range.endDate);
  
  return checkDate >= start && checkDate <= end;
};

// Decline Reason Utilities
export const getDeclineReasonDisplayName = (reason: DeclineReason): string => {
  return DECLINE_REASON_DISPLAY_NAMES[reason] || reason;
};

export const getDeclineReasonColor = (reason: DeclineReason): string => {
  // Color palette for pie chart segments
  const colors: Record<DeclineReason, string> = {
    stolen_payment_method: '#EF4444', // Red
    billing_shipping_mismatch: '#F59E0B', // Orange
    high_risk_country: '#8B5CF6', // Purple
    suspicious_velocity: '#06B6D4', // Cyan
    blacklisted_email: '#84CC16', // Lime
    invalid_cvv: '#F97316', // Orange-600
    high_risk_score: '#DC2626', // Red-600
    manual_review_required: '#6B7280', // Gray
  };
  
  return colors[reason] || '#6B7280';
};

// Trend Calculation Utilities
export const calculateTrend = (
  currentValue: number,
  previousValue: number,
  comparisonPeriod: string = 'previous period'
): TrendData => {
  if (previousValue === 0) {
    return {
      direction: currentValue > 0 ? 'up' : 'neutral',
      percentage: 0,
      comparisonPeriod,
    };
  }

  const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
  
  return {
    direction: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral',
    percentage: Math.abs(percentageChange),
    comparisonPeriod,
  };
};

// Data Validation Utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidAmount = (amount: number): boolean => {
  return typeof amount === 'number' && amount >= 0 && isFinite(amount);
};

export const isValidRiskScore = (score: number): boolean => {
  return typeof score === 'number' && score >= 0 && score <= 100;
};

// Chart Data Utilities
export const aggregateDataByDate = <T extends { date: string; [key: string]: any }>(
  data: T[],
  dateRange: DateRange
): T[] => {
  return data.filter(item => isDateInRange(item.date, dateRange));
};

export const calculatePercentages = (
  data: Array<{ count: number; [key: string]: any }>
): Array<{ count: number; percentage: number; [key: string]: any }> => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  return data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.count / total) * 100 : 0,
  }));
};

// Search and Filter Utilities
export const searchTransactions = (
  transactions: any[],
  query: string
): any[] => {
  if (!query.trim()) return transactions;
  
  const searchTerm = query.toLowerCase();
  
  return transactions.filter(transaction => 
    transaction.orderId.toLowerCase().includes(searchTerm) ||
    transaction.customerName.toLowerCase().includes(searchTerm) ||
    transaction.customerEmail.toLowerCase().includes(searchTerm) ||
    transaction.status.toLowerCase().includes(searchTerm)
  );
};

export const sortTransactions = (
  transactions: any[],
  sortBy: 'date' | 'amount' | 'status',
  sortOrder: 'asc' | 'desc' = 'desc'
): any[] => {
  return [...transactions].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

// Error Handling Utilities
export const createErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('NetworkError');
  }
  return false;
};

// Local Storage Utilities
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Debounce Utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Re-export chart data processing utilities
export * from './chartDataProcessing';

// Re-export permission utilities
export * from './permissions';