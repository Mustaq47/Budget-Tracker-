import { useMemo, useEffect, useRef } from "react";
import { useBudgetStore } from "../../store/useBudgetStore";
import { NotificationEngine } from "../../services/notificationEngine";

export function useDailyBudget() {
  const { dailyBudget, transactions, currency } = useBudgetStore();
  const _d = new Date();
  const todayLocal = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`;

  const metrics = useMemo(() => {
    // Compute today's allowance from monthly budget
    const daysInMonth = new Date(_d.getFullYear(), _d.getMonth() + 1, 0).getDate();
    const dailyAllowance = dailyBudget > 0 ? Math.round(dailyBudget / daysInMonth) : 0;

    const spentToday = transactions
      .filter((t) => t.type === "expense" && t.date === todayLocal)
      .reduce((sum, t) => sum + t.amount, 0);

    const remainingToday = Math.max(0, dailyAllowance - spentToday);
    const overspent = Math.max(0, spentToday - dailyAllowance);
    const percentage = dailyAllowance > 0 ? Math.min(100, Math.round((spentToday / dailyAllowance) * 100)) : 0;
    
    // Dynamic feedback generation
    let feedback = "✓ You're in control";
    let status: "good" | "warning" | "danger" = "good";

    if (percentage >= 100) {
      feedback = overspent > 0 ? `⚠️ You're over today's limit` : `Budget reached for today`;
      status = "danger";
    } else if (percentage >= 80) {
      feedback = `You've spent ${percentage}% of today's allowance. Consider slowing down.`;
      status = "warning";
    } else if (spentToday === 0) {
      feedback = `Ready to track your day!`;
      status = "good";
    } else {
      feedback = `You're under today's limit ✅`;
      status = "good";
    }

    return {
      dailyBudget: dailyAllowance,   // expose daily allowance as the budget for UI
      monthlyBudget: dailyBudget,    // original monthly total for reference
      spentToday,
      remainingToday,
      overspent,
      percentage,
      feedback,
      status,
      currency,
    };
  }, [dailyBudget, transactions, todayLocal, currency]);

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
