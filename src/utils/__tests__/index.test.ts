import { describe, it, expect } from 'vitest';
import {
  getRiskLevel,
  getRiskColor,
  formatCurrency,
  formatNumber,
  formatPercentage,
  getDateRangeFromPreset,
  calculateTrend,
  isValidEmail,
  isValidAmount,
  isValidRiskScore,
  getDeclineReasonDisplayName,
  calculatePercentages,
} from '../index';
import { DeclineReason } from '../../types';

describe('Risk Score Utilities', () => {
  it('should correctly determine risk levels', () => {
    expect(getRiskLevel(15)).toBe('low');
    expect(getRiskLevel(50)).toBe('medium');
    expect(getRiskLevel(85)).toBe('high');
  });

  it('should return correct colors for risk scores', () => {
    expect(getRiskColor(15)).toBe('#10B981'); // Green
    expect(getRiskColor(50)).toBe('#F59E0B'); // Yellow
    expect(getRiskColor(85)).toBe('#EF4444'); // Red
  });

  it('should validate risk scores correctly', () => {
    expect(isValidRiskScore(50)).toBe(true);
    expect(isValidRiskScore(0)).toBe(true);
    expect(isValidRiskScore(100)).toBe(true);
    expect(isValidRiskScore(-1)).toBe(false);
    expect(isValidRiskScore(101)).toBe(false);
    expect(isValidRiskScore(NaN)).toBe(false);
  });
});

describe('Formatting Utilities', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('should format numbers correctly', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('should format percentages correctly', () => {
    expect(formatPercentage(25.5)).toBe('25.5%');
    expect(formatPercentage(100)).toBe('100.0%');
    expect(formatPercentage(0)).toBe('0.0%');
  });
});

describe('Date Range Utilities', () => {
  it('should create correct date ranges from presets', () => {
    const range7d = getDateRangeFromPreset('7d');
    const range30d = getDateRangeFromPreset('30d');
    const range90d = getDateRangeFromPreset('90d');

    expect(range7d.preset).toBe('7d');
    expect(range30d.preset).toBe('30d');
    expect(range90d.preset).toBe('90d');

    // Check that start dates are before end dates
    expect(new Date(range7d.startDate)).toBeLessThan(new Date(range7d.endDate));
    expect(new Date(range30d.startDate)).toBeLessThan(new Date(range30d.endDate));
    expect(new Date(range90d.startDate)).toBeLessThan(new Date(range90d.endDate));
  });
});

describe('Trend Calculation', () => {
  it('should calculate positive trends correctly', () => {
    const trend = calculateTrend(120, 100);
    expect(trend.direction).toBe('up');
    expect(trend.percentage).toBe(20);
  });

  it('should calculate negative trends correctly', () => {
    const trend = calculateTrend(80, 100);
    expect(trend.direction).toBe('down');
    expect(trend.percentage).toBe(20);
  });

  it('should handle zero previous value', () => {
    const trend = calculateTrend(100, 0);
    expect(trend.direction).toBe('up');
    expect(trend.percentage).toBe(0);
  });

  it('should handle equal values', () => {
    const trend = calculateTrend(100, 100);
    expect(trend.direction).toBe('neutral');
    expect(trend.percentage).toBe(0);
  });
});

describe('Validation Utilities', () => {
  it('should validate emails correctly', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('should validate amounts correctly', () => {
    expect(isValidAmount(100.50)).toBe(true);
    expect(isValidAmount(0)).toBe(true);
    expect(isValidAmount(-1)).toBe(false);
    expect(isValidAmount(NaN)).toBe(false);
    expect(isValidAmount(Infinity)).toBe(false);
  });
});

describe('Decline Reason Utilities', () => {
  it('should return correct display names', () => {
    expect(getDeclineReasonDisplayName('stolen_payment_method' as DeclineReason))
      .toBe('Stolen Payment Method');
    expect(getDeclineReasonDisplayName('billing_shipping_mismatch' as DeclineReason))
      .toBe('Billing/Shipping Mismatch');
  });
});

describe('Data Processing Utilities', () => {
  it('should calculate percentages correctly', () => {
    const data = [
      { name: 'A', count: 30 },
      { name: 'B', count: 20 },
      { name: 'C', count: 50 },
    ];

    const result = calculatePercentages(data);
    
    expect(result[0].percentage).toBe(30);
    expect(result[1].percentage).toBe(20);
    expect(result[2].percentage).toBe(50);
  });

  it('should handle empty data for percentages', () => {
    const data = [
      { name: 'A', count: 0 },
      { name: 'B', count: 0 },
    ];

    const result = calculatePercentages(data);
    
    expect(result[0].percentage).toBe(0);
    expect(result[1].percentage).toBe(0);
  });
});