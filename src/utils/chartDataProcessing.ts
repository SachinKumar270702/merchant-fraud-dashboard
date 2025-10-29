// Chart Data Processing utilities for the Merchant Fraud Dashboard

import { Transaction, DeclineReason, SalesChartDataPoint } from '../types';
import { getDeclineReasonDisplayName } from './index';

// Interface for pie chart data that Recharts can consume
export interface PieChartData {
  name: string;
  value: number;
}

// Interface for sales by date processing
export interface SalesByDateData {
  date: string;
  sales: number;
  orders: number;
}

/**
 * Process declined orders to create pie chart data
 * Filters transactions to get only declined orders and counts decline reasons
 */
export const processDeclinedOrdersForPieChart = (orderData: Transaction[]): PieChartData[] => {
  // Filter orderData to get only the orders where status is "declined"
  const declinedOrders = orderData.filter(order => order.status === 'declined');
  
  // Count the occurrences of each unique reason from the declined list
  const reasonCounts: Record<string, number> = {};
  
  declinedOrders.forEach(order => {
    if (order.declineReason) {
      // Use the display name for better readability
      const reasonName = getDeclineReasonDisplayName(order.declineReason);
      reasonCounts[reasonName] = (reasonCounts[reasonName] || 0) + 1;
    }
  });
  
  // Format this count into a new array that Recharts can read
  const declinePieData: PieChartData[] = Object.entries(reasonCounts).map(([name, value]) => ({
    name,
    value
  }));
  
  // Sort by value descending for better visualization
  return declinePieData.sort((a, b) => b.value - a.value);
};

/**
 * Process approved orders to create sales by date data
 * Groups approved transactions by date and calculates totals
 */
export const processSalesByDate = (orderData: Transaction[]): SalesByDateData[] => {
  // Filter for approved orders only
  const approvedOrders = orderData.filter(order => order.status === 'approved');
  
  // Group by date
  const salesByDate: Record<string, { sales: number; orders: number }> = {};
  
  approvedOrders.forEach(order => {
    const date = order.timestamp.split('T')[0]; // Extract date part (YYYY-MM-DD)
    
    if (!salesByDate[date]) {
      salesByDate[date] = { sales: 0, orders: 0 };
    }
    
    salesByDate[date].sales += order.amount;
    salesByDate[date].orders += 1;
  });
  
  // Convert to array format and sort by date
  return Object.entries(salesByDate)
    .map(([date, data]) => ({
      date,
      sales: data.sales,
      orders: data.orders
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Process all transaction data for comprehensive analytics
 */
export const processTransactionAnalytics = (orderData: Transaction[]) => {
  const totalTransactions = orderData.length;
  const approvedCount = orderData.filter(t => t.status === 'approved').length;
  const declinedCount = orderData.filter(t => t.status === 'declined').length;
  const inReviewCount = orderData.filter(t => t.status === 'in_review').length;
  
  const totalSales = orderData
    .filter(t => t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const averageOrderValue = approvedCount > 0 ? totalSales / approvedCount : 0;
  
  const declineRate = totalTransactions > 0 ? (declinedCount / totalTransactions) * 100 : 0;
  
  return {
    totalTransactions,
    approvedCount,
    declinedCount,
    inReviewCount,
    totalSales,
    averageOrderValue,
    declineRate,
    salesByDate: processSalesByDate(orderData),
    declinePieData: processDeclinedOrdersForPieChart(orderData)
  };
};

/**
 * Filter transactions by date range
 */
export const filterTransactionsByDateRange = (
  transactions: Transaction[], 
  startDate: string, 
  endDate: string
): Transaction[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.timestamp);
    return transactionDate >= start && transactionDate <= end;
  });
};

/**
 * Get top decline reasons with percentages
 */
export const getTopDeclineReasons = (orderData: Transaction[], limit: number = 5) => {
  const pieData = processDeclinedOrdersForPieChart(orderData);
  const totalDeclined = pieData.reduce((sum, item) => sum + item.value, 0);
  
  return pieData
    .slice(0, limit)
    .map(item => ({
      ...item,
      percentage: totalDeclined > 0 ? (item.value / totalDeclined) * 100 : 0
    }));
};