import { useState, useRef, memo, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
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
import {
  pageTitleClass,
  pageSubtitleClass,
  incomeTextClass,
  expenseTextClass,
  getListItemCardClass,
} from "../../../utils/uiTokens";
import { getCategoryMeta, getCombinedCategories } from "../../../utils/categoryConfig";
import { formatCurrency } from "../../../utils/formatters";
import { useLongPress } from "../../../utils/useLongPress";

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

const FlowItemCard = memo(function FlowItemCard({
  item,
  index,
  textColor,
  subtextColor,
  isLight,
  currency,
  onLongPress,
  onDelete,
}: FlowItemCardProps) {
  const meta = getCategoryMeta(item.category);
  const IconComp = meta.icon;
  const longPressHandlers = useLongPress({ onLongPress, vibrateMs: 30 });
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-90, -25, 25, 90], [0.9, 0, 0, 0.9]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index, 12) * 0.04, type: "spring", stiffness: 350, damping: 30 }}
      className="relative flex items-center gap-4 select-none cursor-pointer overflow-hidden rounded-2xl"
      style={{
        transform: `translateX(${Math.sin(index * 0.5) * 8}px)`,
      }}
      {...longPressHandlers}
    >
      {/* Decorative Swipe Indicators (Invisible until swiped) */}
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-y-0 left-4 flex items-center justify-start pointer-events-none z-0"
      >
        <Trash2 className="w-5 h-5 text-[#EF4444]" />
      </motion.div>
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-y-0 right-4 flex items-center justify-end pointer-events-none z-0"
      >
        <Trash2 className="w-5 h-5 text-[#EF4444]" />
      </motion.div>

      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.65}
        onDragStart={() => {
          longPressHandlers.onPointerCancel();
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
          className={`flex-1 rounded-2xl p-4 border ${getListItemCardClass(isLight)}`}
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
              className={item.type === "income" ? incomeTextClass : expenseTextClass}
            >
              {item.type === "income" ? "+" : "-"}
              {formatCurrency(item.amount, currencySymbols[currency])}
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
});

export function Flow() {
  const { transactions, theme, colorMode, currency, updateTransactionCategory, deleteTransaction, customCategories, addCustomCategory } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const [floatingItem, setFloatingItem] = useState<Transaction | null>(null);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");

  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const isLight = !activeTheme.isDark;

  const flowItems = useMemo(() => {
    const todayISO = new Date().toISOString().split("T")[0];
    const todayTransactions = transactions.filter((t) => t.date === todayISO);
    return todayTransactions.length > 0 ? todayTransactions : transactions;
  }, [transactions]);

  const displayedItems = useMemo(() => flowItems.slice(0, 150), [flowItems]);

  const categories = useMemo(() => getCombinedCategories(customCategories), [customCategories]);

  const totalSpent = useMemo(() => {
    return flowItems
      .filter((t) => t.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
  }, [flowItems]);

  return (
    <div className="min-h-screen px-6 pt-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={`${textColor} ${pageTitleClass}`}>Flow</h1>
        <div className={`${subtextColor} ${pageSubtitleClass}`}>Your spending timeline • Swipe left on any item to remove</div>
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
              {displayedItems.map((item, index) => (
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
            onClick={() => {
              setFloatingItem(null);
              setShowCustomCategoryInput(false);
              setCustomCategoryName("");
            }}
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
                  const catMeta = getCategoryMeta(cat);
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
                        if (cat === "Other") {
                          setShowCustomCategoryInput(true);
                        } else {
                          updateTransactionCategory(floatingItem.id, cat);
                          setShowCustomCategoryInput(false);
                          setCustomCategoryName("");
                          setFloatingItem(null);
                        }
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

              {showCustomCategoryInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-white/10"
                >
                  <div className="text-xs mb-2 font-medium tracking-tight opacity-70">
                    New Custom Category Name
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      placeholder="e.g. Gym, Pets, Subscriptions..."
                      className={`flex-1 rounded-xl px-3 py-2 text-sm border outline-none ${
                        isLight
                          ? "bg-slate-50 border-slate-300 text-slate-900"
                          : "bg-white/10 border-white/20 text-white placeholder:text-white/30"
                      }`}
                    />
                    <button
                      type="button"
                      disabled={!customCategoryName.trim()}
                      onClick={() => {
                        const trimmed = customCategoryName.trim();
                        if (!trimmed) return;
                        addCustomCategory(trimmed);
                        updateTransactionCategory(floatingItem.id, trimmed);
                        setShowCustomCategoryInput(false);
                        setCustomCategoryName("");
                        setFloatingItem(null);
                      }}
                      className="px-4 py-2 bg-[#16A34A] disabled:opacity-40 text-white rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer"
                    >
                      Add & Apply
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateTransactionCategory(floatingItem.id, "Other");
                      setShowCustomCategoryInput(false);
                      setCustomCategoryName("");
                      setFloatingItem(null);
                    }}
                    className="w-full text-center text-[11px] opacity-60 hover:opacity-100 mt-2 underline cursor-pointer"
                  >
                    Use default "Other" without new category
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
