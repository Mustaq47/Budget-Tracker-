import { useState, useRef, useEffect, useMemo } from "react";
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
  X,
  Edit3,
  Calendar,
  ChevronRight,
} from "lucide-react";
import {
  useBudgetStore,
  currencySymbols,
  Transaction,
} from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { pageTitleClass, pageSubtitleClass } from "../../../utils/uiTokens";
import { categoryColors, monthsOfYear, getCategoryMeta } from "../../../utils/categoryConfig";
import { parseLocalDate } from "../../../utils/formatters";
import { InsightsWidget } from "./InsightsWidget";
import { calculateDineroTotal } from "../../../utils/dineroUtils";

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
    setDailyBudget,
    setActiveModal,
  } = useBudgetStore();

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudgetInput, setTempBudgetInput] = useState("");
  const budgetPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedWeekReport, setSelectedWeekReport] = useState<{
    name: string;
    rangeStart: number;
    rangeEnd: number;
  } | null>(null);
  const weekPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedMonthReport, setSelectedMonthReport] = useState<{
    name: string;
    monthIndex: number;
  } | null>(null);
  const monthPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showModalChart, setShowModalChart] = useState(false);

  useEffect(() => {
    if (selectedWeekReport || selectedMonthReport) {
      setShowModalChart(false);
      const timer = setTimeout(() => setShowModalChart(true), 250);
      return () => clearTimeout(timer);
    } else {
      setShowModalChart(false);
    }
  }, [selectedWeekReport, selectedMonthReport]);

  useEffect(() => {
    return () => {
      if (budgetPressTimerRef.current) clearTimeout(budgetPressTimerRef.current);
      if (weekPressTimerRef.current) clearTimeout(weekPressTimerRef.current);
      if (monthPressTimerRef.current) clearTimeout(monthPressTimerRef.current);
    };
  }, []);

  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const isLight = !activeTheme.isDark;
  const currencySymbol = currencySymbols[currency];

  const expenseTransactions = useMemo(
    () => transactions.filter((t) => t.type === "expense"),
    [transactions]
  );

  // Dynamic Data Calculation by Period
  const {
    chartData,
    periodTitle,
    periodSubtitle,
    statLabel1,
    statValue1,
    statLabel2,
    statValue2,
    periodExpenses,
  } = useMemo(() => {
    let chartData: { name: string; amount: number }[] = [];
    let periodTitle = "";
    let periodSubtitle = "";
    let statLabel1 = "";
    let statValue1 = 0;
    let statLabel2 = "";
    let statValue2 = 0;
    let periodExpenses: Transaction[] = [];

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

      const now = new Date();
      const currentDayIdx = (now.getDay() + 6) % 7; // Mon=0 .. Sun=6
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentDayIdx);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const thisWeekExpenses = expenseTransactions.filter((t) => {
        if (!t.date) return false;
        const d = parseLocalDate(t.date);
        return d >= startOfWeek && d <= endOfWeek;
      });
      const targetExpenses = thisWeekExpenses;

      targetExpenses.forEach((t) => {
        if (t.date) {
          const d = parseLocalDate(t.date);
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

      statValue1 = calculateDineroTotal(targetExpenses, currency);
      const activeDays = chartData.filter((d) => d.amount > 0).length || 1;
      statValue2 = Math.round(statValue1 / activeDays);
      periodExpenses = targetExpenses;
    } else if (period === "month") {
      // Monthly Insights - 4 Weeks breakdown
      const now = new Date();
      const monthName = now.toLocaleString("default", { month: "long" });
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      periodTitle = `${monthName} Spending by Week`;
      periodSubtitle = `4-Week cashflow trajectory for ${monthName} ${currentYear}`;
      statLabel1 = `Total Spent in ${monthName}`;
      statLabel2 = "Weekly Average";

      const weeklyBuckets = [
        { name: "Wk 1 (1-7)", amount: 0 },
        { name: "Wk 2 (8-14)", amount: 0 },
        { name: "Wk 3 (15-21)", amount: 0 },
        { name: "Wk 4 (22-31)", amount: 0 },
      ];

      const thisMonthExpenses = expenseTransactions.filter((t) => {
        if (!t.date) return false;
        const d = parseLocalDate(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const targetExpenses = thisMonthExpenses;

      targetExpenses.forEach((t) => {
        if (t.date) {
          const dayOfMonth = parseLocalDate(t.date).getDate();
          if (dayOfMonth <= 7) {
            weeklyBuckets[0].amount += t.amount;
          } else if (dayOfMonth <= 14) {
            weeklyBuckets[1].amount += t.amount;
          } else if (dayOfMonth <= 21) {
            weeklyBuckets[2].amount += t.amount;
          } else {
            weeklyBuckets[3].amount += t.amount;
          }
        }
      });

      chartData = [...weeklyBuckets];
      statValue1 = calculateDineroTotal(targetExpenses, currency);
      const activeWeeks = chartData.filter((d) => d.amount > 0).length || 1;
      statValue2 = Math.round(statValue1 / activeWeeks);
      periodExpenses = targetExpenses;
    } else {
      // Annual Insights - 12 Months breakdown
      const now = new Date();
      const currentYear = now.getFullYear();

      periodTitle = "Annual Spending by Month";
      periodSubtitle = `12-Month spending trajectory for ${currentYear}`;
      statLabel1 = "Total Spent This Year";
      statLabel2 = "Monthly Average";

      const annualMap: Record<string, number> = {};
      monthsOfYear.forEach((m) => (annualMap[m] = 0));

      const thisYearExpenses = expenseTransactions.filter((t) => {
        if (!t.date) return false;
        const d = parseLocalDate(t.date);
        return d.getFullYear() === currentYear;
      });
      const targetExpenses = thisYearExpenses;

      targetExpenses.forEach((t) => {
        if (t.date) {
          const d = parseLocalDate(t.date);
          const monthIndex = d.getMonth();
          const monthName = monthsOfYear[monthIndex];
          annualMap[monthName] += t.amount;
        }
      });

      chartData = monthsOfYear.map((name) => ({
        name,
        amount: annualMap[name],
      }));

      statValue1 = calculateDineroTotal(targetExpenses, currency);
      const activeMonths = chartData.filter((d) => d.amount > 0).length || 1;
      statValue2 = Math.round(statValue1 / activeMonths);
      periodExpenses = targetExpenses;
    }

    return {
      chartData,
      periodTitle,
      periodSubtitle,
      statLabel1,
      statValue1,
      statLabel2,
      statValue2,
      periodExpenses,
    };
  }, [period, expenseTransactions, currency]);

  // Dynamic Category Breakdown
  const { categoryData, topCategory } = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    periodExpenses.forEach((t) => {
      const cat = t.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
    });

    const categoryData = Object.entries(categoryMap)
      .map(([name, value]) => ({
        name,
        value,
        color: getCategoryMeta(name).color,
      }))
      .sort((a, b) => b.value - a.value);

    const topCategory = categoryData.length > 0 ? categoryData[0] : null;
    return { categoryData, topCategory };
  }, [periodExpenses]);

  // Monthly Budget Burn Rate Metrics
  const monthlyBudgetLimit = dailyBudget || 2000;
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

  const weekRanges: Record<string, { start: number; end: number }> = {
    "Wk 1 (1-7)": { start: 1, end: 7 },
    "Wk 2 (8-14)": { start: 8, end: 14 },
    "Wk 3 (15-21)": { start: 15, end: 21 },
    "Wk 4 (22-31)": { start: 22, end: 31 },
  };

  const monthsList = [
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

  const openWeekReportModal = (weekName: string) => {
    const range = weekRanges[weekName] || { start: 1, end: 7 };
    setSelectedWeekReport({
      name: weekName,
      rangeStart: range.start,
      rangeEnd: range.end,
    });
    setActiveModal("report");
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const openMonthReportModal = (monthName: string) => {
    const monthIndex = monthsList.indexOf(monthName);
    setSelectedMonthReport({
      name: monthName,
      monthIndex: monthIndex >= 0 ? monthIndex : 0,
    });
    setActiveModal("report");
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const startBudgetPress = () => {
    if (budgetPressTimerRef.current) clearTimeout(budgetPressTimerRef.current);
    budgetPressTimerRef.current = setTimeout(() => {
      setTempBudgetInput(monthlyBudgetLimit.toString());
      setIsEditingBudget(true);
      setActiveModal("budget");
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 400);
  };

  const clearBudgetPress = () => {
    if (budgetPressTimerRef.current) {
      clearTimeout(budgetPressTimerRef.current);
      budgetPressTimerRef.current = null;
    }
  };

  const renderCustomTick = (props: any) => {
    const { x, y, payload } = props;
    const isMonth = period === "month";
    const isYear = period === "year";
    const isInteractive = isMonth || isYear;

    const handlePointerDown = () => {
      if (!isInteractive) return;
      if (weekPressTimerRef.current) clearTimeout(weekPressTimerRef.current);
      weekPressTimerRef.current = setTimeout(() => {
        if (isMonth) openWeekReportModal(payload.value);
        if (isYear) openMonthReportModal(payload.value);
      }, 350);
    };

    const handlePointerUp = () => {
      if (weekPressTimerRef.current) {
        clearTimeout(weekPressTimerRef.current);
        weekPressTimerRef.current = null;
      }
    };

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill={isLight ? "#475569" : "rgba(255,255,255,0.6)"}
          fontSize={isYear ? 9.5 : 10.5}
          fontWeight={600}
          className={isInteractive ? "cursor-pointer select-none" : ""}
          onClick={() => {
            if (isMonth) openWeekReportModal(payload.value);
            if (isYear) openMonthReportModal(payload.value);
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen px-6 pt-12 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`${textColor} ${pageTitleClass}`}
            >
              Insights
            </h1>
            <div className={`${subtextColor} ${pageSubtitleClass}`}>
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
            <div
              className="select-none cursor-pointer"
              onClick={() => {
                setIsEditingBudget(true);
                setTempBudgetInput((dailyBudget || 2000).toString());
              }}
              title="Click or hold to edit monthly budget limit"
            >
              <GlassCard className="mb-6 p-5" glow glowColor="blue">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span
                        className={`${subtextColor} tracking-tight font-semibold text-xs uppercase block`}
                      >
                        {new Date().toLocaleString("default", { month: "long" })} Budget Progress
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      {budgetUsedPercent < 75
                        ? "Healthy"
                        : budgetUsedPercent < 90
                        ? "Caution"
                        : "Over Budget"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingBudget(true);
                        setTempBudgetInput((dailyBudget || 2000).toString());
                      }}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                      title="Edit monthly budget"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
            </div>
          )}

          {/* Main Analytics Bar Chart Card */}
          <GlassCard className="mb-6" glow glowColor="purple">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className={`${subtextColor} font-bold text-sm block`}>
                  {periodTitle}
                </span>
                {(period === "month" || period === "year") && (
                  <span className="text-[10px] text-blue-400 font-semibold block mt-0.5">
                    Hold label or bar for {period === "month" ? "daily" : "weekly"} report
                  </span>
                )}
              </div>
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
                <BarChart key={`main-chart-${period}-${statValue1}`} data={chartData}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={renderCustomTick}
                    interval={0}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{
                      fill: isLight
                        ? "rgba(0, 0, 0, 0.04)"
                        : "rgba(255, 255, 255, 0.05)",
                      radius: 8,
                    }}
                    content={
                      <CustomTooltip
                        currencySymbol={currencySymbol}
                        isLight={isLight}
                      />
                    }
                  />
                  <Bar
                    dataKey="amount"
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    onClick={(data: any) => {
                      if (period === "month" && data && data.name) {
                        openWeekReportModal(data.name);
                      } else if (period === "year" && data && data.name) {
                        openMonthReportModal(data.name);
                      }
                    }}
                  >
                    {chartData.map((entry, index) => {
                      const isInteractive = period === "month" || period === "year";
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill="url(#barGradient)"
                          className={isInteractive ? "cursor-pointer" : ""}
                          onClick={() => {
                            if (period === "month" && entry && entry.name) {
                              openWeekReportModal(entry.name);
                            } else if (period === "year" && entry && entry.name) {
                              openMonthReportModal(entry.name);
                            }
                          }}
                          onPointerDown={() => {
                            if (isInteractive && entry && entry.name) {
                              if (weekPressTimerRef.current) clearTimeout(weekPressTimerRef.current);
                              weekPressTimerRef.current = setTimeout(() => {
                                if (period === "month") openWeekReportModal(entry.name);
                                if (period === "year") openMonthReportModal(entry.name);
                              }, 350);
                            }
                          }}
                          onPointerUp={() => {
                            if (weekPressTimerRef.current) {
                              clearTimeout(weekPressTimerRef.current);
                              weekPressTimerRef.current = null;
                            }
                          }}
                          onPointerLeave={() => {
                            if (weekPressTimerRef.current) {
                              clearTimeout(weekPressTimerRef.current);
                              weekPressTimerRef.current = null;
                            }
                          }}
                        />
                      );
                    })}
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
          <GlassCard className="mb-6" glow glowColor="blue">
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
                      <PieChart key={`pie-chart-${period}-${categoryData.length}`}>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          strokeWidth={0}
                          isAnimationActive={true}
                          animationBegin={0}
                          animationDuration={1000}
                          animationEasing="ease-out"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          cursor={false}
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

          <InsightsWidget />
        </motion.div>
      </AnimatePresence>

      {/* UPDATE MONTHLY BUDGET MODAL */}
      <AnimatePresence>
        {isEditingBudget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl backdrop-blur-2xl ${
                isLight
                  ? "bg-white/95 border-slate-200 text-slate-900"
                  : "bg-slate-900/95 border-slate-800 text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-lg tracking-tight">
                    Update Monthly Budget
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsEditingBudget(false);
                    setActiveModal(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 opacity-70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className={`${subtextColor} text-xs mb-4`}>
                Enter your targeted spending limit for the entire month. We automatically adjust your daily limit.
              </p>

              <div className="mb-6">
                <label className={`${subtextColor} block text-xs font-bold mb-1.5`}>
                  Monthly Limit ({currencySymbol})
                </label>
                <input
                  type="number"
                  value={tempBudgetInput}
                  onChange={(e) => setTempBudgetInput(e.target.value)}
                  placeholder="e.g. 60000"
                  className={`w-full px-4 py-3 rounded-2xl border font-black text-xl outline-none transition-all ${
                    isLight
                      ? "bg-slate-100 border-slate-300 focus:border-emerald-500 text-slate-900"
                      : "bg-white/5 border-white/10 focus:border-emerald-500 text-white"
                  }`}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditingBudget(false);
                    setActiveModal(null);
                  }}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs tracking-tight ${
                    isLight
                      ? "bg-slate-200 text-slate-700"
                      : "bg-white/10 text-white/80"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const monthlyVal = Number(tempBudgetInput);
                    if (!isNaN(monthlyVal) && monthlyVal > 0) {
                      setDailyBudget(monthlyVal);
                      setIsEditingBudget(false);
                      setActiveModal(null);
                      if (typeof navigator !== "undefined" && navigator.vibrate) {
                        navigator.vibrate(30);
                      }
                    }
                  }}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-extrabold text-xs tracking-tight shadow-lg shadow-emerald-500/20"
                >
                  Save Budget
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WEEKLY REPORT MODAL (Day 1 - Day 7 of Selected Week) */}
      <AnimatePresence>
        {selectedWeekReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl p-6 border shadow-2xl backdrop-blur-2xl overflow-hidden ${
                isLight
                  ? "bg-white/95 border-slate-200 text-slate-900"
                  : "bg-slate-900/95 border-slate-800 text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg tracking-tight">
                      {selectedWeekReport.name} Report
                    </h3>
                    <p className={`${subtextColor} text-xs`}>
                      Days {selectedWeekReport.rangeStart} to {selectedWeekReport.rangeEnd} of the month
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedWeekReport(null);
                    setActiveModal(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 opacity-70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                {(() => {
                  const weekTransactions = expenseTransactions.filter((t) => {
                    if (!t.date) return selectedWeekReport.rangeStart === 1;
                    const dayOfMonth = parseLocalDate(t.date).getDate();
                    return (
                      dayOfMonth >= selectedWeekReport.rangeStart &&
                      dayOfMonth <= selectedWeekReport.rangeEnd
                    );
                  });

                  const totalSpentWeek = calculateDineroTotal(weekTransactions, currency);

                  // 7-day breakdown for this week
                  const daysSpan =
                    selectedWeekReport.rangeEnd - selectedWeekReport.rangeStart + 1;
                  const dailyBuckets = Array.from({ length: daysSpan }, (_, i) => ({
                    dayNum: selectedWeekReport.rangeStart + i,
                    label: `D${selectedWeekReport.rangeStart + i}`,
                    amount: 0,
                  }));

                  weekTransactions.forEach((t) => {
                    if (t.date) {
                      const dom = parseLocalDate(t.date).getDate();
                      const idx = dom - selectedWeekReport.rangeStart;
                      if (idx >= 0 && idx < dailyBuckets.length) {
                        dailyBuckets[idx].amount += t.amount;
                      }
                    } else if (dailyBuckets.length > 0) {
                      dailyBuckets[0].amount += t.amount;
                    }
                  });

                  return (
                    <>
                      {/* Summary Badges */}
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className={`p-3.5 rounded-2xl border ${
                            isLight
                              ? "bg-slate-50 border-slate-200"
                              : "bg-white/5 border-white/5"
                          }`}
                        >
                          <span className={`${subtextColor} text-[10px] block font-bold mb-0.5`}>
                            Week Total Spent
                          </span>
                          <span className="text-lg font-black tracking-tight text-emerald-400">
                            {currencySymbol}
                            {totalSpentWeek.toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={`p-3.5 rounded-2xl border ${
                            isLight
                              ? "bg-slate-50 border-slate-200"
                              : "bg-white/5 border-white/5"
                          }`}
                        >
                          <span className={`${subtextColor} text-[10px] block font-bold mb-0.5`}>
                            Transactions
                          </span>
                          <span className="text-lg font-black tracking-tight">
                            {weekTransactions.length}
                          </span>
                        </div>
                      </div>

                      {/* Daily Chart */}
                      <div
                        className={`p-4 rounded-2xl border ${
                          isLight
                            ? "bg-slate-50 border-slate-200"
                            : "bg-white/5 border-white/5"
                        }`}
                      >
                        <span className={`${subtextColor} text-xs font-semibold block mb-3`}>
                          Daily Trend (Days {selectedWeekReport.rangeStart}-{selectedWeekReport.rangeEnd})
                        </span>
                        <div className="h-32">
                          {showModalChart && (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart key={`week-modal-chart-${selectedWeekReport.name}`} data={dailyBuckets}>
                                <XAxis
                                  dataKey="label"
                                  axisLine={false}
                                  tickLine={false}
                                  interval={0}
                                  tick={{
                                    fill: isLight ? "#475569" : "rgba(255,255,255,0.6)",
                                    fontSize: 10,
                                    fontWeight: 600,
                                  }}
                                />
                                <Tooltip
                                  cursor={{
                                    fill: isLight
                                      ? "rgba(0, 0, 0, 0.04)"
                                      : "rgba(255, 255, 255, 0.05)",
                                    radius: 6,
                                  }}
                                  content={
                                    <CustomTooltip
                                      currencySymbol={currencySymbol}
                                      isLight={isLight}
                                    />
                                  }
                                />
                                <Bar
                                  dataKey="amount"
                                  radius={[6, 6, 0, 0]}
                                  isAnimationActive={true}
                                  animationBegin={0}
                                  animationDuration={1000}
                                  animationEasing="ease-out"
                                >
                                  {dailyBuckets.map((_, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill="url(#barGradient)"
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>

                      {/* Transaction List */}
                      <div>
                        <span className={`${subtextColor} text-xs font-semibold block mb-2`}>
                          Week Transactions
                        </span>
                        {weekTransactions.length === 0 ? (
                          <div className="py-6 text-center text-xs opacity-60">
                            No transactions recorded for this week.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {weekTransactions.map((tx) => (
                              <div
                                key={tx.id}
                                className={`p-3 rounded-xl border flex items-center justify-between ${
                                  isLight
                                    ? "bg-slate-50 border-slate-200"
                                    : "bg-white/5 border-white/5"
                                }`}
                              >
                                <div>
                                  <div className="font-bold text-xs">
                                    {tx.title}
                                  </div>
                                  <div className="text-[10px] opacity-60">
                                    {tx.category || "Other"} • {tx.date || "N/A"}
                                  </div>
                                </div>
                                <div className="font-extrabold text-xs text-rose-400">
                                  -{currencySymbol}
                                  {tx.amount.toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedWeekReport(null);
                    setActiveModal(null);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#16A34A] to-[#2563EB] text-white font-bold text-xs shadow-lg"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Month Report Modal (for Annual Spending by Month) */}
      <AnimatePresence>
        {selectedMonthReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl p-6 border shadow-2xl backdrop-blur-2xl overflow-hidden ${
                isLight
                  ? "bg-white/95 border-slate-200 text-slate-900"
                  : "bg-slate-900/95 border-slate-800 text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg tracking-tight">
                      {selectedMonthReport.name} Report
                    </h3>
                    <p className={`${subtextColor} text-xs`}>
                      4-Week cashflow breakdown & transaction list
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedMonthReport(null);
                    setActiveModal(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 opacity-70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                {(() => {
                  const monthTransactions = expenseTransactions.filter((t) => {
                    if (!t.date) return false;
                    const d = parseLocalDate(t.date);
                    return d.getMonth() === selectedMonthReport.monthIndex && d.getFullYear() === new Date().getFullYear();
                  });

                  const totalSpentMonth = calculateDineroTotal(monthTransactions, currency);

                  // 4-Week breakdown for this month
                  const weeklyBuckets = [
                    { label: "Wk 1", amount: 0 },
                    { label: "Wk 2", amount: 0 },
                    { label: "Wk 3", amount: 0 },
                    { label: "Wk 4", amount: 0 },
                  ];

                  monthTransactions.forEach((t) => {
                    if (t.date) {
                      const dayOfMonth = parseLocalDate(t.date).getDate();
                      if (dayOfMonth <= 7) weeklyBuckets[0].amount += t.amount;
                      else if (dayOfMonth <= 14) weeklyBuckets[1].amount += t.amount;
                      else if (dayOfMonth <= 21) weeklyBuckets[2].amount += t.amount;
                      else weeklyBuckets[3].amount += t.amount;
                    } else {
                      weeklyBuckets[0].amount += t.amount;
                    }
                  });

                  return (
                    <>
                      {/* Summary Badges */}
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className={`p-3.5 rounded-2xl border ${
                            isLight
                              ? "bg-slate-50 border-slate-200"
                              : "bg-white/5 border-white/5"
                          }`}
                        >
                          <span className={`${subtextColor} text-[10px] block font-bold mb-0.5`}>
                            {selectedMonthReport.name} Total Spent
                          </span>
                          <span className="text-lg font-black tracking-tight text-emerald-400">
                            {currencySymbol}
                            {totalSpentMonth.toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={`p-3.5 rounded-2xl border ${
                            isLight
                              ? "bg-slate-50 border-slate-200"
                              : "bg-white/5 border-white/5"
                          }`}
                        >
                          <span className={`${subtextColor} text-[10px] block font-bold mb-0.5`}>
                            Transactions
                          </span>
                          <span className="text-lg font-black tracking-tight">
                            {monthTransactions.length}
                          </span>
                        </div>
                      </div>

                      {/* 4-Week Chart */}
                      <div
                        className={`p-4 rounded-2xl border ${
                          isLight
                            ? "bg-slate-50 border-slate-200"
                            : "bg-white/5 border-white/5"
                        }`}
                      >
                        <span className={`${subtextColor} text-xs font-semibold block mb-3`}>
                          Weekly Breakdown (Wk 1 to Wk 4)
                        </span>
                        <div className="h-32">
                          {showModalChart && (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart key={`month-modal-chart-${selectedMonthReport.name}`} data={weeklyBuckets}>
                                <XAxis
                                  dataKey="label"
                                  axisLine={false}
                                  tickLine={false}
                                  interval={0}
                                  tick={{
                                    fill: isLight ? "#475569" : "rgba(255,255,255,0.6)",
                                    fontSize: 10,
                                    fontWeight: 600,
                                  }}
                                />
                                <Tooltip
                                  cursor={{
                                    fill: isLight
                                      ? "rgba(0, 0, 0, 0.04)"
                                      : "rgba(255, 255, 255, 0.05)",
                                    radius: 6,
                                  }}
                                  content={
                                    <CustomTooltip
                                      currencySymbol={currencySymbol}
                                      isLight={isLight}
                                    />
                                  }
                                />
                                <Bar
                                  dataKey="amount"
                                  radius={[6, 6, 0, 0]}
                                  isAnimationActive={true}
                                  animationBegin={0}
                                  animationDuration={1000}
                                  animationEasing="ease-out"
                                >
                                  {weeklyBuckets.map((_, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill="url(#barGradient)"
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>


                    </>
                  );
                })()}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedMonthReport(null);
                    setActiveModal(null);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold text-xs shadow-lg"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
