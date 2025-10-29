// API-specific types for the Merchant Fraud Dashboard

import { 
  KPIData, 
  Transaction, 
  DeclineReasonData, 
  SalesChartDataPoint, 
  DateRange,
  User 
} from './index';

// Authentication API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

// Dashboard Data API
export interface DashboardDataRequest {
  dateRange: DateRange;
  merchantId?: string;
}

export interface KPIDataResponse {
  kpis: KPIData;
  lastUpdated: string;
}

export interface SalesChartDataResponse {
  chartData: SalesChartDataPoint[];
  totalDataPoints: number;
  lastUpdated: string;
}

export interface DeclineReasonsResponse {
  declineReasons: DeclineReasonData[];
  totalDeclines: number;
  totalDeclineAmount: number;
  lastUpdated: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  lastUpdated: string;
}

export interface TransactionDetailsResponse {
  transaction: Transaction;
  fraudAnalysis?: {
    riskFactors: string[];
    riskScore: number;
    recommendation: string;
    confidence: number;
  };
  relatedTransactions?: Transaction[];
}

// Real-time Updates
export interface WebSocketMessage {
  type: 'transaction_update' | 'kpi_update' | 'system_alert';
  data: any;
  timestamp: string;
}

export interface TransactionUpdateMessage extends WebSocketMessage {
  type: 'transaction_update';
  data: {
    transaction: Transaction;
    action: 'created' | 'updated' | 'status_changed';
  };
}

export interface KPIUpdateMessage extends WebSocketMessage {
  type: 'kpi_update';
  data: {
    kpis: Partial<KPIData>;
    updatedFields: string[];
  };
}

// Error Response Types
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  requestId: string;
}

// Search and Filter Types
export interface TransactionSearchRequest {
  query?: string;
  status?: Transaction['status'][];
  dateRange?: DateRange;
  minAmount?: number;
  maxAmount?: number;
  riskScoreRange?: {
    min: number;
    max: number;
  };
  declineReasons?: string[];
  sortBy?: 'date' | 'amount' | 'riskScore';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Export Types
export interface ExportRequest {
  type: 'transactions' | 'kpis' | 'decline_reasons';
  format: 'csv' | 'xlsx' | 'pdf';
  dateRange: DateRange;
  filters?: TransactionSearchRequest;
}

export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  expiresAt: string;
}

// Webhook Types (for real-time notifications)
export interface WebhookConfig {
  url: string;
  events: string[];
  secret: string;
  active: boolean;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  merchantId: string;
}

// Analytics API
export interface AnalyticsRequest {
  dateRange: DateRange;
  granularity: 'hour' | 'day' | 'week' | 'month';
  metrics: string[];
}

export interface AnalyticsResponse {
  data: Array<{
    timestamp: string;
    metrics: Record<string, number>;
  }>;
  summary: Record<string, {
    total: number;
    average: number;
    change: number;
  }>;
}

// Health Check
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: Record<string, {
    status: 'up' | 'down';
    responseTime?: number;
    lastCheck: string;
  }>;
}