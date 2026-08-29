import { Transaction, SavingsGoal, Trip } from '../store/useBudgetStore';
import {
  calculateSafeToSpend,
  calculateUpcomingObligations,
  calculateReservedGoalAmount,
  calculateReservedTripAmount,
  calculateSafetyBuffer,
  calculateTotalExpenses,
  calculateDailyAverage
} from '../utils/dineroFinanceEngine';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type ReasonCode =
  | 'UPCOMING_EXPENSES'
  | 'SAVINGS_RESERVE'
  | 'TRIP_RESERVE'
  | 'HIGH_RECENT_SPENDING'
  | 'HIGH_BUDGET_UTILIZATION'
  | 'LOW_AVAILABLE_BALANCE'
  | 'INSUFFICIENT_BUFFER';

export interface SafeToSpendResult {
  calculatedMaximum: number;
  recommendedLimit: number;
  currency: string;
  riskLevel: RiskLevel;
  reasonCodes: ReasonCode[];
  remainingDays: number;
  upcomingObligations: number;
  reservedSavings: number;
  reservedTripFunds: number;
  safetyBuffer: number;
  discretionaryFunds: number;
  dataFreshness: string;
  aiExplanation?: string;
}

export function computeSafeToSpend(
  availableBalance: number,
  monthlyBudget: number,
  currency: string,
  transactions: Transaction[],
  goals: SavingsGoal[] = [],
  trips: Trip[] = []
): SafeToSpendResult {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = Math.max(1, daysInMonth - now.getDate() + 1);

  const upcomingObligations = calculateUpcomingObligations(goals, trips, currency);
  const reservedSavings = calculateReservedGoalAmount(goals, currency);
  const reservedTripFunds = calculateReservedTripAmount(trips, currency);
  const safetyBuffer = calculateSafetyBuffer(monthlyBudget, 0.1, currency);

  const { calculatedMaximum, recommendedLimit, discretionaryFunds } = calculateSafeToSpend(
    availableBalance,
    upcomingObligations,
    reservedSavings,
    safetyBuffer,
    remainingDays,
    currency
  );

  // Deterministic Risk Engine
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthTx = transactions.filter(t => t.date && t.date.startsWith(currentPeriod));
  const spentThisMonth = calculateTotalExpenses(currentMonthTx, currency);
  const budgetUtilization = monthlyBudget > 0 ? (spentThisMonth / monthlyBudget) * 100 : 0;
  const recentDailyAverage = calculateDailyAverage(currentMonthTx, currency, Math.max(1, now.getDate()));

  const reasonCodes: ReasonCode[] = [];

  if (upcomingObligations > 0) reasonCodes.push('UPCOMING_EXPENSES');
  if (reservedSavings > 0) reasonCodes.push('SAVINGS_RESERVE');
  if (reservedTripFunds > 0) reasonCodes.push('TRIP_RESERVE');

  if (recentDailyAverage > recommendedLimit && recommendedLimit > 0) {
    reasonCodes.push('HIGH_RECENT_SPENDING');
  }

  if (budgetUtilization >= 80) {
    reasonCodes.push('HIGH_BUDGET_UTILIZATION');
  }

  if (availableBalance < safetyBuffer) {
    reasonCodes.push('LOW_AVAILABLE_BALANCE');
    reasonCodes.push('INSUFFICIENT_BUFFER');
  }

  let riskLevel: RiskLevel = 'LOW';
  if (reasonCodes.includes('HIGH_BUDGET_UTILIZATION') || reasonCodes.includes('LOW_AVAILABLE_BALANCE') || budgetUtilization >= 90) {
    riskLevel = 'HIGH';
  } else if (reasonCodes.includes('HIGH_RECENT_SPENDING') || reasonCodes.includes('UPCOMING_EXPENSES') || budgetUtilization >= 70) {
    riskLevel = 'MEDIUM';
  }

  const dataFreshness = `Data updated as of ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return {
    calculatedMaximum,
    recommendedLimit,
    currency,
    riskLevel,
    reasonCodes,
    remainingDays,
    upcomingObligations,
    reservedSavings,
    reservedTripFunds,
    safetyBuffer,
    discretionaryFunds,
    dataFreshness
  };
}
