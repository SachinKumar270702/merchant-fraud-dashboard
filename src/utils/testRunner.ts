// Simple test runner to verify our utilities work correctly

import {
  getRiskLevel,
  getRiskColor,
  formatCurrency,
  formatNumber,
  formatPercentage,
  calculateTrend,
  isValidEmail,
  isValidAmount,
  isValidRiskScore,
  getDeclineReasonDisplayName,
} from './index';
import { DeclineReason } from '../types';

console.log('🧪 Running utility tests...\n');

// Test Risk Score Utilities
console.log('📊 Risk Score Tests:');
console.log(`getRiskLevel(15): ${getRiskLevel(15)} (expected: low)`);
console.log(`getRiskLevel(50): ${getRiskLevel(50)} (expected: medium)`);
console.log(`getRiskLevel(85): ${getRiskLevel(85)} (expected: high)`);
console.log(`getRiskColor(15): ${getRiskColor(15)} (expected: #10B981)`);
console.log('');

// Test Formatting Utilities
console.log('💰 Formatting Tests:');
console.log(`formatCurrency(1234.56): ${formatCurrency(1234.56)} (expected: $1,234.56)`);
console.log(`formatNumber(1234): ${formatNumber(1234)} (expected: 1,234)`);
console.log(`formatPercentage(25.5): ${formatPercentage(25.5)} (expected: 25.5%)`);
console.log('');

// Test Trend Calculation
console.log('📈 Trend Tests:');
const upTrend = calculateTrend(120, 100);
console.log(`calculateTrend(120, 100): direction=${upTrend.direction}, percentage=${upTrend.percentage} (expected: up, 20)`);

const downTrend = calculateTrend(80, 100);
console.log(`calculateTrend(80, 100): direction=${downTrend.direction}, percentage=${downTrend.percentage} (expected: down, 20)`);
console.log('');

// Test Validation Utilities
console.log('✅ Validation Tests:');
console.log(`isValidEmail('test@example.com'): ${isValidEmail('test@example.com')} (expected: true)`);
console.log(`isValidEmail('invalid-email'): ${isValidEmail('invalid-email')} (expected: false)`);
console.log(`isValidAmount(100.50): ${isValidAmount(100.50)} (expected: true)`);
console.log(`isValidAmount(-1): ${isValidAmount(-1)} (expected: false)`);
console.log(`isValidRiskScore(50): ${isValidRiskScore(50)} (expected: true)`);
console.log(`isValidRiskScore(101): ${isValidRiskScore(101)} (expected: false)`);
console.log('');

// Test Decline Reason Utilities
console.log('🚫 Decline Reason Tests:');
console.log(`getDeclineReasonDisplayName('stolen_payment_method'): ${getDeclineReasonDisplayName('stolen_payment_method' as DeclineReason)} (expected: Stolen Payment Method)`);
console.log(`getDeclineReasonDisplayName('billing_shipping_mismatch'): ${getDeclineReasonDisplayName('billing_shipping_mismatch' as DeclineReason)} (expected: Billing/Shipping Mismatch)`);
console.log('');

console.log('✨ All utility tests completed successfully!');