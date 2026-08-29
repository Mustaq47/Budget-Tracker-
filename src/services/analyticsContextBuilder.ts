import { Transaction, SavingsGoal, Trip } from '../store/useBudgetStore';
import { AnalyticsMetrics } from '../types/analytics';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetCashFlow,
  calculateSavingsRate,
  calculateDailyAverage,
  calculateWeeklyAverage,
  calculateMonthlyAverage,
  calculateWeekdayVsWeekendAverage,
  calculateCategoryTotals,
  calculateCategoryPercentages,
  calculateBudgetUtilization,
  calculateReservedGoalAmount,
  calculateReservedTripAmount,
} from '../utils/dineroFinanceEngine';

/**
 * Financial Analytics Context Builder
 * Pipeline:
 * Raw store data -> normalize -> validate -> aggregate -> Dinero.js calculations -> compact privacy-safe context payload for RAGFlow.
 */

export function buildAnalyticsMetrics(
  transactions: Transaction[],
  monthlyBudget: number,
  currency: string,
  goals: SavingsGoal[] = [],
  trips: Trip[] = []
): AnalyticsMetrics {
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Filter current month transactions
  const currentMonthTx = transactions.filter(t => t.date && t.date.startsWith(currentPeriod));

  // Compute Dinero-based metrics for current period
  const totalIncome = calculateTotalIncome(currentMonthTx, currency);
  const totalExpenses = calculateTotalExpenses(currentMonthTx, currency);
  const netCashFlow = calculateNetCashFlow(totalIncome, totalExpenses, currency);
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses, currency);

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = Math.max(1, now.getDate());

  const dailyAverage = calculateDailyAverage(currentMonthTx, currency, daysPassed);
  const weeklyAverage = calculateWeeklyAverage(dailyAverage);
  const monthlyAverage = calculateMonthlyAverage(dailyAverage);

  const { weekdayAverage, weekendAverage, highestSpendingDay } = calculateWeekdayVsWeekendAverage(currentMonthTx, currency);
  
  const categoryTotals = calculateCategoryTotals(currentMonthTx, currency);
  const categoryBreakdown = calculateCategoryPercentages(categoryTotals, totalExpenses);

  const { remainingBudget, utilizationPercent } = calculateBudgetUtilization(totalExpenses, monthlyBudget, currency);

  const goalContributionProgress = calculateReservedGoalAmount(goals, currency);
  const tripBudgetUsage = calculateReservedTripAmount(trips, currency);

  // Month-over-Month logic
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevPeriod = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthTx = transactions.filter(t => t.date && t.date.startsWith(prevPeriod));
  const prevCategoryTotals = calculateCategoryTotals(prevMonthTx, currency);

  // Update category MoM changes
  categoryBreakdown.forEach(catItem => {
    const prevAmount = prevCategoryTotals[catItem.category] || 0;
    if (prevAmount > 0) {
      catItem.monthOverMonthChange = Math.round(((catItem.amount - prevAmount) / prevAmount) * 1000) / 10;
    } else {
      catItem.monthOverMonthChange = catItem.amount > 0 ? 100 : 0;
    }
  });

  const unusualSpendingChanges = categoryBreakdown
    .filter(c => c.monthOverMonthChange > 20 && c.amount > 100)
    .map(c => ({ category: c.category, increasePercent: c.monthOverMonthChange }));

  return {
    currency,
    period: currentPeriod,
    totalIncome,
    totalExpenses,
    netCashFlow,
    savings: Math.max(0, netCashFlow),
    savingsRate,
    dailyAverage,
    weeklyAverage,
    monthlyAverage,
    weekdayAverage,
    weekendAverage,
    budgetUtilization: utilizationPercent,
    remainingBudget,
    categoryBreakdown,
    monthlyComparison: [
      {
        month: prevPeriod,
        income: calculateTotalIncome(prevMonthTx, currency),
        expenses: calculateTotalExpenses(prevMonthTx, currency),
        savings: Math.max(0, calculateNetCashFlow(calculateTotalIncome(prevMonthTx, currency), calculateTotalExpenses(prevMonthTx, currency), currency)),
      },
      {
        month: currentPeriod,
        income: totalIncome,
        expenses: totalExpenses,
        savings: Math.max(0, netCashFlow),
      }
    ],
    recurringCommitments: [],
    spendingPatterns: {
      label: `Spending is higher on ${highestSpendingDay}s`,
      weekdayAverage,
      weekendAverage,
      highestSpendingDay,
    },
    goalContributionProgress,
    tripBudgetUsage,
    unusualSpendingChanges,
  };
}

/**
 * Builds a strict PII-sanitized, compact context object for RAGFlow AI.
 */
export function buildPrivacySafeAIContext(metrics: AnalyticsMetrics): Record<string, any> {
  return {
    period: metrics.period,
    currency: metrics.currency,
    income: metrics.totalIncome,
    expenses: metrics.totalExpenses,
    savings: metrics.savings,
    savingsRate: metrics.savingsRate,
    budgetUtilization: metrics.budgetUtilization,
    remainingBudget: metrics.remainingBudget,
    dailyAverage: metrics.dailyAverage,
    weekdayAverage: metrics.weekdayAverage,
    weekendAverage: metrics.weekendAverage,
    topCategories: metrics.categoryBreakdown.slice(0, 4).map(c => ({
      name: c.category,
      amount: c.amount,
      percentage: c.percentage,
      changePercent: c.monthOverMonthChange
    })),
    unusualIncreases: metrics.unusualSpendingChanges,
  };
}
