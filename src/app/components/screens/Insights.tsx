import { motion } from "motion/react";
import { GlassCard } from "../GlassCard";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { useState } from "react";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { themeMap } from "../../../utils/themePresets";

const categoryColors: Record<string, string> = {
  Food: "#16A34A",
  Shopping: "#3B82F6",
  Transport: "#F59E0B",
  Bills: "#8B5CF6",
  Utilities: "#06B6D4",
  Health: "#EC4899",
  Other: "#64748B",
};

export function Insights() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const { transactions, theme, colorMode } = useBudgetStore();

  const activeTheme = themeMap[theme] || themeMap["cyber-neon"];
  const isLight = colorMode === 'light' || !activeTheme.isDark;

  const textColor = isLight ? "text-slate-900" : activeTheme.textColor;
  const subtextColor = isLight ? "text-slate-600" : activeTheme.subtextColor;

  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  // Dynamic Weekly Data
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyDataMap: Record<string, number> = {
    Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
  };

  expenseTransactions.forEach((t) => {
    if (t.date) {
      const d = new Date(t.date);
      const dayName = daysOfWeek[(d.getDay() + 6) % 7];
      if (weeklyDataMap[dayName] !== undefined) {
        weeklyDataMap[dayName] += t.amount;
      }
    }
  });

  const weeklyData = daysOfWeek.map((day) => ({
    day,
    amount: weeklyDataMap[day],
  }));

  // Dynamic Category Data
  const categoryMap: Record<string, number> = {};
  expenseTransactions.forEach((t) => {
    const cat = t.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
  });

  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || "#16A34A",
  }));

  const totalSpent = expenseTransactions.reduce((sum, item) => sum + item.amount, 0);
  const activeDays = weeklyData.filter((d) => d.amount > 0).length || 1;
  const avgPerDay = Math.round(totalSpent / activeDays);

  return (
    <div className="min-h-screen px-6 pt-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={`${textColor} text-3xl tracking-tighter mb-2 font-black`}>Insights</h1>
        <div className={`${subtextColor} tracking-tight`}>Your spending analytics</div>
      </motion.div>

      <div className="flex gap-2 mb-6">
        {(["week", "month", "year"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`
              px-6 py-2 rounded-full tracking-tight font-bold text-xs transition-all duration-300 cursor-pointer
              ${
                period === p
                  ? "bg-gradient-to-r from-[#16A34A] to-[#3B82F6] text-white shadow-md"
                  : isLight
                  ? "bg-slate-200/80 text-slate-700 hover:bg-slate-300 border border-slate-300"
                  : "bg-white/5 text-white/60 border border-white/10 backdrop-blur-xl"
              }
            `}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <GlassCard className="mb-6" glow glowColor="purple">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className={`${subtextColor} mb-1 tracking-tight font-semibold text-xs`}>Total Spent</div>
            <motion.div
              className={`${textColor} text-3xl tracking-tighter font-black`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              ₹{totalSpent.toLocaleString()}
            </motion.div>
          </div>
          <div>
            <div className={`${subtextColor} mb-1 tracking-tight font-semibold text-xs`}>Daily Average</div>
            <motion.div
              className={`${textColor} text-3xl tracking-tighter font-black`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              ₹{avgPerDay.toLocaleString()}
            </motion.div>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isLight ? "#475569" : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600 }}
              />
              <YAxis hide />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {weeklyData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                ))}
              </Bar>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeTheme.ringGradient[0]} />
                  <stop offset="100%" stopColor={activeTheme.ringGradient[1]} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard glow glowColor="blue">
        <div className={`${subtextColor} mb-6 tracking-tight font-semibold`}>Spending by Category</div>

        {categoryData.length === 0 ? (
          <div className={`py-12 text-center ${subtextColor} text-sm tracking-tight`}>
            No category spending recorded yet.
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
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`${subtextColor} text-xs tracking-tight font-semibold`}>Total</div>
                  <div className={`${textColor} text-2xl tracking-tighter font-black`}>
                    ₹{totalSpent.toLocaleString()}
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
                  transition={{ delay: index * 0.1 }}
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
                    <span className={`${textColor} tracking-tight font-bold text-sm`}>{category.name}</span>
                  </div>
                  <div className={`${subtextColor} tracking-tight font-extrabold text-sm`}>
                    ₹{category.value.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}
