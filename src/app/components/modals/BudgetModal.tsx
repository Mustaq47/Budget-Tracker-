import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, DollarSign, Check, Plus, Sliders, TrendingUp, Sparkles, Target } from "lucide-react";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { useTranslation } from "../../../utils/translations";
import { dinero, add, toDecimal } from 'dinero.js';
import * as currencies from 'dinero.js/currencies';
import { GlassIcon } from "../GlassIcon";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetBudgets = [15000, 25000, 50000, 100000];
const quickAddPresets = [500, 1000, 2000, 5000, 10000];

const getCurrencyObj = (cCode: string) => {
  return (currencies as any)[cCode] || (currencies as any).USD;
};

const toSubunits = (amount: number, currencyObj: any) => {
  const factor = currencyObj.base ** currencyObj.exponent;
  return Math.round(amount * factor);
};

export function BudgetModal({ isOpen, onClose }: BudgetModalProps) {
  const { dailyBudget, setDailyBudget, transactions, addTransaction, currency, theme, colorMode } = useBudgetStore();
  const { t } = useTranslation();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;

  const [activeTab, setActiveTab] = useState<"add" | "target">("add");
  const [spentInput, setSpentInput] = useState("");
  const [budgetTitle, setBudgetTitle] = useState("");
  const [budgetInput, setBudgetInput] = useState(dailyBudget.toString());

  useEffect(() => {
    if (isOpen) {
      setBudgetInput(dailyBudget.toString());
    }
  }, [isOpen, dailyBudget]);

  // Calculate spent this month for rendering (Optional context, but kept simple to avoid heavy logic)
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const spentThisMonth = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(currentMonthPrefix))
    .reduce((s, t) => s + t.amount, 0);

  const remaining = Math.max(0, dailyBudget - spentThisMonth);
  const spentPercent = Math.min(100, Math.round((spentThisMonth / (dailyBudget || 1)) * 100));

  const handleAddDirectAmount = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(spentInput);
    if (!isNaN(val) && val > 0) {
      const cObj = getCurrencyObj(currency);
      const currentDinero = dinero({ amount: toSubunits(dailyBudget, cObj), currency: cObj });
      const addDinero = dinero({ amount: toSubunits(val, cObj), currency: cObj });
      const newTotal = add(currentDinero, addDinero);
      const newBudget = Number(toDecimal(newTotal));

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      
      setDailyBudget(newBudget);
      addTransaction({
        title: budgetTitle.trim() || "Budget Allowance Added",
        amount: val,
        category: "Income",
        type: "income",
        time: timeStr,
        glow: "blue",
      });
      setSpentInput("");
      setBudgetTitle("");
      onClose();
    }
  };

  const handleQuickAddChip = (amount: number) => {
    const current = parseFloat(spentInput) || 0;
    setSpentInput((current + amount).toString());
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      setDailyBudget(val);
      const currentMonth = new Date().toISOString().substring(0, 7);
      useBudgetStore.getState().setLastBudgetSetMonth(currentMonth);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[110] max-w-md mx-auto"
          >
            <div
              className={`backdrop-blur-[60px] border-t rounded-t-[48px] p-7 max-h-[88vh] overflow-y-auto transition-colors ${
                isLight
                  ? "bg-white/95 border-slate-200 text-slate-900 shadow-[0_-12px_50px_rgba(0,0,0,0.1)]"
                  : "bg-gradient-to-b from-white/12 via-white/8 to-[#0B0914] border-white/20 text-white shadow-[0_-10px_50px_rgba(255,77,141,0.3),0_-4px_20px_rgba(0,0,0,0.8)]"
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

              {/* Header */}
              <div className="flex items-center gap-4 mb-5">
                <GlassIcon icon={DollarSign} size="md" glow="pink" asChild />
                <div>
                  <h2 className={`${textColor} text-2xl font-black tracking-tight`}>Monthly Budget</h2>
                  <div className={`${subtextColor} text-xs tracking-tight`}>Manage Current Budget & Target Allowance</div>
                </div>
              </div>

              {/* Current Spent & Target Overview Card */}
              <div
                className={`p-5 rounded-3xl border mb-5 relative overflow-hidden ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <div className={`${subtextColor} text-xs tracking-tight mb-1 flex items-center gap-1`}>
                      <TrendingUp size={12} className="text-[#FF4D8D]" /> Spent This Month
                    </div>
                    <div className={`${textColor} text-3xl font-black tracking-tighter`}>
                      {currencySymbols[currency]}
                      {spentThisMonth.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`${subtextColor} text-xs tracking-tight mb-1`}>Target Limit</div>
                    <div className={`${textColor} text-lg font-bold tracking-tight`}>
                      {currencySymbols[currency]}
                      {dailyBudget.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className={`w-full h-2.5 rounded-full overflow-hidden mb-2 ${isLight ? "bg-slate-200" : "bg-white/10"}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${spentPercent}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${
                      spentPercent >= 100
                        ? "bg-gradient-to-r from-[#FF4D8D] to-red-500 shadow-[0_0_12px_rgba(255,77,141,0.8)]"
                        : "bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] shadow-[0_0_12px_rgba(0,229,255,0.8)]"
                    }`}
                  />
                </div>

                <div className={`flex justify-between text-[11px] font-medium ${subtextColor}`}>
                  <span>{spentPercent}% spent</span>
                  <span>
                    {remaining > 0 ? `${currencySymbols[currency]}${remaining.toLocaleString()} remaining` : "Budget Exceeded!"}
                  </span>
                </div>
              </div>

              {/* Dual Tab Switcher */}
              <div
                className={`grid grid-cols-2 gap-2 p-1.5 rounded-2xl border mb-6 ${
                  isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/10"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("add")}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "add"
                      ? "bg-gradient-to-r from-[#FF4D8D] to-[#7B61FF] text-white shadow-md"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Plus size={14} /> Add to Budget
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("target")}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "target"
                      ? "bg-gradient-to-r from-[#FF4D8D] to-[#7B61FF] text-white shadow-md"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Sliders size={14} /> Set Target Limit
                </button>
              </div>

              {/* TAB 1: Add Amount Directly to Current Budget */}
              {activeTab === "add" && (
                <form onSubmit={handleAddDirectAmount} className="space-y-5">
                  <div>
                    <label className={`block text-xs font-bold mb-2 ${isLight ? "text-slate-700" : "text-white/80"}`}>
                      Amount to Add to Current Budget
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-[#FF4D8D] text-2xl font-black">{currencySymbols[currency]}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={spentInput}
                        onChange={(e) => setSpentInput(e.target.value.replace(/[^0-9.]/g, ""))}
                        placeholder="0.00"
                        className={`w-full border rounded-2xl pl-10 pr-4 py-4 text-2xl font-black focus:outline-none transition-all ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#FF4D8D]"
                            : "bg-white/5 border-white/15 text-white placeholder:text-white/20 focus:border-[#FF4D8D]"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Quick Add Chips */}
                  <div>
                    <div className={`${subtextColor} text-xs mb-2 font-medium flex items-center gap-1`}>
                      <Sparkles size={12} className="text-[#FF4D8D]" /> Quick Addition Chips
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {quickAddPresets.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleQuickAddChip(amt)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isLight
                              ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                              : "bg-white/5 border-white/10 text-white/80 hover:bg-[#FF4D8D]/20 hover:border-[#FF4D8D]/40"
                          }`}
                        >
                          +{currencySymbols[currency]}
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-2 ${isLight ? "text-slate-700" : "text-white/70"}`}>
                      Note / Source (Optional)
                    </label>
                    <input
                      type="text"
                      value={budgetTitle}
                      onChange={(e) => setBudgetTitle(e.target.value)}
                      placeholder="e.g. Salary, Bonus, Pocket Money"
                      className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all ${
                        isLight
                          ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#FF4D8D]"
                          : "bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#FF4D8D]"
                      }`}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!spentInput || parseFloat(spentInput) <= 0}
                    className={`w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                      spentInput && parseFloat(spentInput) > 0
                        ? "bg-gradient-to-r from-[#FF4D8D] to-[#7B61FF] text-white shadow-[0_0_30px_rgba(255,77,141,0.5)] cursor-pointer"
                        : isLight
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        : "bg-white/10 text-white/30 cursor-not-allowed border border-white/5"
                    }`}
                  >
                    <Plus size={18} /> Add to Monthly Budget Limit
                  </motion.button>
                </form>
              )}

              {/* TAB 2: Edit Daily Budget Target */}
              {activeTab === "target" && (
                <form onSubmit={handleSaveTarget} className="space-y-5">
                  <div>
                    <label className={`block text-xs font-bold mb-2 ${isLight ? "text-slate-700" : "text-white/80"}`}>
                      New Target Budget Limit
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-[#00E5FF] text-2xl font-black">{currencySymbols[currency]}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value.replace(/[^0-9.]/g, ""))}
                        placeholder="Enter target amount"
                        className={`w-full border rounded-2xl pl-10 pr-4 py-4 text-2xl font-black focus:outline-none transition-all ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#00E5FF]"
                            : "bg-white/5 border-white/15 text-white placeholder:text-white/20 focus:border-[#00E5FF]"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Preset Chips */}
                  <div>
                    <div className={`${subtextColor} text-xs mb-2 font-medium`}>Quick Target Presets</div>
                    <div className="grid grid-cols-4 gap-2">
                      {presetBudgets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setBudgetInput(preset.toString())}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            budgetInput === preset.toString()
                              ? "bg-[#00E5FF] border-[#00E5FF] text-black shadow-md"
                              : isLight
                              ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          {currencySymbols[currency]}
                          {preset.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl font-black text-xs bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-white shadow-[0_0_25px_rgba(0,229,255,0.5)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check size={18} /> Save New Target Limit
                  </motion.button>
                </form>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

