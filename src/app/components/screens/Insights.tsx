import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "../GlassCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Award,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  PlusCircle,
  Trash2,
} from "lucide-react";
import {
  useBudgetStore,
  currencySymbols,
  Transaction,
} from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";

const categoryColors: Record<string, string> = {
  Income: "#22C55E",
  Expense: "#EF4444",
  Savings: "#F59E0B",
  Investments: "#6366F1",
  Bills: "#F97316",
  Shopping: "#EC4899",
  Transport: "#06B6D4",
  Food: "#8B5CF6",
  Utilities: "#06B6D4",
  Health: "#EC4899",
  Other: "#64748B",
};

// Custom Glassmorphic Tooltip for Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  currencySymbol: string;
  isLight: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  currencySymbol,
  isLight,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        className={`px-4 py-2.5 rounded-xl border backdrop-blur-xl shadow-lg transition-all duration-200 ${
          isLight
            ? "bg-white/90 border-slate-200 text-slate-900"
            : "bg-slate-900/90 border-slate-700 text-white"
        }`}
      >
        <p className="text-xs font-semibold opacity-70 mb-1">{label || data.name}</p>
        <p className="text-base font-black tracking-tight">
          {currencySymbol}
          {Number(data.value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function Insights() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const {
    transactions,
    dailyBudget,
    theme,
    colorMode,
    currency,
    addTransaction,
  } = useBudgetStore();

  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const isLight = !activeTheme.isDark;
  const currencySymbol = currencySymbols[currency];

  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  // Dynamic Data Calculation by Period
  let chartData: { name: string; amount: number }[] = [];
  let periodTitle = "";
  let periodSubtitle = "";
  let statLabel1 = "";
  let statValue1 = 0;
  let statLabel2 = "";
  let statValue2 = 0;

  if (period === "week") {
    periodTitle = "Weekly Spending Breakdown";
    periodSubtitle = "Daily spending across the week";
    statLabel1 = "Total Spent This Week";
    statLabel2 = "Daily Average";

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyMap: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    expenseTransactions.forEach((t) => {
      if (t.date) {
        const d = new Date(t.date);
        const dayName = daysOfWeek[(d.getDay() + 6) % 7];
        if (weeklyMap[dayName] !== undefined) {
          weeklyMap[dayName] += t.amount;
        }
      }
    });

    chartData = daysOfWeek.map((name) => ({
      name,
      amount: weeklyMap[name],
    }));

    statValue1 = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const activeDays = chartData.filter((d) => d.amount > 0).length || 1;
    statValue2 = Math.round(statValue1 / activeDays);
  } else if (period === "month") {
    // Monthly Insights - 4 Weeks breakdown
    periodTitle = "Monthly Spending by Week";
    periodSubtitle = "4-Week cashflow trajectory for this month";
    statLabel1 = "Total Spent This Month";
    statLabel2 = "Weekly Average";

    const weeklyBuckets = [
      { name: "Wk 1 (1-7)", amount: 0 },
      { name: "Wk 2 (8-14)", amount: 0 },
      { name: "Wk 3 (15-21)", amount: 0 },
      { name: "Wk 4 (22-31)", amount: 0 },
    ];

    expenseTransactions.forEach((t) => {
      if (t.date) {
        const dayOfMonth = new Date(t.date).getDate();
        if (dayOfMonth <= 7) {
          weeklyBuckets[0].amount += t.amount;
        } else if (dayOfMonth <= 14) {
          weeklyBuckets[1].amount += t.amount;
        } else if (dayOfMonth <= 21) {
          weeklyBuckets[2].amount += t.amount;
        } else {
          weeklyBuckets[3].amount += t.amount;
        }
      } else {
        // If no explicit date, attribute to current week bucket
        weeklyBuckets[0].amount += t.amount;
      }
    });

    chartData = weeklyBuckets;
    statValue1 = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    statValue2 = Math.round(statValue1 / 4);
  } else {
    // Annual Insights - 12 Months breakdown
    periodTitle = "Annual Spending by Month";
    periodSubtitle = "12-Month spending trajectory";
    statLabel1 = "Total Spent This Year";
    statLabel2 = "Monthly Average";

    const monthsOfYear = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const annualMap: Record<string, number> = {};
    monthsOfYear.forEach((m) => (annualMap[m] = 0));

    expenseTransactions.forEach((t) => {
      if (t.date) {
        const monthIndex = new Date(t.date).getMonth();
        const monthName = monthsOfYear[monthIndex];
        annualMap[monthName] += t.amount;
      }
    });

    chartData = monthsOfYear.map((name) => ({
      name,
      amount: annualMap[name],
    }));

    statValue1 = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    statValue2 = Math.round(statValue1 / 12);
  }

  // Dynamic Category Breakdown
  const categoryMap: Record<string, number> = {};
  expenseTransactions.forEach((t) => {
    const cat = t.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
  });

  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || "#16A34A",
    }))
    .sort((a, b) => b.value - a.value);

  const topCategory = categoryData.length > 0 ? categoryData[0] : null;

  // Monthly Budget Burn Rate Metrics
  const monthlyBudgetLimit = (dailyBudget || 2000) * 30;
  const budgetUsedPercent = Math.min(
    Math.round((statValue1 / monthlyBudgetLimit) * 100),
    100
  );
  const budgetStatusColor =
    budgetUsedPercent < 75
      ? "from-emerald-500 to-green-500"
      : budgetUsedPercent < 90
      ? "from-amber-500 to-orange-500"
      : "from-rose-500 to-red-500";

  // Helper to insert sample monthly transactions for instant preview
  const handleAddSampleMonthlyData = () => {
    const sampleExpenses = [
      {
        title: "Grocery Shopping",
        amount: 2400,
        category: "Food",
        type: "expense" as const,
        time: "10:30 AM",
      },
      {
        title: "Electricity & Wi-Fi",
        amount: 1850,
        category: "Bills",
        type: "expense" as const,
        time: "02:15 PM",
      },
      {
        title: "Weekend Dining",
        amount: 1200,
        category: "Food",
        type: "expense" as const,
        time: "08:45 PM",
      },
      {
        title: "Fuel & Metro",
        amount: 950,
        category: "Transport",
        type: "expense" as const,
        time: "05:00 PM",
      },
      {
        title: "Gadgets & Apparel",
        amount: 3500,
        category: "Shopping",
        type: "expense" as const,
        time: "06:30 PM",
      },
    ];

    sampleExpenses.forEach((tx) => addTransaction(tx));
  };

  return (
    <div className="min-h-screen px-6 pt-12 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`${textColor} text-3xl tracking-tighter mb-1 font-black`}
            >
              Insights
            </h1>
            <div className={`${subtextColor} tracking-tight`}>
              {periodSubtitle}
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </motion.div>

      {/* Period Selection Tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        {(["week", "month", "year"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`
              flex-1 py-2 rounded-xl tracking-tight font-bold text-xs transition-all duration-300 cursor-pointer
              ${
                period === p
                  ? "bg-gradient-to-r from-[#16A34A] via-[#2563EB] to-[#F59E0B] text-white shadow-md scale-[1.02]"
                  : isLight
                  ? "text-slate-600 hover:bg-slate-200/60"
                  : "text-white/60 hover:bg-white/5"
              }
            `}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={period}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          {/* SPECIAL MONTHLY INSIGHTS WIDGET (When 'month' is selected) */}
          {period === "month" && (
            <GlassCard className="mb-6 p-5" glow glowColor="blue">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span
                    className={`${subtextColor} tracking-tight font-semibold text-xs uppercase`}
                  >
                    Monthly Budget Progress
                  </span>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  {budgetUsedPercent < 75
                    ? "Healthy"
                    : budgetUsedPercent < 90
                    ? "Caution"
                    : "Over Budget"}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <div className={`${textColor} text-2xl font-black tracking-tight`}>
                  {currencySymbol}
                  {statValue1.toLocaleString()}{" "}
                  <span className={`${subtextColor} text-sm font-normal`}>
                    / {currencySymbol}
                    {monthlyBudgetLimit.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm font-extrabold text-emerald-400">
                  {budgetUsedPercent}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden mb-4">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${budgetStatusColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetUsedPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>

              {topCategory && (
                <div
                  className={`flex items-center justify-between pt-3 border-t ${
                    isLight ? "border-slate-200" : "border-white/10"
                  }`}
                >
                  <span className={`${subtextColor} text-xs tracking-tight`}>
                    Top spending category:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: topCategory.color }}
                    />
                    <span className={`${textColor} font-bold text-xs`}>
                      {topCategory.name}
                    </span>
                    <span className={`${subtextColor} text-xs`}>
                      ({currencySymbol}
                      {topCategory.value.toLocaleString()})
                    </span>
                  </div>
                </div>
              )}
            </GlassCard>
          )}

          {/* Main Analytics Bar Chart Card */}
          <GlassCard className="mb-6" glow glowColor="purple">
            <div className="flex items-center justify-between mb-4">
              <span className={`${subtextColor} font-bold text-sm`}>
                {periodTitle}
              </span>
              <BarChart3 className={`w-4 h-4 ${subtextColor}`} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div
                  className={`${subtextColor} mb-1 tracking-tight font-semibold text-xs`}
                >
                  {statLabel1}
                </div>
                <motion.div
                  className={`${textColor} text-3xl tracking-tighter font-black`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {currencySymbol}
                  {statValue1.toLocaleString()}
                </motion.div>
              </div>
              <div>
                <div
                  className={`${subtextColor} mb-1 tracking-tight font-semibold text-xs`}
                >
                  {statLabel2}
                </div>
                <motion.div
                  className={`${textColor} text-3xl tracking-tighter font-black`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {currencySymbol}
                  {statValue2.toLocaleString()}
                </motion.div>
              </div>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: isLight ? "#475569" : "rgba(255,255,255,0.6)",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  />
                  <YAxis hide />
                  <Tooltip
                    content={
                      <CustomTooltip
                        currencySymbol={currencySymbol}
                        isLight={isLight}
                      />
                    }
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={activeTheme.ringGradient[0]}
                      />
                      <stop
                        offset="100%"
                        stopColor={activeTheme.ringGradient[1]}
                      />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Category Pie Chart Card */}
          <GlassCard glow glowColor="blue">
            <div className="flex items-center justify-between mb-6">
              <span className={`${subtextColor} tracking-tight font-semibold`}>
                Spending by Category
              </span>
              <PieChartIcon className={`w-4 h-4 ${subtextColor}`} />
            </div>

            {categoryData.length === 0 ? (
              <div className="py-10 text-center">
                <div
                  className={`mb-3 ${subtextColor} text-sm tracking-tight`}
                >
                  No category spending recorded yet for this period.
                </div>
                <button
                  onClick={handleAddSampleMonthlyData}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold text-xs tracking-tight shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Load Sample Monthly Data
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={
                            <CustomTooltip
                              currencySymbol={currencySymbol}
                              isLight={isLight}
                            />
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div
                        className={`${subtextColor} text-xs tracking-tight font-semibold`}
                      >
                        Total
                      </div>
                      <div
                        className={`${textColor} text-2xl tracking-tighter font-black`}
                      >
                        {currencySymbol}
                        {statValue1.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {categoryData.map((category, index) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: category.color,
                            boxShadow: `0 0 10px ${category.color}`,
                          }}
                        />
                        <span
                          className={`${textColor} tracking-tight font-bold text-sm`}
                        >
                          {category.name}
                        </span>
                      </div>
                      <div
                        className={`${subtextColor} tracking-tight font-extrabold text-sm flex items-center gap-2`}
                      >
                        <span>
                          {currencySymbol}
                          {category.value.toLocaleString()}
                        </span>
                        <span className="text-xs opacity-60">
                          ({Math.round((category.value / (statValue1 || 1)) * 100)}
                          %)
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
