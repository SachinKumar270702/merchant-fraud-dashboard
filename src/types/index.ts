// Core data models for the Merchant Fraud Dashboard

// Forward declaration for LoginRequest (defined in api.ts)
export interface LoginRequest {
  email: string;
  password: string;
}

// Re-export from api.ts
export type { LoginResponse } from './api';

// Authentication Context Types
export interface AuthContextType {
  // State
  isAuthenticated: boolean;
  user: User | null;
  
  // Loading states
  isLoading: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  
  // Utilities
  checkAuthStatus: () => Promise<boolean>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface User {
  id: string;
  email: string;
  merchantName: string;
  role: UserRole;
  permissions: Permission[];
  preferences: UserPreferences;
}

// Role-based access control types
export type UserRole = 'admin' | 'manager' | 'analyst' | 'viewer';

export type Permission = 
  | 'dashboard:view'
  | 'dashboard:export'
  | 'transactions:view'
  | 'transactions:export'
  | 'transactions:manage'
  | 'analytics:view'
  | 'analytics:advanced'
  | 'settings:view'
  | 'settings:manage'
  | 'users:view'
  | 'users:manage';

export interface RoleConfig {
  name: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  hierarchy: number; // Higher number = more permissions
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  defaultTimeRange: '7d' | '30d' | '90d' | 'custom';
  notifications: boolean;
}

// KPI Data Models - Based on the 4 critical metrics
export interface KPIData {
  totalSales: KPIMetric;
  ordersApproved: KPIMetric;
  ordersDeclined: KPIMetric;
  revenueProtected: KPIMetric; // Key metric showing money saved from fraud
}

export interface KPIMetric {
  value: number;
  currency?: string; // For monetary values
  trend: TrendData;
  previousPeriodValue?: number;
}

export interface TrendData {
  direction: 'up' | 'down' | 'neutral';
  percentage: number;
  comparisonPeriod: string; // e.g., "vs last 30 days"
}

// Transaction Models - For the live transaction log
export interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  riskScore: number; // 0-100 risk score
  timestamp: string; // ISO date string
  declineReason?: DeclineReason;
  billingAddress?: Address;
  shippingAddress?: Address;
  paymentMethod?: PaymentMethod;
}

export type TransactionStatus = 'approved' | 'declined' | 'in_review';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  lastFour?: string;
  brand?: string; // Visa, Mastercard, etc.
}

// Decline Reasons - For the fraud insight pie chart
export type DeclineReason = 
  | 'stolen_payment_method'
  | 'billing_shipping_mismatch' 
  | 'high_risk_country'
  | 'suspicious_velocity'
  | 'blacklisted_email'
  | 'invalid_cvv'
  | 'high_risk_score'
  | 'manual_review_required';

export interface DeclineReasonData {
  reason: DeclineReason;
  displayName: string;
  count: number;
  percentage: number;
  color: string;
  totalAmount: number; // Total dollar amount for this decline reason
}

// Chart Data Models
export interface SalesChartDataPoint {
  date: string; // YYYY-MM-DD format
  sales: number;
  ordersCount: number;
  timestamp: string; // ISO string for precise time
}

// Date Range Models - For interactive filtering
export interface DateRange {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  preset?: DateRangePreset;
}

export type DateRangePreset = '7d' | '30d' | '90d' | 'custom';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Handling Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ComponentError {
  component: string;
  error: Error;
  timestamp: string;
}

// Component Props Types
export interface KPICardProps {
  title: string;
  value: string | number;
  trend?: TrendData;
  tooltip?: string;
  loading?: boolean;
  error?: string;
  currency?: string;
  format?: 'currency' | 'number' | 'percentage';
}

export interface SalesChartProps {
  data: SalesChartDataPoint[];
  dateRange: DateRange;
  loading?: boolean;
  error?: string;
  height?: number;
}

export interface DeclineReasonsChartProps {
  data: DeclineReasonData[];
  loading?: boolean;
  error?: string;
  onSegmentClick?: (reason: DeclineReason) => void;
}

export interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  error?: string;
  onTransactionClick?: (transaction: Transaction) => void;
  sortBy?: 'date' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: DateRangePreset[];
  maxDate?: string;
  minDate?: string;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: string;
}

// Risk Score Utilities
export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskScoreConfig {
  low: { min: number; max: number; color: string };
  medium: { min: number; max: number; color: string };
  high: { min: number; max: number; color: string };
}

// Dashboard State
export interface DashboardState {
  dateRange: DateRange;
  kpis: AsyncState<KPIData>;
  salesChart: AsyncState<SalesChartDataPoint[]>;
  declineReasons: AsyncState<DeclineReasonData[]>;
  transactions: AsyncState<Transaction[]>;
  selectedTransaction?: Transaction;
}

// Constants
export const DECLINE_REASON_DISPLAY_NAMES: Record<DeclineReason, string> = {
  stolen_payment_method: 'Stolen Payment Method',
  billing_shipping_mismatch: 'Billing/Shipping Mismatch',
  high_risk_country: 'High Risk Country',
  suspicious_velocity: 'Suspicious Velocity',
  blacklisted_email: 'Blacklisted Email',
  invalid_cvv: 'Invalid CVV',
  high_risk_score: 'High Risk Score',
  manual_review_required: 'Manual Review Required',
};

export const RISK_SCORE_CONFIG: RiskScoreConfig = {
  low: { min: 0, max: 30, color: '#10B981' }, // Green
  medium: { min: 31, max: 70, color: '#F59E0B' }, // Yellow
  high: { min: 71, max: 100, color: '#EF4444' }, // Red
};

export const DATE_RANGE_PRESETS: Record<DateRangePreset, string> = {
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days', 
  '90d': 'Last 90 Days',
  'custom': 'Custom Range',
};

// Role-based access control configuration
export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access with user management capabilities',
    hierarchy: 4,
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
  },
  manager: {
    name: 'manager',
    displayName: 'Manager',
    description: 'Advanced access with transaction management and analytics',
    hierarchy: 3,
    permissions: [
      'dashboard:view',
      'dashboard:export',
      'transactions:view',
      'transactions:export',
      'transactions:manage',
      'analytics:view',
      'analytics:advanced',
      'settings:view',
    ],
  },
  analyst: {
    name: 'analyst',
    displayName: 'Analyst',
    description: 'Read-only access with export capabilities and basic analytics',
    hierarchy: 2,
    permissions: [
      'dashboard:view',
      'dashboard:export',
      'transactions:view',
      'transactions:export',
      'analytics:view',
    ],
  },
  viewer: {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Basic read-only access to dashboard and transactions',
    hierarchy: 1,
    permissions: [
      'dashboard:view',
      'transactions:view',
    ],
  },
};