export interface CategoryBreakdownItem {
  category: string;
  amount: number; // in units (e.g. 6200)
  percentage: number; // 0-100
  monthOverMonthChange: number; // percentage change vs prev month
}

export interface MonthlyComparisonItem {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  savings: number;
}

export interface RecurringCommitmentItem {
  title: string;
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export interface SpendingPatternItem {
  label: string;
  weekdayAverage: number;
  weekendAverage: number;
  highestSpendingDay: string;
}

export interface AnalyticsMetrics {
  currency: string;
  period: string; // YYYY-MM
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savings: number;
  savingsRate: number; // percentage 0-100
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  weekdayAverage: number;
  weekendAverage: number;
  budgetUtilization: number; // percentage 0-100
  remainingBudget: number;
  categoryBreakdown: CategoryBreakdownItem[];
  monthlyComparison: MonthlyComparisonItem[];
  recurringCommitments: RecurringCommitmentItem[];
  spendingPatterns: SpendingPatternItem;
  goalContributionProgress: number; // total goal contributions this month
  tripBudgetUsage: number; // total trip spend this month
  unusualSpendingChanges: { category: string; increasePercent: number }[];
}

export interface AIInsightItem {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'positive';
  metric?: {
    type: 'percentage' | 'currency' | 'ratio';
    value: number;
  };
}

export interface AIRecommendationItem {
  title: string;
  description: string;
}

export interface RAGFlowAnalyticsResponse {
  summary: string;
  keyInsights: AIInsightItem[];
  positivePatterns: AIInsightItem[];
  warnings: AIInsightItem[];
  recommendations: AIRecommendationItem[];
}
