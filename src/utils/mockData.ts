// Mock data for development and testing

import { 
  KPIData, 
  Transaction, 
  DeclineReasonData, 
  SalesChartDataPoint,
  User,
  DeclineReason,
  TransactionStatus
} from '../types';
import { 
  getDeclineReasonColor, 
  calculateTrend,
  getDateRangeFromPreset 
} from './index';

// Mock User Data
export const mockUser: User = {
  id: 'user-123',
  email: 'merchant@bobssneakers.com',
  merchantName: "Bob's Sneakers",
  role: 'admin',
  permissions: [
    'dashboard:view',
    'dashboard:export',
    'transactions:view',
    'transactions:export',
    'transactions:manage',
    'analytics:view',
    'analytics:advanced',
    'settings:view',
    'settings:manage',
    'users:view',
    'users:manage',
  ],
  preferences: {
    theme: 'light',
    defaultTimeRange: '30d',
    notifications: true,
  },
};

// Mock KPI Data
export const mockKPIData: KPIData = {
  totalSales: {
    value: 847250.00,
    currency: 'USD',
    trend: calculateTrend(847250, 782100, 'vs last 30 days'),
    previousPeriodValue: 782100,
  },
  ordersApproved: {
    value: 1247,
    trend: calculateTrend(1247, 1156, 'vs last 30 days'),
    previousPeriodValue: 1156,
  },
  ordersDeclined: {
    value: 89,
    trend: calculateTrend(89, 134, 'vs last 30 days'),
    previousPeriodValue: 134,
  },
  revenueProtected: {
    value: 156780.00,
    currency: 'USD',
    trend: calculateTrend(156780, 198450, 'vs last 30 days'),
    previousPeriodValue: 198450,
  },
};

// Mock Sales Chart Data
export const mockSalesChartData: SalesChartDataPoint[] = [
  { date: '2024-10-01', sales: 28450, ordersCount: 42, timestamp: '2024-10-01T00:00:00Z' },
  { date: '2024-10-02', sales: 31200, ordersCount: 38, timestamp: '2024-10-02T00:00:00Z' },
  { date: '2024-10-03', sales: 26800, ordersCount: 35, timestamp: '2024-10-03T00:00:00Z' },
  { date: '2024-10-04', sales: 34500, ordersCount: 48, timestamp: '2024-10-04T00:00:00Z' },
  { date: '2024-10-05', sales: 29750, ordersCount: 41, timestamp: '2024-10-05T00:00:00Z' },
  { date: '2024-10-06', sales: 32100, ordersCount: 44, timestamp: '2024-10-06T00:00:00Z' },
  { date: '2024-10-07', sales: 38900, ordersCount: 52, timestamp: '2024-10-07T00:00:00Z' },
  { date: '2024-10-08', sales: 27600, ordersCount: 36, timestamp: '2024-10-08T00:00:00Z' },
  { date: '2024-10-09', sales: 33400, ordersCount: 47, timestamp: '2024-10-09T00:00:00Z' },
  { date: '2024-10-10', sales: 35800, ordersCount: 49, timestamp: '2024-10-10T00:00:00Z' },
  { date: '2024-10-11', sales: 31900, ordersCount: 43, timestamp: '2024-10-11T00:00:00Z' },
  { date: '2024-10-12', sales: 29300, ordersCount: 39, timestamp: '2024-10-12T00:00:00Z' },
  { date: '2024-10-13', sales: 36700, ordersCount: 51, timestamp: '2024-10-13T00:00:00Z' },
  { date: '2024-10-14', sales: 42100, ordersCount: 58, timestamp: '2024-10-14T00:00:00Z' },
  { date: '2024-10-15', sales: 28900, ordersCount: 37, timestamp: '2024-10-15T00:00:00Z' },
  { date: '2024-10-16', sales: 33600, ordersCount: 46, timestamp: '2024-10-16T00:00:00Z' },
  { date: '2024-10-17', sales: 37200, ordersCount: 53, timestamp: '2024-10-17T00:00:00Z' },
  { date: '2024-10-18', sales: 31400, ordersCount: 42, timestamp: '2024-10-18T00:00:00Z' },
  { date: '2024-10-19', sales: 34800, ordersCount: 48, timestamp: '2024-10-19T00:00:00Z' },
  { date: '2024-10-20', sales: 39500, ordersCount: 54, timestamp: '2024-10-20T00:00:00Z' },
  { date: '2024-10-21', sales: 32700, ordersCount: 45, timestamp: '2024-10-21T00:00:00Z' },
  { date: '2024-10-22', sales: 35100, ordersCount: 49, timestamp: '2024-10-22T00:00:00Z' },
  { date: '2024-10-23', sales: 41300, ordersCount: 57, timestamp: '2024-10-23T00:00:00Z' },
  { date: '2024-10-24', sales: 28700, ordersCount: 38, timestamp: '2024-10-24T00:00:00Z' },
  { date: '2024-10-25', sales: 33900, ordersCount: 47, timestamp: '2024-10-25T00:00:00Z' },
  { date: '2024-10-26', sales: 36400, ordersCount: 50, timestamp: '2024-10-26T00:00:00Z' },
  { date: '2024-10-27', sales: 30800, ordersCount: 41, timestamp: '2024-10-27T00:00:00Z' },
  { date: '2024-10-28', sales: 34200, ordersCount: 46, timestamp: '2024-10-28T00:00:00Z' },
  { date: '2024-10-29', sales: 37800, ordersCount: 52, timestamp: '2024-10-29T00:00:00Z' },
];

