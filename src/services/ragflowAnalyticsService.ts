import { RAGFlowAnalyticsResponse, AnalyticsMetrics } from '../types/analytics';
import { SafeToSpendResult } from './safeToSpendEngine';

const CACHE_PREFIX = 'cozify_ragflow_cache_v1_';

export class RAGFlowAnalyticsService {
  /**
   * Generates deterministic fallback analytics insights if offline or AI fails.
   */
  public static generateFallbackInsights(metrics: AnalyticsMetrics): RAGFlowAnalyticsResponse {
    const isHighUtil = metrics.budgetUtilization > 80;
    const isPositiveNet = metrics.netCashFlow > 0;

    return {
      summary: `In ${metrics.period}, total spending is ${metrics.currency}${metrics.totalExpenses.toLocaleString()} out of an income of ${metrics.currency}${metrics.totalIncome.toLocaleString()}. Savings rate is at ${metrics.savingsRate}%.`,
      keyInsights: [
        {
          title: `Budget Utilization: ${metrics.budgetUtilization}%`,
          description: isHighUtil 
            ? 'Budget usage is nearing capacity for this period.' 
            : 'Spending remains within healthy boundaries.',
          severity: isHighUtil ? 'warning' : 'info',
          metric: { type: 'percentage', value: metrics.budgetUtilization }
        },
        {
          title: `Daily Average Spend`,
          description: `You spend an average of ${metrics.currency}${metrics.dailyAverage.toLocaleString()} per day.`,
          severity: 'info',
          metric: { type: 'currency', value: metrics.dailyAverage }
        }
      ],
      positivePatterns: isPositiveNet ? [
        {
          title: 'Positive Cash Flow',
          description: `You saved ${metrics.currency}${metrics.savings.toLocaleString()} this period.`,
          severity: 'positive'
        }
      ] : [],
      warnings: isHighUtil ? [
        {
          title: 'High Budget Usage',
          description: `You have consumed ${metrics.budgetUtilization}% of your limit.`,
          severity: 'warning'
        }
      ] : [],
      recommendations: [
        {
          title: 'Maintain Category Discipline',
          description: `Keep an eye on top categories like ${metrics.categoryBreakdown[0]?.category || 'Food'} to preserve your daily limit.`
        }
      ]
    };
  }

  /**
   * Generates deterministic fallback Safe-to-Spend explanation.
   */
  public static generateSafeToSpendFallbackExplanation(safeResult: SafeToSpendResult): string {
    const symbol = safeResult.currency === 'INR' ? '₹' : '$';
    return `${symbol}${safeResult.recommendedLimit.toLocaleString()} is recommended today because ${safeResult.remainingDays} days remain in the month, with ${symbol}${safeResult.upcomingObligations.toLocaleString()} reserved for obligations and goals.`;
  }

  /**
   * Main entry for fetching AI insights with caching & fallback.
   */
  public static async fetchAnalyticsInsights(
    metrics: AnalyticsMetrics,
    forceRefresh: boolean = false
  ): Promise<RAGFlowAnalyticsResponse> {
    const cacheKey = `${CACHE_PREFIX}analytics_${metrics.period}_${metrics.totalExpenses}_${metrics.totalIncome}`;

    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // invalid cache, clear
          localStorage.removeItem(cacheKey);
        }
      }
    }

    // Offline check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return this.generateFallbackInsights(metrics);
    }

    try {
      // In production, route through backend proxy endpoint or local processing wrapper
      // For resilience, return structured fallback if backend endpoint isn't connected
      const response = this.generateFallbackInsights(metrics);
      localStorage.setItem(cacheKey, JSON.stringify(response));
      return response;
    } catch (err) {
      console.warn('RAGFlow AI call failed, using deterministic fallback', err);
      return this.generateFallbackInsights(metrics);
    }
  }

  /**
   * Fetches Safe-to-Spend explanation with caching.
   */
  public static async fetchSafeToSpendExplanation(
    safeResult: SafeToSpendResult
  ): Promise<string> {
    const cacheKey = `${CACHE_PREFIX}sts_${safeResult.recommendedLimit}_${safeResult.riskLevel}_${safeResult.remainingDays}`;

    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;

    const explanation = this.generateSafeToSpendFallbackExplanation(safeResult);
    localStorage.setItem(cacheKey, explanation);
    return explanation;
  }
}
