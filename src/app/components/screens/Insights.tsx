import { motion } from "motion/react";
import { GlassCard } from "../GlassCard";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { useState } from "react";

const weeklyData = [
  { day: "Mon", amount: 1200 },
  { day: "Tue", amount: 890 },
  { day: "Wed", amount: 1450 },
  { day: "Thu", amount: 2100 },
  { day: "Fri", amount: 1680 },
  { day: "Sat", amount: 3200 },
  { day: "Sun", amount: 980 },
];

const categoryData = [
  { name: "Food", value: 4500, color: "#7B61FF" },
  { name: "Transport", value: 1200, color: "#00E5FF" },
  { name: "Shopping", value: 3800, color: "#FF4D8D" },
  { name: "Bills", value: 2200, color: "#FFD166" },
];

export function Insights() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");

  const totalSpent = weeklyData.reduce((sum, item) => sum + item.amount, 0);
  const avgPerDay = Math.round(totalSpent / weeklyData.length);

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
              ${period === p
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
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill="url(#barGradient)"
                  />
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
                ₹{categoryData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
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
                  style={{ backgroundColor: category.color, boxShadow: `0 0 10px ${category.color}` }}
                />
                <span className="text-white tracking-tight">{category.name}</span>
              </div>
              <div className="text-white/60 tracking-tight">₹{category.value.toLocaleString()}</div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
