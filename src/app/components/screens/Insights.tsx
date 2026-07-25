import { motion } from "motion/react";
import { GlassCard } from "../GlassCard";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { useState } from "react";
import { useBudgetStore } from "../../../store/useBudgetStore";

const categoryColors: Record<string, string> = {
  Food: "#7B61FF",
  Shopping: "#FF4D8D",
  Transport: "#00E5FF",
  Bills: "#FFD166",
  Utilities: "#A061FF",
  Health: "#4DFFB4",
  Other: "#FF944D",
};

export function Insights() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const { transactions } = useBudgetStore();

  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  // Dynamic Weekly Data
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyDataMap: Record<string, number> = {
    Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
  };

  expenseTransactions.forEach((t) => {
    if (t.date) {
      const d = new Date(t.date);
      const dayName = daysOfWeek[(d.getDay() + 6) % 7]; // Convert Sunday=0 to Mon=0 indexing
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
    color: categoryColors[name] || "#7B61FF",
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
        <h1 className="text-white text-3xl tracking-tighter mb-2">Insights</h1>
        <div className="text-white/60 tracking-tight">Your spending analytics</div>
      </motion.div>

      <div className="flex gap-2 mb-6">
        {(["week", "month", "year"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`
              px-6 py-2 rounded-full tracking-tight transition-all duration-300
              ${
                period === p
                  ? "bg-gradient-to-r from-[#7B61FF] to-[#FF4D8D] text-white shadow-[0_0_20px_rgba(123,97,255,0.5)]"
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
            <div className="text-white/60 mb-1 tracking-tight">Total Spent</div>
            <motion.div
              className="text-white text-3xl tracking-tighter"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              ₹{totalSpent.toLocaleString()}
            </motion.div>
          </div>
          <div>
            <div className="text-white/60 mb-1 tracking-tight">Daily Average</div>
            <motion.div
              className="text-white text-3xl tracking-tighter"
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
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              />
              <YAxis hide />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {weeklyData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                ))}
              </Bar>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7B61FF" />
                  <stop offset="100%" stopColor="#FF4D8D" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard glow glowColor="blue">
        <div className="text-white/60 mb-6 tracking-tight">Spending by Category</div>

        {categoryData.length === 0 ? (
          <div className="py-12 text-center text-white/40 text-sm tracking-tight">
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
                  <div className="text-white/60 text-xs tracking-tight">Total</div>
                  <div className="text-white text-2xl tracking-tighter">
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
                    <span className="text-white tracking-tight">{category.name}</span>
                  </div>
                  <div className="text-white/60 tracking-tight">
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
