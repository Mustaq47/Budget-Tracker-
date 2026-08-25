import { motion, AnimatePresence } from "motion/react";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { useDailyBudget } from "../../hooks/useDailyBudget";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { X, TrendingDown, Settings, List, Plus } from "lucide-react";
import { useNavigate } from "react-router";

interface SafeToSpendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SafeToSpendModal({ isOpen, onClose }: SafeToSpendModalProps) {
  const { theme, colorMode, currency, setActiveModal } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const navigate = useNavigate();

  const {
    allowance,
    spent,
    remaining,
    overspent,
    percentage,
    status,
    feedback,
    label
  } = useDailyBudget();

  const isLight = !activeTheme.isDark;
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[110] max-w-md mx-auto"
          >
            <div
              className={`backdrop-blur-[60px] border-t rounded-t-[48px] p-7 max-h-[88vh] overflow-y-auto ${
                isLight
                  ? "bg-white/95 border-slate-200 shadow-[0_-12px_50px_rgba(0,0,0,0.1)]"
                  : "bg-gradient-to-b from-white/12 via-white/8 to-[#0B0914] border-white/20 shadow-[0_-10px_50px_rgba(255,77,141,0.3),0_-4px_20px_rgba(0,0,0,0.8)]"
              }`}
            >
              {/* Drag Handle */}
              <div className={`w-12 h-1.5 rounded-full mx-auto mb-5 ${isLight ? "bg-slate-300" : "bg-white/25"}`} />

              <button
                onClick={onClose}
                className={`absolute top-6 right-6 w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center border cursor-pointer transition-all ${
                  isLight
                    ? "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                    : "bg-white/10 border-white/10 hover:bg-white/20 text-white/80"
                }`}
              >
                <X size={18} />
              </button>

              <div className="text-center mb-6 mt-4">
                <div className={`${subtextColor} text-sm uppercase tracking-widest font-bold mb-2`}>
                  {label === "Safe to Spend Today" ? "Safe to Spend" : "Monthly Plan"}
                </div>
                <div className={`${status === "danger" ? "text-red-500" : textColor} text-5xl font-black tracking-tighter mb-2`}>
                  {currencySymbols[currency]}{remaining.toLocaleString()}
                </div>
                <div
                  className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${
                    status === "danger"
                      ? "bg-red-500/20 text-red-600"
                      : status === "warning"
                      ? "bg-amber-500/20 text-amber-600"
                      : "bg-emerald-500/20 text-emerald-600"
                  }`}
                >
                  {status === "danger" ? "⚠️ Budget Exceeded by " + currencySymbols[currency] + overspent.toLocaleString() : feedback}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className={subtextColor}>Spent: {currencySymbols[currency]}{spent.toLocaleString()}</span>
                  <span className={subtextColor}>Limit: {currencySymbols[currency]}{allowance.toLocaleString()}</span>
                </div>
                <div className={`w-full h-3 rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-white/10"}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      status === "danger"
                        ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                        : status === "warning"
                        ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                        : "bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] shadow-[0_0_12px_rgba(0,229,255,0.8)]"
                    }`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => setActiveModal("expense"), 150);
                  }}
                  className="w-full py-4 rounded-2xl font-black text-sm tracking-tight text-white flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF4D8D] to-[#7B61FF] hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,77,141,0.3)] cursor-pointer"
                >
                  <Plus size={18} /> Add New Expense
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      setTimeout(() => setActiveModal("budget"), 150);
                    }}
                    className={`py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border cursor-pointer active:scale-95 transition-transform ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <Settings size={16} /> Adjust Budget
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      setTimeout(() => {
                        navigate("/transactions");
                      }, 150);
                    }}
                    className={`py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border cursor-pointer active:scale-95 transition-transform ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <List size={16} /> All Expenses
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
