import { motion } from "motion/react";
import { GlassIcon } from "../GlassIcon";
import { ShoppingBag, Coffee, Car, Home, Heart, Zap, DollarSign, LucideIcon } from "lucide-react";
import { useBudgetStore } from "../../../store/useBudgetStore";

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
  const { transactions } = useBudgetStore();

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
        <h1 className="text-white text-3xl tracking-tighter mb-2">Flow</h1>
        <div className="text-white/60 tracking-tight">Your spending timeline</div>
      </motion.div>

      {flowItems.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <div className="text-white/40 text-lg mb-2">No timeline activity yet</div>
          <div className="text-white/30 text-xs">
            Tap the <span className="text-[#7B61FF] font-bold">+</span> button below to record an expense!
          </div>
        </div>
      ) : (
        <div className="relative pb-8">
          <div className="absolute left-[27px] top-0 bottom-0 w-[2px]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D] opacity-20" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D]"
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
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: [
                          `0 0 20px rgba(123, 97, 255, 0.0)`,
                          `0 0 30px rgba(123, 97, 255, 0.4)`,
                          `0 0 20px rgba(123, 97, 255, 0.0)`,
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    />
                  </motion.div>

                  <motion.div
                    className="flex-1 backdrop-blur-[40px] bg-white/5 border border-white/10 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="text-white tracking-tight">{item.title}</div>
                      <div className="text-white tracking-tighter">
                        {item.type === "income" ? "+" : "-"}₹{item.amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-white/40 text-xs tracking-tight">{item.time || "Today"}</div>
                    <motion.div
                      className="h-[1px] bg-gradient-to-r from-[#7B61FF]/50 to-transparent mt-3"
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
            className="mt-8 text-center text-white/40 tracking-tight"
          >
            Total spent in view: ₹{totalSpent.toLocaleString()}
          </motion.div>
        </div>
      )}
    </div>
  );
}
