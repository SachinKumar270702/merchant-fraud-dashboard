// API service layer for the Merchant Fraud Dashboard
// This uses mock data for development, but can be easily replaced with real API calls

import {
  KPIData,
  Transaction,
  DeclineReasonData,
  SalesChartDataPoint,
  DateRange,
  User,
  LoginRequest,
  LoginResponse,
} from '../types';
import {
  mockUser,
  mockKPIData,
  mockSalesChartData,
  mockDeclineReasonsData,
  mockTransactions,
  mockApiDelay,
  mockApiError,
} from '../utils/mockData';
import { aggregateDataByDate } from '../utils';
import { authService } from './authService';

// Simulate API base URL - replace with real API endpoint
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string = 'UNKNOWN_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request function (for future real API integration)
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const authState = authService.getAuthState();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(authState.token && { Authorization: `Bearer ${authState.token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error occurred', 0, 'NETWORK_ERROR');
  }
}

// Legacy Authentication Service (now delegates to enhanced authService)
export const legacyAuthService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return authService.login(credentials);
  },

  async logout(): Promise<void> {
    return authService.logout();
  },

  async getCurrentUser(): Promise<User> {
    return authService.getCurrentUser();
  },

  isAuthenticated(): boolean {
    return authService.isAuthenticated();
  },
};

// Dashboard Data Service
export const dashboardService = {
  async getKPIs(dateRange: DateRange): Promise<KPIData> {
    if (!authService.isAuthenticated()) {
      throw new ApiError('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }
    
    await mockApiDelay();
    
    // In a real implementation, you would pass dateRange to the API
    // For now, we return mock data
    return mockKPIData;
  },

  async getSalesChartData(dateRange: DateRange): Promise<SalesChartDataPoint[]> {
    if (!authService.isAuthenticated()) {
      throw new ApiError('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }
    
    await mockApiDelay();
    
    // Filter mock data based on date range
    return aggregateDataByDate(mockSalesChartData, dateRange);
  },

  async getDeclineReasons(dateRange: DateRange): Promise<DeclineReasonData[]> {
    if (!authService.isAuthenticated()) {
      throw new ApiError('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }
    
    await mockApiDelay();
    
    // In a real implementation, you would filter by dateRange
    return mockDeclineReasonsData;
  },

  async getRecentTransactions(limit: number = 20): Promise<Transaction[]> {
    if (!authService.isAuthenticated()) {
      throw new ApiError('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }
    
    await mockApiDelay();
    
    // Return the most recent transactions up to the limit
    return mockTransactions.slice(0, limit);
  },

  async getTransactionDetails(id: string): Promise<Transaction> {
    if (!authService.isAuthenticated()) {
      throw new ApiError('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }
    
    await mockApiDelay();
    
    const transaction = mockTransactions.find(t => t.id === id);
    if (!transaction) {
      throw new ApiError('Transaction not found', 404, 'NOT_FOUND');
    }
    
    return transaction;
  },

  async searchTransactions(query: string, limit: number = 50): Promise<Transaction[]> {
    if (!authService.isAuthenticated()) {
      throw new ApiError('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }
    
    await mockApiDelay();
    
    if (!query.trim()) {
      return mockTransactions.slice(0, limit);
    }
    
    const searchTerm = query.toLowerCase();
    const filtered = mockTransactions.filter(transaction =>
      transaction.orderId.toLowerCase().includes(searchTerm) ||
      transaction.customerName.toLowerCase().includes(searchTerm) ||
      transaction.customerEmail.toLowerCase().includes(searchTerm)
    );
    
    return filtered.slice(0, limit);
  },
};

// Real-time updates service (WebSocket simulation)
export const realtimeService = {
  listeners: new Set<(data: any) => void>(),

  subscribe(callback: (data: any) => void): () => void {
    this.listeners.add(callback);
    
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      // Simulate a new transaction
      const newTransaction: Transaction = {
        ...mockTransactions[0],
        id: `txn-${Date.now()}`,
        orderId: `ORD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        amount: Math.floor(Math.random() * 500) + 50,
        riskScore: Math.floor(Math.random() * 100),
        status: Math.random() > 0.8 ? 'declined' : 'approved',
      };
      
      callback({
        type: 'transaction_update',
        data: { transaction: newTransaction, action: 'created' },
        timestamp: new Date().toISOString(),
      });
    }, 30000);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
      clearInterval(interval);
    };
  },

  disconnect(): void {
    this.listeners.clear();
  },
};

// Health check service
export const healthService = {
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    await mockApiDelay(200);
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  },
};

// Export all services
export const api = {
  auth: legacyAuthService,
  dashboard: dashboardService,
  realtime: realtimeService,
  health: healthService,
};