// Mock Decline Reasons Data
const declineReasonsRaw = [
  { reason: 'billing_shipping_mismatch' as DeclineReason, count: 34, totalAmount: 67800 },
  { reason: 'stolen_payment_method' as DeclineReason, count: 28, totalAmount: 45600 },
  { reason: 'high_risk_country' as DeclineReason, count: 15, totalAmount: 23400 },
  { reason: 'suspicious_velocity' as DeclineReason, count: 8, totalAmount: 12900 },
  { reason: 'high_risk_score' as DeclineReason, count: 4, totalAmount: 7080 },
];

const totalDeclines = declineReasonsRaw.reduce((sum, item) => sum + item.count, 0);

export const mockDeclineReasonsData: DeclineReasonData[] = declineReasonsRaw.map(item => ({
  reason: item.reason,
  displayName: item.reason.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' '),
  count: item.count,
  percentage: (item.count / totalDeclines) * 100,
  color: getDeclineReasonColor(item.reason),
  totalAmount: item.totalAmount,
}));

// Mock Transaction Data
const generateMockTransaction = (
  id: string,
  orderId: string,
  customerName: string,
  customerEmail: string,
  amount: number,
  status: TransactionStatus,
  riskScore: number,
  timestamp: string,
  declineReason?: DeclineReason
): Transaction => ({
  id,
  orderId,
  customerName,
  customerEmail,
  amount,
  currency: 'USD',
  status,
  riskScore,
  timestamp,
  declineReason,
  billingAddress: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '90210',
    country: 'US',
  },
  shippingAddress: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '90210',
    country: 'US',
  },
  paymentMethod: {
    type: 'credit_card',
    lastFour: '4242',
    brand: 'Visa',
  },
});

