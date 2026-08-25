import { useMemo, useEffect, useRef } from "react";
import { useBudgetStore } from "../../store/useBudgetStore";
import { NotificationEngine } from "../../services/notificationEngine";
import { dinero, allocate, toDecimal } from 'dinero.js';
import * as currencies from 'dinero.js/currencies';

const getCurrencyObj = (cCode: string) => {
  return (currencies as any)[cCode] || (currencies as any).USD;
};

const toSubunits = (amount: number, currencyObj: any) => {
  const factor = currencyObj.base ** currencyObj.exponent;
  return Math.round(amount * factor);
};

export function useDailyBudget() {
  const { dailyBudget, transactions, currency, budgetViewMode } = useBudgetStore();
  const _d = new Date();
  const todayLocal = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`;

  const metrics = useMemo(() => {
    const cObj = getCurrencyObj(currency);
    const monthlyAmountSubunits = toSubunits(dailyBudget, cObj);
    const monthlyDinero = dinero({ amount: monthlyAmountSubunits, currency: cObj });

    // Compute today's allowance using Dinero allocate
    const daysInMonth = new Date(_d.getFullYear(), _d.getMonth() + 1, 0).getDate();
    
    // allocate returns an array of Dinero objects split by the ratios provided
    const allocations = allocate(monthlyDinero, Array(daysInMonth).fill(1));
    const dailyDinero = allocations[0]; // Safely allocated daily limit
    const dailyAllowance = Number(toDecimal(dailyDinero)); 

    // Calculate spent today safely using integer subunits, excluding trips and goals
    const spentTodaySubunits = transactions
      .filter((t) => t.type === "expense" && t.date === todayLocal && !t.tripId && t.category !== "Goal Contribution")
      .reduce((sum, t) => sum + toSubunits(t.amount, cObj), 0);
    const spentDinero = dinero({ amount: spentTodaySubunits, currency: cObj });
    const spentToday = Number(toDecimal(spentDinero));

    const remainingToday = Math.max(0, dailyAllowance - spentToday);
    const overspentToday = Math.max(0, spentToday - dailyAllowance);
    const percentageToday = dailyAllowance > 0 ? Math.min(100, Math.round((spentToday / dailyAllowance) * 100)) : 0;
    
    // Calculate spent this month safely
    const currentMonthPrefix = todayLocal.substring(0, 7);
    const spentThisMonthSubunits = transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(currentMonthPrefix) && !t.tripId && t.category !== "Goal Contribution")
      .reduce((sum, t) => sum + toSubunits(t.amount, cObj), 0);
    const spentThisMonth = Number(toDecimal(dinero({ amount: spentThisMonthSubunits, currency: cObj })));

    const remainingThisMonth = Math.max(0, dailyBudget - spentThisMonth);
    const overspentMonth = Math.max(0, spentThisMonth - dailyBudget);
    const percentageMonth = dailyBudget > 0 ? Math.min(100, Math.round((spentThisMonth / dailyBudget) * 100)) : 0;

    // Dynamic feedback generation for Daily
    let feedbackToday = "✓ You're in control";
    let statusToday: "good" | "warning" | "danger" = "good";

    if (percentageToday >= 100) {
      feedbackToday = overspentToday > 0 ? `⚠️ You're over today's limit` : `Budget reached for today`;
      statusToday = "danger";
    } else if (percentageToday >= 80) {
      feedbackToday = `You've spent ${percentageToday}% of today's allowance. Consider slowing down.`;
      statusToday = "warning";
    } else if (spentToday === 0) {
      feedbackToday = `Ready to track your day!`;
      statusToday = "good";
    } else {
      feedbackToday = `You're under today's limit ✅`;
      statusToday = "good";
    }

    // Dynamic feedback generation for Monthly
    let feedbackMonth = "✓ You're in control";
    let statusMonth: "good" | "warning" | "danger" = "good";

    if (percentageMonth >= 100) {
      feedbackMonth = overspentMonth > 0 ? `⚠️ You're over this month's limit` : `Budget reached for this month`;
      statusMonth = "danger";
    } else if (percentageMonth >= 80) {
      feedbackMonth = `You've spent ${percentageMonth}% of this month's allowance. Slow down.`;
      statusMonth = "warning";
    } else if (spentThisMonth === 0) {
      feedbackMonth = `Ready to track your month!`;
      statusMonth = "good";
    } else {
      feedbackMonth = `You're under this month's limit ✅`;
      statusMonth = "good";
    }

    const isMonthly = budgetViewMode === 'monthly';
    const allowance = isMonthly ? dailyBudget : dailyAllowance;
    const spent = isMonthly ? spentThisMonth : spentToday;
    const remaining = isMonthly ? remainingThisMonth : remainingToday;
    const overspent = isMonthly ? overspentMonth : overspentToday;
    const percentage = isMonthly ? percentageMonth : percentageToday;
    const feedback = isMonthly ? feedbackMonth : feedbackToday;
    const status = isMonthly ? statusMonth : statusToday;
    const label = isMonthly ? "Remaining this Month" : "Safe to Spend Today";

    return {
      dailyAllowance,   
      monthlyLimit: dailyBudget,    
      spentToday,
      remainingToday,
      overspentToday,
      percentageToday,
      spentThisMonth,
      remainingThisMonth,
      overspentMonth,
      percentageMonth,
      
      // Active mode metrics
      allowance,
      spent,
      remaining,
      overspent,
      percentage,
      feedback,
      status,
      label,
      currency,
      isMonthlyMode: isMonthly,
    };
  }, [dailyBudget, transactions, todayLocal, currency, budgetViewMode]);

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
