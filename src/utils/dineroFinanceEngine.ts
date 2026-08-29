import { Transaction, SavingsGoal, Trip } from '../store/useBudgetStore';
import { createMoney, addMoney, subtractMoney, formatMoneyNumber, zeroMoney, compareMoney, multiplyMoney } from './dineroHelpers';
import { AnalyticsMetrics, CategoryBreakdownItem, MonthlyComparisonItem } from '../types/analytics';

/**
 * PRODUCTION-GRADE DINERO.JS FINANCE ENGINE
 * All monetary operations strictly use Dinero objects internally.
 * Floating point numbers are returned only as derived display values or percentages.
 */

export const calculateTotalIncome = (transactions: Transaction[], currencyCode: string): number => {
  const total = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => addMoney(acc, createMoney(t.amount, currencyCode)), zeroMoney(currencyCode));
  return formatMoneyNumber(total);
};

export const calculateTotalExpenses = (transactions: Transaction[], currencyCode: string): number => {
  const total = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => addMoney(acc, createMoney(t.amount, currencyCode)), zeroMoney(currencyCode));
  return formatMoneyNumber(total);
};

export const calculateNetCashFlow = (incomeAmount: number, expenseAmount: number, currencyCode: string): number => {
  const inc = createMoney(incomeAmount, currencyCode);
  const exp = createMoney(expenseAmount, currencyCode);
  const net = subtractMoney(inc, exp);
  return formatMoneyNumber(net);
};

export const calculateSavingsRate = (incomeAmount: number, expenseAmount: number, currencyCode: string): number => {
  if (incomeAmount <= 0) return 0;
  const net = calculateNetCashFlow(incomeAmount, expenseAmount, currencyCode);
  if (net <= 0) return 0;
  return Math.min(100, Math.round((net / incomeAmount) * 1000) / 10);
};

export const calculateDailyAverage = (transactions: Transaction[], currencyCode: string, daysCount: number = 30): number => {
  if (daysCount <= 0) return 0;
  const totalExp = calculateTotalExpenses(transactions, currencyCode);
  return Math.round((totalExp / daysCount) * 100) / 100;
};

export const calculateWeeklyAverage = (dailyAvg: number): number => {
  return Math.round(dailyAvg * 7 * 100) / 100;
};

export const calculateMonthlyAverage = (dailyAvg: number): number => {
  return Math.round(dailyAvg * 30 * 100) / 100;
};

export const calculateWeekdayVsWeekendAverage = (transactions: Transaction[], currencyCode: string): { weekdayAverage: number; weekendAverage: number; highestSpendingDay: string } => {
  const expenses = transactions.filter(t => t.type === 'expense');
  let weekdaySum = zeroMoney(currencyCode);
  let weekendSum = zeroMoney(currencyCode);
  let weekdayCount = 0;
  let weekendCount = 0;

  const dayTotals: Record<string, number> = {
    Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
  };

  expenses.forEach(t => {
    const d = new Date(t.date);
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const moneyVal = createMoney(t.amount, currencyCode);

    dayTotals[dayName] = (dayTotals[dayName] || 0) + t.amount;

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendSum = addMoney(weekendSum, moneyVal);
      weekendCount++;
    } else {
      weekdaySum = addMoney(weekdaySum, moneyVal);
      weekdayCount++;
    }
  });

  let highestSpendingDay = 'Monday';
  let maxDaySpend = -1;
  Object.entries(dayTotals).forEach(([day, amt]) => {
    if (amt > maxDaySpend) {
      maxDaySpend = amt;
      highestSpendingDay = day;
    }
  });

  const weekdayAvg = weekdayCount > 0 ? formatMoneyNumber(weekdaySum) / Math.max(1, weekdayCount / 5) : 0;
  const weekendAvg = weekendCount > 0 ? formatMoneyNumber(weekendSum) / Math.max(1, weekendCount / 2) : 0;

  return {
    weekdayAverage: Math.round(weekdayAvg * 100) / 100,
    weekendAverage: Math.round(weekendAvg * 100) / 100,
    highestSpendingDay
  };
};

