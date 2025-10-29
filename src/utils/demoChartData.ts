// Demo script to show chart data processing in action
import { mockTransactions } from './mockData';
import { processDeclinedOrdersForPieChart, processSalesByDate, processTransactionAnalytics } from './chartDataProcessing';

// Demo function to show chart data processing
export const demoChartDataProcessing = () => {
  console.log('=== Chart Data Processing Demo ===');
  
  // Show original transaction data summary
  console.log('\n📊 Original Transaction Data:');
  console.log(`Total transactions: ${mockTransactions.length}`);
  console.log(`Approved: ${mockTransactions.filter(t => t.status === 'approved').length}`);
  console.log(`Declined: ${mockTransactions.filter(t => t.status === 'declined').length}`);
  console.log(`In Review: ${mockTransactions.filter(t => t.status === 'in_review').length}`);
  
  // Process declined orders for pie chart
  console.log('\n🥧 Decline Reasons Pie Chart Data:');
  const declinePieData = processDeclinedOrdersForPieChart(mockTransactions);
  console.table(declinePieData);
  
  // Process sales by date
  console.log('\n📈 Sales by Date Data:');
  const salesByDate = processSalesByDate(mockTransactions);
  console.table(salesByDate.slice(0, 10)); // Show first 10 days
  
  // Show comprehensive analytics
  console.log('\n📋 Complete Transaction Analytics:');
  const analytics = processTransactionAnalytics(mockTransactions);
  console.log({
    totalTransactions: analytics.totalTransactions,
    approvedCount: analytics.approvedCount,
    declinedCount: analytics.declinedCount,
    totalSales: `$${analytics.totalSales.toLocaleString()}`,
    averageOrderValue: `$${analytics.averageOrderValue.toFixed(2)}`,
    declineRate: `${analytics.declineRate.toFixed(1)}%`
  });
  
  return {
    declinePieData,
    salesByDate,
    analytics
  };
};

// Auto-run demo in development
if (import.meta.env.DEV) {
  // Uncomment the line below to see demo output in console
  // demoChartDataProcessing();
}