import assert from 'node:assert';
import { 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateNetCashFlow, 
  calculateSavingsRate, 
  calculateDailyAverage 
} from '../dineroFinanceEngine';
import { Transaction } from '../../store/useBudgetStore';

export function runDineroFinanceEngineTests() {
  console.log('⚡ Running Dinero.js Financial Engine Unit Tests...');

  const currency = 'INR';

  // 1. Total Income & Expense Calculation with Dinero precision
  {
    const txs: Transaction[] = [
      { id: 't1', title: 'Salary', amount: 50000, category: 'Income', date: '2026-08-01', time: '10:00 AM', type: 'income' },
      { id: 't2', title: 'Freelance', amount: 15000.50, category: 'Income', date: '2026-08-05', time: '03:00 PM', type: 'income' },
      { id: 't3', title: 'Rent', amount: 20000, category: 'Bills', date: '2026-08-02', time: '09:00 AM', type: 'expense' },
      { id: 't4', title: 'Groceries', amount: 4500.75, category: 'Food', date: '2026-08-10', time: '06:00 PM', type: 'expense' },
    ];

    const income = calculateTotalIncome(txs, currency);
    const expenses = calculateTotalExpenses(txs, currency);
    const net = calculateNetCashFlow(income, expenses, currency);
    const savingsRate = calculateSavingsRate(income, expenses, currency);

    assert.strictEqual(income, 65000.50);
    assert.strictEqual(expenses, 24500.75);
    assert.strictEqual(net, 40499.75);
    assert.strictEqual(savingsRate, 62.3);
  }

  // 2. Daily Average Calculation
  {
    const txs: Transaction[] = [
      { id: 't1', title: 'Food', amount: 3000, category: 'Food', date: '2026-08-01', time: '12:00 PM', type: 'expense' },
    ];
    const avg = calculateDailyAverage(txs, currency, 30);
    assert.strictEqual(avg, 100);
  }

  // 3. Zero transactions handling
  {
    const income = calculateTotalIncome([], currency);
    const expenses = calculateTotalExpenses([], currency);
    const net = calculateNetCashFlow(0, 0, currency);
    const savingsRate = calculateSavingsRate(0, 0, currency);

    assert.strictEqual(income, 0);
    assert.strictEqual(expenses, 0);
    assert.strictEqual(net, 0);
    assert.strictEqual(savingsRate, 0);
  }

  console.log('✅ ALL DINERO FINANCIAL ENGINE UNIT TESTS PASSED SUCCESSFULLY!');
}

runDineroFinanceEngineTests();