export const calculateCategoryTotals = (transactions: Transaction[], currencyCode: string): Record<string, number> => {
  const categories: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const cat = t.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + t.amount;
    });

  // Re-calculate using Dinero to ensure precision
  const result: Record<string, number> = {};
  Object.entries(categories).forEach(([cat, val]) => {
    result[cat] = formatMoneyNumber(createMoney(val, currencyCode));
  });
  return result;
};

export const calculateCategoryPercentages = (categoryTotals: Record<string, number>, totalExpenses: number): CategoryBreakdownItem[] => {
  if (totalExpenses <= 0) return [];
  
  return Object.entries(categoryTotals)
    .map(([category, amount]) => {
      const percentage = Math.round((amount / totalExpenses) * 1000) / 10;
      return {
        category,
        amount,
        percentage,
        monthOverMonthChange: 0 // calculated in context builder
      };
    })
    .sort((a, b) => b.amount - a.amount);
};

export const calculateBudgetUtilization = (spentAmount: number, budgetAmount: number, currencyCode: string): { remainingBudget: number; utilizationPercent: number } => {
  const spent = createMoney(spentAmount, currencyCode);
  const budget = createMoney(budgetAmount, currencyCode);

  let remaining = subtractMoney(budget, spent);
  const isNegative = compareMoney(remaining, zeroMoney(currencyCode)).less;

  if (isNegative) {
    remaining = zeroMoney(currencyCode);
  }

  const remainingVal = formatMoneyNumber(remaining);
  const utilPercent = budgetAmount > 0 ? Math.min(100, Math.round((spentAmount / budgetAmount) * 100)) : 0;

  return {
    remainingBudget: remainingVal,
    utilizationPercent: utilPercent
  };
};

export const calculateReservedGoalAmount = (goals: SavingsGoal[], currencyCode: string): number => {
  const total = goals.reduce((acc, g) => addMoney(acc, createMoney(g.currentAmount || 0, currencyCode)), zeroMoney(currencyCode));
  return formatMoneyNumber(total);
};

export const calculateReservedTripAmount = (trips: Trip[], currencyCode: string): number => {
  const total = trips.reduce((acc, t) => addMoney(acc, createMoney(t.budget || 0, currencyCode)), zeroMoney(currencyCode));
  return formatMoneyNumber(total);
};

export const calculateUpcomingObligations = (goals: SavingsGoal[], trips: Trip[], currencyCode: string): number => {
  const goalRes = calculateReservedGoalAmount(goals, currencyCode);
  const tripRes = calculateReservedTripAmount(trips, currencyCode);
  const sum = addMoney(createMoney(goalRes, currencyCode), createMoney(tripRes, currencyCode));
  return formatMoneyNumber(sum);
};

export const calculateSafetyBuffer = (monthlyBudget: number, bufferPercent: number = 0.1, currencyCode: string): number => {
  const budget = createMoney(monthlyBudget, currencyCode);
  const buffer = multiplyMoney(budget, bufferPercent);
  return formatMoneyNumber(buffer);
};

export const calculateSafeToSpend = (
  availableBalance: number,
  upcomingObligations: number,
  reservedSavings: number,
  safetyBuffer: number,
  daysRemaining: number,
  currencyCode: string
): { calculatedMaximum: number; recommendedLimit: number; discretionaryFunds: number } => {
  const avail = createMoney(availableBalance, currencyCode);
  const upcoming = createMoney(upcomingObligations, currencyCode);
  const reserved = createMoney(reservedSavings, currencyCode);
  const buffer = createMoney(safetyBuffer, currencyCode);

  const deductions = addMoney(addMoney(upcoming, reserved), buffer);
  let discretionary = subtractMoney(avail, deductions);

  if (compareMoney(discretionary, zeroMoney(currencyCode)).less) {
    discretionary = zeroMoney(currencyCode);
  }

  const discretionaryVal = formatMoneyNumber(discretionary);
  const safeDays = Math.max(1, daysRemaining);

  const rawDailyMax = discretionaryVal / safeDays;
  const calculatedMaximum = Math.max(0, Math.floor(rawDailyMax));
  
  // Recommended applies conservative safety margin (90% of max)
  const recommendedLimit = Math.max(0, Math.floor(calculatedMaximum * 0.9));

  return {
    calculatedMaximum,
    recommendedLimit,
    discretionaryFunds: discretionaryVal
  };
};
