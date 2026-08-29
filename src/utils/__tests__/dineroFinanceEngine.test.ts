import assert from 'node:assert';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetCashFlow,
  calculateSavingsRate,
  calculateCategoryTotals,
  calculateSafeToSpend,
  calculateReservedGoalAmount,
  calculateReservedTripAmount,
} from '../dineroFinanceEngine';
import { Transaction, SavingsGoal, Trip } from '../../store/useBudgetStore';

export function runDineroEngineTests() {
  console.log('⚡ Running Dinero Finance Engine Unit Tests...');

  const sampleTransactions: Transaction[] = [
    { id: '1', title: 'Salary', amount: 50000, category: 'Income', date: '2026-08-01', time: '10:00 AM', type: 'income' },
    { id: '2', title: 'Groceries', amount: 4500, category: 'Food', date: '2026-08-05', time: '11:00 AM', type: 'expense' },
    { id: '3', title: 'Rent', amount: 15000, category: 'Housing', date: '2026-08-10', time: '09:00 AM', type: 'expense' },
  ];

  // 1. Total Income
  const totalInc = calculateTotalIncome(sampleTransactions, 'INR');
  assert.strictEqual(totalInc, 50000, 'Total income calculation mismatch');

  // 2. Total Expenses
  const totalExp = calculateTotalExpenses(sampleTransactions, 'INR');
  assert.strictEqual(totalExp, 19500, 'Total expenses calculation mismatch');

  // 3. Net Cash Flow
  const net = calculateNetCashFlow(50000, 19500, 'INR');
  assert.strictEqual(net, 30500, 'Net cash flow mismatch');

  // 4. Savings Rate
  const rate = calculateSavingsRate(50000, 19500, 'INR');
  assert.strictEqual(rate, 61, 'Savings rate mismatch');

  // 5. Zero Income Handling
  const zeroRate = calculateSavingsRate(0, 500, 'INR');
  assert.strictEqual(zeroRate, 0, 'Zero income savings rate mismatch');

  // 6. Category Totals
  const totals = calculateCategoryTotals(sampleTransactions, 'INR');
  assert.strictEqual(totals['Food'], 4500, 'Food category total mismatch');
  assert.strictEqual(totals['Housing'], 15000, 'Housing category total mismatch');

  // 7. Safe to Spend calculation
  const goals: SavingsGoal[] = [{ id: 'g1', title: 'Emergency Fund', targetAmount: 100000, currentAmount: 5000, category: 'Savings', glow: 'blue' }];
  const trips: Trip[] = [{ id: 't1', title: 'Goa', budget: 10000, spent: 2000, startDate: '2026-09-01', endDate: '2026-09-05', gradient: '' }];

  const goalRes = calculateReservedGoalAmount(goals, 'INR');
  const tripRes = calculateReservedTripAmount(trips, 'INR');

  assert.strictEqual(goalRes, 5000, 'Goal reserve mismatch');
  assert.strictEqual(tripRes, 10000, 'Trip reserve mismatch');

  const safeResult = calculateSafeToSpend(
    30000, // available balance
    15000, // upcoming obligations
    5000,  // reserved savings
    1000,  // safety buffer
    10,    // 10 remaining days
    'INR'
  );

  assert.strictEqual(safeResult.discretionaryFunds, 9000, 'Discretionary funds mismatch');
  assert.strictEqual(safeResult.calculatedMaximum, 900, 'Calculated max mismatch');
  assert.strictEqual(safeResult.recommendedLimit, 810, 'Recommended limit mismatch');

  console.log('✅ ALL DINERO ENGINE UNIT TESTS PASSED SUCCESSFULLY!');
}

runDineroEngineTests();