export const mockTransactions: Transaction[] = [
  generateMockTransaction(
    'txn-001',
    'ORD-2024-001',
    'John Smith',
    'john.smith@email.com',
    129.99,
    'approved',
    15,
    '2024-10-29T14:30:00Z'
  ),
  generateMockTransaction(
    'txn-002',
    'ORD-2024-002',
    'Sarah Johnson',
    'sarah.j@email.com',
    89.50,
    'declined',
    85,
    '2024-10-29T14:15:00Z',
    'stolen_payment_method'
  ),
  generateMockTransaction(
    'txn-003',
    'ORD-2024-003',
    'Mike Davis',
    'mike.davis@email.com',
    249.99,
    'approved',
    22,
    '2024-10-29T13:45:00Z'
  ),
  generateMockTransaction(
    'txn-004',
    'ORD-2024-004',
    'Emily Chen',
    'emily.chen@email.com',
    179.99,
    'in_review',
    65,
    '2024-10-29T13:30:00Z'
  ),
  generateMockTransaction(
    'txn-005',
    'ORD-2024-005',
    'Robert Wilson',
    'r.wilson@email.com',
    99.99,
    'declined',
    78,
    '2024-10-29T13:00:00Z',
    'billing_shipping_mismatch'
  ),
  generateMockTransaction(
    'txn-006',
    'ORD-2024-006',
    'Lisa Anderson',
    'lisa.anderson@email.com',
    159.99,
    'approved',
    18,
    '2024-10-29T12:45:00Z'
  ),
  generateMockTransaction(
    'txn-007',
    'ORD-2024-007',
    'David Brown',
    'david.brown@email.com',
    299.99,
    'approved',
    28,
    '2024-10-29T12:30:00Z'
  ),
  generateMockTransaction(
    'txn-008',
    'ORD-2024-008',
    'Jennifer Taylor',
    'jen.taylor@email.com',
    79.99,
    'declined',
    92,
    '2024-10-29T12:15:00Z',
    'high_risk_country'
  ),
  generateMockTransaction(
    'txn-009',
    'ORD-2024-009',
    'Michael Garcia',
    'm.garcia@email.com',
    199.99,
    'approved',
    12,
    '2024-10-29T12:00:00Z'
  ),
  generateMockTransaction(
    'txn-010',
    'ORD-2024-010',
    'Amanda Martinez',
    'amanda.m@email.com',
    139.99,
    'in_review',
    58,
    '2024-10-29T11:45:00Z'
  ),
  generateMockTransaction(
    'txn-011',
    'ORD-2024-011',
    'Christopher Lee',
    'chris.lee@email.com',
    89.99,
    'approved',
    25,
    '2024-10-29T11:30:00Z'
  ),
  generateMockTransaction(
    'txn-012',
    'ORD-2024-012',
    'Jessica White',
    'jessica.white@email.com',
    219.99,
    'declined',
    81,
    '2024-10-29T11:15:00Z',
    'suspicious_velocity'
  ),
  generateMockTransaction(
    'txn-013',
    'ORD-2024-013',
    'Daniel Rodriguez',
    'daniel.r@email.com',
    169.99,
    'approved',
    19,
    '2024-10-29T11:00:00Z'
  ),
  generateMockTransaction(
    'txn-014',
    'ORD-2024-014',
    'Ashley Thompson',
    'ashley.t@email.com',
    109.99,
    'approved',
    31,
    '2024-10-29T10:45:00Z'
  ),
  generateMockTransaction(
    'txn-015',
    'ORD-2024-015',
    'Ryan Clark',
    'ryan.clark@email.com',
    259.99,
    'declined',
    88,
    '2024-10-29T10:30:00Z',
    'high_risk_score'
  ),
  generateMockTransaction(
    'txn-016',
    'ORD-2024-016',
    'Michelle Lewis',
    'michelle.l@email.com',
    119.99,
    'approved',
    16,
    '2024-10-29T10:15:00Z'
  ),
  generateMockTransaction(
    'txn-017',
    'ORD-2024-017',
    'Kevin Walker',
    'kevin.walker@email.com',
    189.99,
    'in_review',
    62,
    '2024-10-29T10:00:00Z'
  ),
  generateMockTransaction(
    'txn-018',
    'ORD-2024-018',
    'Nicole Hall',
    'nicole.hall@email.com',
    149.99,
    'approved',
    21,
    '2024-10-29T09:45:00Z'
  ),
  generateMockTransaction(
    'txn-019',
    'ORD-2024-019',
    'Brandon Young',
    'brandon.y@email.com',
    79.99,
    'declined',
    76,
    '2024-10-29T09:30:00Z',
    'billing_shipping_mismatch'
  ),
  generateMockTransaction(
    'txn-020',
    'ORD-2024-020',
    'Stephanie King',
    'stephanie.k@email.com',
    229.99,
    'approved',
    14,
    '2024-10-29T09:15:00Z'
  ),
];

// Mock API Delay Function
export const mockApiDelay = (ms: number = 800): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock Error Generator
export const mockApiError = (message: string = 'API Error', code: string = 'UNKNOWN_ERROR') => {
  return {
    error: {
      code,
      message,
      details: {},
    },
    timestamp: new Date().toISOString(),
    requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
  };
};