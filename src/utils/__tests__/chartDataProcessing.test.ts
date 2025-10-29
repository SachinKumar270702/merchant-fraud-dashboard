import { describe, it, expect } from 'vitest';
import { processDeclinedOrdersForPieChart, processSalesByDate } from '../chartDataProcessing';
import { Transaction } from '../../types';

// Mock transaction data for testing
const mockTestTransactions: Transaction[] = [
  {
    id: 'txn-1',
    orderId: 'ORD-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    amount: 100,
    currency: 'USD',
    status: 'declined',
    riskScore: 85,
    timestamp: '2024-10-29T10:00:00Z',
    declineReason: 'stolen_payment_method',
  },
  {
    id: 'txn-2',
    orderId: 'ORD-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    amount: 200,
    currency: 'USD',
    status: 'declined',
    riskScore: 75,
    timestamp: '2024-10-29T11:00:00Z',
    declineReason: 'billing_shipping_mismatch',
  },
  {
    id: 'txn-3',
    orderId: 'ORD-003',
    customerName: 'Bob Johnson',
    customerEmail: 'bob@example.com',
    amount: 150,
    currency: 'USD',
    status: 'declined',
    riskScore: 90,
    timestamp: '2024-10-29T12:00:00Z',
    declineReason: 'stolen_payment_method',
  },
  {
    id: 'txn-4',
    orderId: 'ORD-004',
    customerName: 'Alice Brown',
    customerEmail: 'alice@example.com',
    amount: 300,
    currency: 'USD',
    status: 'approved',
    riskScore: 20,
    timestamp: '2024-10-29T13:00:00Z',
  },
];

describe('Chart Data Processing', () => {
  describe('processDeclinedOrdersForPieChart', () => {
    it('should filter declined orders and count decline reasons', () => {
      const result = processDeclinedOrdersForPieChart(mockTestTransactions);
      
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { name: 'Stolen Payment Method', value: 2 },
        { name: 'Billing/Shipping Mismatch', value: 1 },
      ]);
    });

    it('should return empty array when no declined orders', () => {
      const approvedOnly = mockTestTransactions.filter(t => t.status === 'approved');
      const result = processDeclinedOrdersForPieChart(approvedOnly);
      
      expect(result).toHaveLength(0);
    });

    it('should handle orders without decline reasons', () => {
      const ordersWithoutReasons = [
        {
          ...mockTestTransactions[0],
          declineReason: undefined,
        },
      ];
      
      const result = processDeclinedOrdersForPieChart(ordersWithoutReasons);
      expect(result).toHaveLength(0);
    });
  });

  describe('processSalesByDate', () => {
    it('should process approved orders by date', () => {
      const result = processSalesByDate(mockTestTransactions);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        date: '2024-10-29',
        sales: 300,
        orders: 1,
      });
    });

    it('should return empty array when no approved orders', () => {
      const declinedOnly = mockTestTransactions.filter(t => t.status === 'declined');
      const result = processSalesByDate(declinedOnly);
      
      expect(result).toHaveLength(0);
    });
  });
});