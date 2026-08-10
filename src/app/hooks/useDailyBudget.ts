import { useMemo, useEffect, useRef } from "react";
import { useBudgetStore } from "../../store/useBudgetStore";
import { NotificationEngine } from "../../services/notificationEngine";

export function useDailyBudget() {
  const { dailyBudget, transactions, currency } = useBudgetStore();
  const todayISO = new Date().toISOString().split("T")[0];

  const metrics = useMemo(() => {
    const spentToday = transactions
      .filter((t) => t.type === "expense" && t.date === todayISO)
      .reduce((sum, t) => sum + t.amount, 0);

    const remainingToday = Math.max(0, dailyBudget - spentToday);
    const overspent = Math.max(0, spentToday - dailyBudget);
    const percentage = dailyBudget > 0 ? Math.min(100, Math.round((spentToday / dailyBudget) * 100)) : 0;
    
    // Dynamic feedback generation
    let feedback = "? You're in control";
    let status: "good" | "warning" | "danger" = "good";

    if (percentage >= 100) {
      feedback = overspent > 0 ? `?? You're over today's limit` : `Budget reached for today`;
      status = "danger";
    } else if (percentage >= 80) {
      feedback = `You've spent ${percentage}% of today's allowance. Consider slowing down.`;
      status = "warning";
    } else if (spentToday === 0) {
      feedback = `Ready to track your day!`;
      status = "good";
    } else {
      // Show exact amount under limit, as requested
      feedback = `You're under today's limit ??`;
      status = "good";
    }

    return {
      dailyBudget,
      spentToday,
      remainingToday,
      overspent,
      percentage,
      feedback,
      status,
      currency,
    };
  }, [dailyBudget, transactions, todayISO, currency]);

  const prevSpent = useRef(metrics.spentToday);

  useEffect(() => {
    if (metrics.spentToday > prevSpent.current) {
      if (metrics.percentage >= 80) {
        NotificationEngine.scheduleBudgetAlert(metrics.percentage, metrics.spentToday, metrics.currency);
      }
    }
    prevSpent.current = metrics.spentToday;
  }, [metrics.spentToday, metrics.percentage, metrics.currency]);

  return metrics;
}
