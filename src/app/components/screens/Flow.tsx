import { motion } from "motion/react";
import { GlassIcon } from "../GlassIcon";
import { ShoppingBag, Coffee, Car, Home, Heart, Zap, DollarSign, LucideIcon } from "lucide-react";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";

const iconMap: Record<string, { icon: LucideIcon; glow: "purple" | "blue" | "pink" | "gold" }> = {
  Shopping: { icon: ShoppingBag, glow: "pink" },
  Food: { icon: Coffee, glow: "blue" },
  Transport: { icon: Car, glow: "gold" },
  Bills: { icon: Home, glow: "purple" },
  Utilities: { icon: Zap, glow: "blue" },
  Health: { icon: Heart, glow: "pink" },
  Other: { icon: DollarSign, glow: "purple" },
};

export function Flow() {
  const { transactions, theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);

  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const isLight = !activeTheme.isDark;

  const todayISO = new Date().toISOString().split("T")[0];
  const todayTransactions = transactions.filter((t) => t.date === todayISO);
  const flowItems = todayTransactions.length > 0 ? todayTransactions : transactions;

  const totalSpent = flowItems
    .filter((t) => t.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen px-6 pt-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={`${textColor} text-3xl tracking-tighter mb-2 font-black`}>Flow</h1>
        <div className={`${subtextColor} tracking-tight`}>Your spending timeline</div>
      </motion.div>

      {flowItems.length === 0 ? (
        <div className={`text-center py-20 border rounded-3xl p-8 backdrop-blur-xl ${
          isLight ? "bg-white/90 border-slate-200 shadow-md" : "bg-white/5 border-white/10"
        }`}>
          <div className={`${textColor} text-lg mb-2 font-bold`}>No timeline activity yet</div>
          <div className={`${subtextColor} text-xs`}>
            Tap the <span className="text-[#16A34A] font-bold">+</span> button below to record an expense!
          </div>
        </div>
      ) : (
        <div className="relative pb-8">
          <div className="absolute left-[27px] top-0 bottom-0 w-[2px]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#16A34A] via-[#3B82F6] to-[#06B6D4] opacity-20" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-[#16A34A] via-[#3B82F6] to-[#06B6D4]"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ transformOrigin: "top" }}
            />
          </div>

          <div className="space-y-6">
            {flowItems.map((item, index) => {
              const meta = iconMap[item.category] || { icon: DollarSign, glow: "purple" };
              const IconComp = meta.icon;

              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start gap-4"
                  style={{
                    transform: `translateX(${Math.sin(index * 0.5) * 8}px)`,
                  }}
                >
                  <motion.div className="relative z-10" whileHover={{ scale: 1.1 }}>
                    <GlassIcon icon={IconComp} size="md" glow={item.glow || meta.glow} />
                  </motion.div>

                  <motion.div
                    className={`flex-1 backdrop-blur-[40px] rounded-2xl p-4 border transition-all ${
                      isLight 
                        ? "bg-white/90 border-slate-200/90 shadow-md text-slate-900" 
                        : "bg-white/5 border-white/10 text-white shadow-xl"
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className={`${textColor} tracking-tight font-bold text-sm`}>{item.title}</div>
                      <div className={`tracking-tighter font-extrabold ${item.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                        {item.type === "income" ? "+" : "-"}₹{item.amount.toLocaleString()}
                      </div>
                    </div>
                    <div className={`${subtextColor} text-xs tracking-tight`}>{item.time || "Today"}</div>
                    <motion.div
                      className="h-[1px] bg-gradient-to-r from-[#16A34A]/50 to-transparent mt-3"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      style={{ transformOrigin: "left" }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`mt-8 text-center ${subtextColor} tracking-tight text-xs font-semibold`}
          >
            Total spent in view: ₹{totalSpent.toLocaleString()}
          </motion.div>
        </div>
      )}
    </div>
  );
}
