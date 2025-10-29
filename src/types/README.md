# Type Definitions

This directory contains all TypeScript type definitions for the Merchant Fraud Dashboard.

## Core Types (`index.ts`)

### User & Authentication
- `User` - User account information
- `UserPreferences` - User settings and preferences

### KPI Data Models
- `KPIData` - Main dashboard KPI metrics
- `KPIMetric` - Individual KPI with trend data
- `TrendData` - Trend calculation results

### Transaction Models
- `Transaction` - Complete transaction information
- `TransactionStatus` - Transaction status enum
- `Address` - Billing/shipping address
- `PaymentMethod` - Payment method details

### Decline Reasons
- `DeclineReason` - Fraud decline reason types
- `DeclineReasonData` - Decline reason with statistics

### Chart Data
- `SalesChartDataPoint` - Sales trend chart data
- `DateRange` - Date range selection
- `DateRangePreset` - Predefined date ranges

### Component Props
- Various component prop interfaces for type safety

### Utility Types
- `LoadingState` - Async operation states
- `AsyncState<T>` - Generic async state wrapper
- `RiskLevel` - Risk assessment levels

## API Types (`api.ts`)

### Authentication API
- `LoginRequest/Response` - Authentication endpoints
- `RefreshTokenRequest/Response` - Token refresh

### Dashboard Data API
- `DashboardDataRequest` - Dashboard data queries
- `KPIDataResponse` - KPI data responses
- `SalesChartDataResponse` - Chart data responses
- `DeclineReasonsResponse` - Decline reason responses
- `TransactionsResponse` - Transaction list responses

### Real-time Updates
- `WebSocketMessage` - WebSocket message types
- `TransactionUpdateMessage` - Real-time transaction updates
- `KPIUpdateMessage` - Real-time KPI updates

### Search & Filtering
- `TransactionSearchRequest` - Advanced search parameters
- `ExportRequest/Response` - Data export functionality

## Constants

### Risk Score Configuration
- Color coding for low/medium/high risk
- Score thresholds and visual indicators

### Decline Reason Display Names
- Human-readable labels for decline reasons
- Color palette for pie chart visualization

### Date Range Presets
- Standard time period options
- Display labels for UI components

## Usage Examples

```typescript
import { Transaction, KPIData, getRiskLevel } from '../types';

// Type-safe transaction handling
const handleTransaction = (transaction: Transaction) => {
  const riskLevel = getRiskLevel(transaction.riskScore);
  console.log(`Transaction ${transaction.orderId} has ${riskLevel} risk`);
};

// Type-safe KPI display
const displayKPIs = (kpis: KPIData) => {
  console.log(`Total Sales: ${kpis.totalSales.value}`);
  console.log(`Trend: ${kpis.totalSales.trend.direction}`);
};
```

## Validation

All types include validation utilities in `../utils/index.ts`:
- Email validation
- Amount validation  
- Risk score validation
- Date range validation

This ensures data integrity throughout the application.