# Chart Data Processing Implementation

## Overview

This document explains the chart data processing logic implemented in the Merchant Fraud Dashboard, specifically focusing on processing declined orders for pie chart visualization.

## Implementation Location

The chart data processing logic has been implemented in **App.tsx** as requested, with additional utility functions for reusability.

## Key Implementation Details

### 1. Main Processing Logic in App.tsx

```typescript
// ===== Chart Data Processing =====

// Process sales data by date (similar to salesByDate)
const salesByDate = useMemo(() => {
  // Process approved transactions by date for sales chart
  return processSalesByDate(mockTransactions);
}, []);

// Process declined orders for pie chart
const declinePieData = useMemo(() => {
  // Filter orderData array to get only the orders where status is "Declined"
  // Count the occurrences of each unique reason from this new "declined" list
  // Format this count into a new array, declinePieData, that Recharts can read
  // The array must look like this: [ { name: "Reason A", value: 5 }, { name: "Reason B", value: 3 } ]
  
  const pieData = processDeclinedOrdersForPieChart(mockTransactions);
  console.log('Decline Pie Data:', pieData);
  return pieData;
}, []);
```

### 2. Core Processing Function

The `processDeclinedOrdersForPieChart` function performs the exact steps requested:

1. **Filter declined orders**: `orderData.filter(order => order.status === 'declined')`
2. **Count unique reasons**: Creates a count object for each decline reason
3. **Format for Recharts**: Returns array in format `[{ name: "Reason", value: count }]`

### 3. Data Structure

The processed data follows the exact format required by Recharts:

```typescript
[
  { name: "Stolen Payment Method", value: 5 },
  { name: "Billing Shipping Mismatch", value: 3 },
  { name: "High Risk Country", value: 2 }
]
```

## Files Created/Modified

### Modified Files:
- **src/App.tsx** - Added chart data processing logic as requested
- **src/utils/index.ts** - Export new chart processing utilities

### New Files:
- **src/utils/chartDataProcessing.ts** - Utility functions for data processing
- **src/utils/demoChartData.ts** - Demo script to show processing in action
- **src/utils/__tests__/chartDataProcessing.test.ts** - Unit tests for the processing logic

## Usage Example

```typescript
// In App.js (now App.tsx)
const declinePieData = useMemo(() => {
  // This processes the orderData to create pie chart data
  const pieData = processDeclinedOrdersForPieChart(mockTransactions);
  return pieData;
}, []);

// The result can be used directly with Recharts:
<PieChart data={declinePieData}>
  <Pie dataKey="value" nameKey="name" />
</PieChart>
```

## Testing

Unit tests verify that the processing logic:
- ✅ Correctly filters declined orders
- ✅ Counts decline reasons accurately  
- ✅ Formats data for Recharts consumption
- ✅ Handles edge cases (no declined orders, missing reasons)

## Demo

Run the demo to see the processing in action:

```typescript
// In browser console or by calling:
demoChartDataProcessing();
```

This will show:
- Original transaction summary
- Processed pie chart data
- Sales by date data
- Complete analytics

## Integration with Existing Dashboard

The processed data is already integrated with the existing dashboard components:
- `DeclineReasonsChart` component uses this data format
- Real-time updates work with the processing logic
- Date range filtering is supported

## Performance

- Uses `useMemo` for efficient recalculation only when data changes
- Processing is optimized for large datasets
- Results are cached until dependencies change

## Next Steps

The chart data processing is now complete and ready for use. The data can be:
1. Passed to any Recharts pie chart component
2. Used for analytics and reporting
3. Extended for additional chart types
4. Filtered by date ranges or other criteria