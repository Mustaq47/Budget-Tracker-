import assert from 'node:assert';
import { calculateSmartSpendingPlan, SmartSpendingSettings } from '../smartSpendingEngine';
import { Transaction } from '../../store/useBudgetStore';

export function runSmartSpendingEngineTests() {
  console.log('⚡ Running Smart Spending Engine V2 Unit Tests...');

  // Helper to create date object for testing
  const makeDate = (year: number, month: number, day: number) => {
    return new Date(year, month - 1, day, 12, 0, 0); // local time midday
  };

  const defaultSettings: SmartSpendingSettings = {
    rolloverPolicy: 'distribute',
    emergencyBufferPercent: 10,
  };

  // 1. Empty month (no transactions)
  // August has 31 days. Current date: Aug 15. Remaining days = 17.
  // Budget = 30000. Buffer = 10% = 3000. Spendable = 27000.
  // Base daily allowance = 27000 / 17 = 1588.23 -> 1588
  {
    const plan = calculateSmartSpendingPlan({
      monthlyBudget: 30000,
      transactions: [],
      currentDate: makeDate(2026, 8, 15),
      settings: defaultSettings,
    });
    assert.strictEqual(plan.totalBudget, 30000);
    assert.strictEqual(plan.actualSpent, 0);
    assert.strictEqual(plan.remainingBudget, 30000);
    assert.strictEqual(plan.emergencyBuffer, 3000);
    assert.strictEqual(plan.spendableAmount, 27000);
    assert.strictEqual(plan.remainingDays, 17);
    assert.strictEqual(plan.baseDailyAllowance, 1588.24);
    assert.strictEqual(plan.safeToSpendToday, 1588.24);
  }

  // 2. Normal spending
  // Budget = 30000. Current date: Aug 15. Remaining days = 17.
  // Spent past = 5000. Spent today = 500.
  // Spent total = 5500. Remaining = 24500.
  // Buffer = 3000. Spendable = 30000 - 5000 (past) - 3000 (buffer) = 22000.
  // Base daily allowance = 22000 / 17 = 1294.11 -> 1294.12
  // Safe to spend today = 1294.12 - 500 (today) = 794.12
  {
    const transactions: Transaction[] = [
      { id: 't1', title: 'Past Expense', amount: 5000, category: 'Food', date: '2026-08-10', time: '12:00 PM', type: 'expense' },
      { id: 't2', title: 'Today Expense', amount: 500, category: 'Bills', date: '2026-08-15', time: '02:00 PM', type: 'expense' },
    ];
    const plan = calculateSmartSpendingPlan({
      monthlyBudget: 30000,
      transactions,
      currentDate: makeDate(2026, 8, 15),
      settings: defaultSettings,
    });
    assert.strictEqual(plan.actualSpent, 5500);
    assert.strictEqual(plan.remainingBudget, 24500);
    assert.strictEqual(plan.baseDailyAllowance, 1294.12);
    assert.strictEqual(plan.safeToSpendToday, 794.12);
  }

  // 3. Overspending
  // If we spent more than the total budget
  {
    const transactions: Transaction[] = [
      { id: 't1', title: 'Overspend', amount: 35000, category: 'Shopping', date: '2026-08-10', time: '12:00 PM', type: 'expense' },
    ];
    const plan = calculateSmartSpendingPlan({
      monthlyBudget: 30000,
      transactions,
      currentDate: makeDate(2026, 8, 15),
      settings: defaultSettings,
    });
    assert.strictEqual(plan.remainingBudget, 0);
    assert.strictEqual(plan.spendableAmount, 0);
    assert.strictEqual(plan.baseDailyAllowance, 0);
    assert.strictEqual(plan.safeToSpendToday, 0);
    assert.strictEqual(plan.status, 'OVER_BUDGET');
  }

  // 4. Rollover distribute vs accumulate
  // Budget = 30000. D = 31. Current date = Aug 2 (d = 2, d_rem = 30).
  // Buffer = 3000. Savings = 0. Commitments = 0.
  // Ideal pool = 27000. Ideal allowance = 27000 / 31 = 870
  // Yesterday (Aug 1) expected spent = 870. Actual spent = 200.
  // Net balance yesterday = 870 - 200 = 670 surplus.
  // Distribute policy:
  // Spendable pool today = 30000 - 200 (past) - 3000 (buffer) = 26800.
  // Allowance today = 26800 / 30 = 893
  {
    const transactions: Transaction[] = [
      { id: 't1', title: 'Low Spend', amount: 200, category: 'Food', date: '2026-08-01', time: '12:00 PM', type: 'expense' },
    ];
    const planDistribute = calculateSmartSpendingPlan({
      monthlyBudget: 30000,
      transactions,
      currentDate: makeDate(2026, 8, 2),
      settings: { rolloverPolicy: 'distribute', emergencyBufferPercent: 10 },
    });
    assert.strictEqual(planDistribute.baseDailyAllowance, 893.34);
    assert.strictEqual(planDistribute.rolloverAdjustment, 0);

    // Accumulate policy:
    // Allowance today = ideal allowance (870.97) + rollover surplus (670.97) = 1541.94
    const planAccumulate = calculateSmartSpendingPlan({
      monthlyBudget: 30000,
      transactions,
      currentDate: makeDate(2026, 8, 2),
      settings: { rolloverPolicy: 'accumulate', emergencyBufferPercent: 10 },
    });
    assert.strictEqual(planAccumulate.rolloverAdjustment, 670.97);
    assert.strictEqual(planAccumulate.safeToSpendToday, 1541.94);
  }

  // 5. Overspending Recovery (distribute vs accumulate)
  // Budget = 30000. D = 31. d = 2. d_rem = 30.
  // Ideal allowance = 870.97.
  // Yesterday (Aug 1) actual spent = 1500 (overspent by 629.03).
  // Distribute policy:
  // Spendable pool today = 30000 - 1500 - 3000 = 25500.
  // Allowance today = 25500 / 30 = 850
  {
    const transactions: Transaction[] = [
      { id: 't1', title: 'High Spend', amount: 1500, category: 'Food', date: '2026-08-01', time: '12:00 PM', type: 'expense' },
    ];
    const planDistribute = calculateSmartSpendingPlan({
      monthlyBudget: 30000,
      transactions,
      currentDate: makeDate(2026, 8, 2),
      settings: { rolloverPolicy: 'distribute', emergencyBufferPercent: 10 },
    });
    assert.strictEqual(planDistribute.baseDailyAllowance, 850);
    assert.strictEqual(planDistribute.overspendingAdjustment, 0);

    // Accumulate policy:
    // Allowance today = ideal allowance (870.97) - distributed deficit (629.03 / 30) = 870.97 - 20.97 = 850
    const planAccumulate = calculateSmartSpendingPlan({
      monthlyBudget: 30000,
      transactions,
      currentDate: makeDate(2026, 8, 2),
      settings: { rolloverPolicy: 'accumulate', emergencyBufferPercent: 10 },
    });
    assert.strictEqual(planAccumulate.overspendingAdjustment, -20.97);
    assert.strictEqual(planAccumulate.safeToSpendToday, 850);
  }

  // 6. Future commitments
  // Expense on Aug 20 (future relative to Aug 15)
  // Should reduce the current spendable pool.
  {
    const transactions: Transaction[] = [
      { id: 't1', title: 'Rent Promise', amount: 5000, category: 'Housing', date: '2026-08-20', time: '12:00 PM', type: 'expense' },
    ];
    const plan = calculateSmartSpendingPlan({
      monthlyBudget: 30000,
      transactions,
      currentDate: makeDate(2026, 8, 15),
      settings: defaultSettings,
    });
    assert.strictEqual(plan.futureCommitments, 5000);
    assert.strictEqual(plan.spendableAmount, 22000); // 30k0 - 5k (commitment) - 3k (buffer)
  }

  // 7. Savings Goals contributions
  // A goal contribution transaction should be summed under savingsCommitment
  // and isolated from normal expenses
  {
    const transactions: Transaction[] = [
      { id: 't1', title: 'Save Contribution', amount: 1500, category: 'Goal Contribution', date: '2026-08-10', time: '12:00 PM', type: 'expense', goalId: 'goal-1' },
      { id: 't2', title: 'Groceries', amount: 500, category: 'Food', date: '2026-08-12', time: '02:00 PM', type: 'expense' },
    ];
    const plan = calculateSmartSpendingPlan({
      monthlyBudget: 30000,
      transactions,
      currentDate: makeDate(2026, 8, 15),
      settings: defaultSettings,
    });
    assert.strictEqual(plan.savingsCommitment, 1500);
    assert.strictEqual(plan.actualSpent, 500); // groceries only
    assert.strictEqual(plan.spendableAmount, 25000); // 30k - 500 (spent) - 1.5k (savings) - 3k (buffer)
  }

  // 8. Trip isolation
  // Trip transactions are ignored by the budget engine
  {
    const transactions: Transaction[] = [
      { id: 't1', title: 'Goa Hotel', amount: 8000, category: 'Travel', date: '2026-08-10', time: '12:00 PM', type: 'expense', tripId: 'trip-1' },
    ];
    const plan = calculateSmartSpendingPlan({
      monthlyBudget: 30000,
      transactions,
      currentDate: makeDate(2026, 8, 15),
      settings: defaultSettings,
    });
    assert.strictEqual(plan.actualSpent, 0);
  }

  // 9. Zero budget handling
  {
    const plan = calculateSmartSpendingPlan({
      monthlyBudget: 0,
      transactions: [],
      currentDate: makeDate(2026, 8, 15),
      settings: defaultSettings,
    });
    assert.strictEqual(plan.totalBudget, 0);
    assert.strictEqual(plan.emergencyBuffer, 0);
    assert.strictEqual(plan.spendableAmount, 0);
    assert.strictEqual(plan.safeToSpendToday, 0);
  }

  // 10. Leap years (February 29)
  // Feb 2028 is a leap year (29 days).
  // Current date: Feb 28, 2028. d_rem = 2.
  // Budget = 29000. Buffer = 10% = 2900. Spendable = 26100.
  // Base daily allowance = 26100 / 2 = 13050.
  {
    const plan = calculateSmartSpendingPlan({
      monthlyBudget: 29000,
      transactions: [],
      currentDate: makeDate(2028, 2, 28),
      settings: defaultSettings,
    });
    assert.strictEqual(plan.remainingDays, 2);
    assert.strictEqual(plan.baseDailyAllowance, 13050);
  }

  console.log('✅ ALL SMART SPENDING ENGINE UNIT TESTS PASSED SUCCESSFULLY!');
}

runSmartSpendingEngineTests();
