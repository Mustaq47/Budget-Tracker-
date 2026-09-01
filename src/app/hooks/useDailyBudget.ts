import { useMemo, useEffect, useRef } from "react";
import { useBudgetStore } from "../../store/useBudgetStore";
import { useTripsStore } from "../../store/useTripsStore";
import { useGoalsStore } from "../../store/useGoalsStore";
import { useTranslation } from "../../utils/translations";
import { NotificationEngine } from "../../services/notificationEngine";
import { calculateSmartSpendingPlan } from "../../services/smartSpendingEngine";

export function useDailyBudget() {
  const {
    dailyBudget,
    transactions,
    currency,
    budgetViewMode,
    rolloverPolicy,
    emergencyBufferPercent
  } = useBudgetStore();
  const { trips } = useTripsStore();
  const { goals } = useGoalsStore();
  const { t } = useTranslation();
  const _d = new Date();

  const metrics = useMemo(() => {
    const plan = calculateSmartSpendingPlan({
      monthlyBudget: dailyBudget,
      transactions,
      goals,
      trips,
      currentDate: _d,
      settings: {
        rolloverPolicy: rolloverPolicy || 'distribute',
        emergencyBufferPercent: emergencyBufferPercent || 10
      },
      currency
    });

    const isMonthly = budgetViewMode === 'monthly';

    // Daily allowance is base daily allowance + rollover/overspend/behavioral adjustments
    const dailyAllowance = Math.max(
      0,
      plan.baseDailyAllowance +
        plan.rolloverAdjustment +
        plan.overspendingAdjustment +
        plan.behaviorAdjustment
    );

    const allowanceVal = isMonthly ? plan.totalBudget : dailyAllowance;
    const spent = isMonthly ? plan.actualSpent : plan.spentToday;
    const remaining = isMonthly ? plan.remainingBudget : plan.safeToSpendToday;
    const overspent = isMonthly ? Math.max(0, plan.actualSpent - plan.totalBudget) : Math.max(0, plan.spentToday - dailyAllowance);
    const percentage = isMonthly 
      ? (plan.totalBudget > 0 ? Math.min(100, Math.round((plan.actualSpent / plan.totalBudget) * 100)) : 0)
      : (dailyAllowance > 0 ? Math.min(100, Math.round((plan.spentToday / dailyAllowance) * 100)) : 0);

    // Dynamic feedback generation for Daily
    let feedbackToday = t.inControl || "✓ You're in control";
    let statusToday: "good" | "warning" | "danger" = "good";

    const percentageToday = dailyAllowance > 0 ? Math.min(100, Math.round((plan.spentToday / dailyAllowance) * 100)) : 0;
    const overspentToday = Math.max(0, plan.spentToday - dailyAllowance);

    if (percentageToday >= 100) {
      feedbackToday = overspentToday > 0 
        ? (t.overTodayLimit || "⚠️ You're over today's limit") 
        : (t.budgetReachedToday || "Budget reached for today");
      statusToday = "danger";
    } else if (percentageToday >= 80) {
      feedbackToday = `Spent ${percentageToday}% of today's limit`;
      statusToday = "warning";
    } else if (plan.spentToday === 0) {
      feedbackToday = t.readyToTrackDay || "Ready to track your day!";
      statusToday = "good";
    } else {
      feedbackToday = t.underTodayLimit || "You're under today's limit ✅";
      statusToday = "good";
    }

    // Dynamic feedback generation for Monthly
    let feedbackMonth = t.inControl || "✓ You're in control";
    let statusMonth: "good" | "warning" | "danger" = "good";
    const percentageMonth = plan.totalBudget > 0 ? Math.min(100, Math.round((plan.actualSpent / plan.totalBudget) * 100)) : 0;
    const overspentMonth = Math.max(0, plan.actualSpent - plan.totalBudget);

    if (percentageMonth >= 100) {
      feedbackMonth = overspentMonth > 0 
        ? (t.overMonthLimit || "⚠️ You're over this month's limit") 
        : (t.budgetReachedMonth || "Budget reached for this month");
      statusMonth = "danger";
    } else if (percentageMonth >= 80) {
      feedbackMonth = `Spent ${percentageMonth}% of month limit`;
      statusMonth = "warning";
    } else if (plan.actualSpent === 0) {
      feedbackMonth = t.readyToTrackMonth || "Ready to track your month!";
      statusMonth = "good";
    } else {
      feedbackMonth = t.underMonthLimit || "You're under this month's limit ✅";
      statusMonth = "good";
    }

    const feedback = isMonthly ? feedbackMonth : feedbackToday;
    const status = isMonthly ? statusMonth : statusToday;
    const label = isMonthly 
      ? (t.remainingThisMonth || "Remaining this Month") 
      : (t.safeToSpendToday || "Safe to Spend Today");

    return {
      dailyAllowance,
      monthlyLimit: plan.totalBudget,
      spentToday: plan.spentToday,
      remainingToday: plan.safeToSpendToday,
      overspentToday,
      percentageToday,
      spentThisMonth: plan.actualSpent,
      remainingThisMonth: plan.remainingBudget,
      overspentMonth,
      percentageMonth,

      // Active mode metrics (for UI)
      allowance: allowanceVal,
      spent,
      remaining,
      overspent,
      percentage,
      feedback,
      status,
      label,
      currency,
      isMonthlyMode: isMonthly,

      // Export new V2 engine metrics for safe disclosure
      futureCommitments: plan.futureCommitments,
      savingsCommitment: plan.savingsCommitment,
      emergencyBuffer: plan.emergencyBuffer,
      spendableAmount: plan.spendableAmount,
      rolloverAdjustment: plan.rolloverAdjustment,
      overspendingAdjustment: plan.overspendingAdjustment,
      behaviorAdjustment: plan.behaviorAdjustment,
      projectedMonthEnd: plan.projectedMonthEnd,
      projectedRemaining: plan.projectedRemaining,
      explanation: plan.explanation,
      confidence: plan.confidence,
      remainingDays: plan.remainingDays,
    };
  }, [
    dailyBudget,
    transactions,
    currency,
    budgetViewMode,
    rolloverPolicy,
    emergencyBufferPercent,
    trips,
    goals
  ]);

  const prevSpent = useRef(metrics.spentToday);

  useEffect(() => {
    if (metrics.spentToday > prevSpent.current) {
      if (metrics.percentageToday >= 80) {
        NotificationEngine.scheduleBudgetAlert(metrics.percentageToday, metrics.spentToday, metrics.currency);
      }
    }
    prevSpent.current = metrics.spentToday;
  }, [metrics.spentToday, metrics.percentageToday, metrics.currency]);

  return metrics;
}
