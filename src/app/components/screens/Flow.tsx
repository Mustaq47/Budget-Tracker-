import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GlassIcon } from "../GlassIcon";
import {
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Heart,
  Zap,
  DollarSign,
  Trash2,
  LucideIcon,
} from "lucide-react";
import { useBudgetStore, currencySymbols, Transaction } from "../../../store/useBudgetStore";
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

interface FlowItemCardProps {
  item: Transaction;
  index: number;
  textColor: string;
  subtextColor: string;
  isLight: boolean;
  currency: keyof typeof currencySymbols;
  onLongPress: () => void;
  onDelete: () => void;
}

function FlowItemCard({
  item,
  index,
  textColor,
  subtextColor,
  isLight,
  currency,
  onLongPress,
  onDelete,
}: FlowItemCardProps) {
  const meta = iconMap[item.category] || { icon: DollarSign, glow: "purple" };
  const IconComp = meta.icon;
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startLongPress = () => {
    clearLongPress();
    longPressTimerRef.current = setTimeout(() => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(30);
      }
      onLongPress();
    }, 400);
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 350, damping: 30 }}
      className="relative flex items-center gap-4 select-none cursor-pointer overflow-hidden rounded-2xl"
      style={{
        transform: `translateX(${Math.sin(index * 0.5) * 8}px)`,
      }}
      onPointerDown={startLongPress}
      onPointerUp={clearLongPress}
      onPointerLeave={clearLongPress}
      onPointerCancel={clearLongPress}
      onPointerMove={(e) => {
        if (Math.abs(e.movementX) > 6 || Math.abs(e.movementY) > 6) {
          clearLongPress();
        }
      }}
    >
      {/* Decorative Swipe Indicators (No buttons) */}
      <div className="absolute inset-y-0 left-4 flex items-center justify-start pointer-events-none opacity-40 z-0">
        <Trash2 className="w-5 h-5 text-[#EF4444]" />
      </div>
      <div className="absolute inset-y-0 right-4 flex items-center justify-end pointer-events-none opacity-40 z-0">
        <Trash2 className="w-5 h-5 text-[#EF4444]" />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.65}
        onDragStart={() => {
          clearLongPress();
        }}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 450) {
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate(50);
            }
            onDelete();
          }
        }}
        className="relative z-10 flex items-center gap-4 w-full"
      >
        <motion.div className="relative z-10 shrink-0" whileHover={{ scale: 1.1 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={item.category}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
            >
              <GlassIcon icon={IconComp} size="md" glow={item.glow || meta.glow} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          className={`flex-1 backdrop-blur-[40px] rounded-2xl p-4 border transition-all ${
            isLight
              ? "bg-white/90 border-slate-200/90 shadow-md text-slate-900"
              : "bg-white/5 border-white/10 text-white shadow-xl"
          }`}
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className={`${textColor} tracking-tight font-bold text-sm`}
                >
                  {item.title}
                </motion.div>
              </AnimatePresence>
              <div className={`${subtextColor} text-xs tracking-tight mt-0.5`}>{item.time || "Today"}</div>
            </div>
            <div
              className={`tracking-tighter font-extrabold text-sm sm:text-base ${
                item.type === "income" ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {item.type === "income" ? "+" : "-"}
              {currencySymbols[currency]}
              {item.amount.toLocaleString()}
            </div>
          </div>

          <motion.div
            className="h-[1px] bg-gradient-to-r from-[#16A34A]/50 to-transparent mt-3"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            style={{ transformOrigin: "left" }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function Flow() {
  const { transactions, theme, colorMode, currency, updateTransactionCategory, deleteTransaction } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const [floatingItem, setFloatingItem] = useState<Transaction | null>(null);

  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const isLight = !activeTheme.isDark;

  const todayISO = new Date().toISOString().split("T")[0];
  const todayTransactions = transactions.filter((t) => t.date === todayISO);
  const flowItems = todayTransactions.length > 0 ? todayTransactions : transactions;
  const categories = Object.keys(iconMap);

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
        <div className={`${subtextColor} tracking-tight`}>Your spending timeline • Swipe left on any item to remove</div>
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
            <AnimatePresence mode="popLayout">
              {flowItems.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  layout
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -80 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                >
                  <FlowItemCard
                    item={item}
                    index={index}
                    textColor={textColor}
                    subtextColor={subtextColor}
                    isLight={isLight}
                    currency={currency}
                    onLongPress={() => setFloatingItem(item)}
                    onDelete={() => deleteTransaction(item.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`mt-8 text-center ${subtextColor} tracking-tight text-xs font-semibold`}
          >
            Total spent in view: {currencySymbols[currency]}{totalSpent.toLocaleString()}
          </motion.div>
        </div>
      )}

      {/* Floating Category Icons Overlay */}
      <AnimatePresence>
        {floatingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFloatingItem(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm rounded-[28px] p-6 border shadow-2xl backdrop-blur-2xl ${
                isLight
                  ? "bg-white/95 border-slate-200 text-slate-900"
                  : "bg-[#0a0a1f]/95 border-white/15 text-white"
              }`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat, i) => {
                  const catMeta = iconMap[cat];
                  const CatIcon = catMeta.icon;
                  const isSelected = cat === floatingItem.category;
                  return (
                    <motion.button
                      key={cat}
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        updateTransactionCategory(floatingItem.id, cat);
                        setFloatingItem(null);
                      }}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#16A34A] border-[#16A34A] text-white shadow-lg font-bold"
                          : isLight
                            ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <CatIcon className="w-6 h-6 mb-1.5" />
                      <span className="text-xs font-semibold">{cat}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
