import { useMemo } from "react";
import { useBudgetStore } from "../../store/useBudgetStore";
import { parseLocalDate } from "../../utils/formatters";
import { useTranslation } from "../../utils/translations";

export function useSmartTrends() {
  const { transactions, currentStreak, bestStreak, currency } = useBudgetStore();
  const { t } = useTranslation();

  return useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const insights: string[] = [];

    // Weekend vs Weekday analysis
    let weekendTotal = 0;
    let weekdayTotal = 0;
    
    expenses.forEach(t => {
      const date = parseLocalDate(t.date);
      const day = date.getDay();
      if (day === 0 || day === 6) {
        weekendTotal += t.amount;
      } else {
        weekdayTotal += t.amount;
      }
    });

    if (weekendTotal > weekdayTotal * 0.4) {
      insights.push(t.spendMoreWeekend || "You tend to spend more on weekends. Consider planning ahead!");
    } else if (weekdayTotal > 0) {
      insights.push(t.weekendControlled || "Your weekend spending is well controlled.");
    }

    // Category changes (Top category)
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0) {
      const biggestText = t.biggestExpense || "Your biggest expense category is {category}.";
      insights.push(biggestText.replace("{category}", sortedCategories[0][0]));
    }

    return {
      insights,
      currentStreak,
      bestStreak,
      weekendTotal,
      weekdayTotal,
      topCategory: sortedCategories.length > 0 ? sortedCategories[0][0] : null
    };
  }, [transactions, currentStreak, bestStreak, t]);
}
