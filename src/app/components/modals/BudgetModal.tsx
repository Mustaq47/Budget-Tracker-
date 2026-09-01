import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, DollarSign, Check, Plus, Sliders, TrendingUp, Sparkles, Target } from "lucide-react";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { useTranslation } from "../../../utils/translations";
import { useDailyBudget } from "../../hooks/useDailyBudget";
import { BottomSheet } from "../BottomSheet";
import { dinero, add, toDecimal } from 'dinero.js';
import { getCurrencyObj, toSubunits, calculateDineroTotal } from "../../../utils/dineroUtils";
import { GlassIcon } from "../GlassIcon";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetBudgets = [15000, 25000, 50000, 100000];
const quickAddPresets = [500, 1000, 2000, 5000, 10000];



export function BudgetModal({ isOpen, onClose }: BudgetModalProps) {
  const { dailyBudget, setDailyBudget, transactions, addTransaction, currency, theme, colorMode, budgetViewMode, setBudgetViewMode } = useBudgetStore();
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

  const {
    spentThisMonth,
    remainingThisMonth: remaining,
    percentageMonth: spentPercent,
    spentToday,
    remainingToday,
    percentageToday,
    dailyAllowance,
    futureCommitments,
    savingsCommitment,
    emergencyBuffer,
    projectedMonthEnd,
    projectedRemaining,
    feedback,
    status,
  } = useDailyBudget();

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
        title: budgetTitle.trim() || "Funds Added",
        amount: val,
        category: "Income",
        type: "income",
        time: timeStr,
        glow: "blue",
        isBudgetAdjustment: true,
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
    <BottomSheet isOpen={isOpen} onClose={onClose} isLight={isLight}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pr-12">
        <div className="flex items-center gap-4">
          <GlassIcon icon={DollarSign} size="md" glow="pink" asChild />
          <div>
            <h2 className={`${textColor} text-2xl font-black tracking-tight`}>
              {budgetViewMode === 'daily' ? (t.dailyBudgetTitle || 'Daily Allowance') : (t.monthlyBudgetTitle || 'Monthly Master')}
            </h2>
            <div className={`${subtextColor} text-xs tracking-tight`}>
              {budgetViewMode === 'daily' ? (t.manageDailyLimit || 'Pace your spending day by day') : (t.manageMonthlyBudget || 'Set your overarching limit for the month')}
            </div>
          </div>
        </div>

        {/* View Mode Toggle Pill */}
        <div className={`flex items-center p-0.5 rounded-full border shrink-0 ${isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/10"}`}>
          <button
            type="button"
            onClick={() => setBudgetViewMode("daily")}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
              budgetViewMode === "daily"
                ? "bg-[#FF4D8D] text-white shadow-sm"
                : isLight ? "text-slate-600 hover:text-slate-900" : "text-white/60 hover:text-white"
            }`}
          >
            {t.daily || "Daily"}
          </button>
          <button
            type="button"
            onClick={() => setBudgetViewMode("monthly")}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
              budgetViewMode === "monthly"
                ? "bg-[#7B61FF] text-white shadow-sm"
                : isLight ? "text-slate-600 hover:text-slate-900" : "text-white/60 hover:text-white"
            }`}
          >
            {t.monthly || "Monthly"}
          </button>
        </div>
      </div>


              {/* Current Spent & Target Overview Card */}
              {budgetViewMode === 'daily' ? (
                <div
                  className={`p-5 rounded-3xl border mb-5 relative overflow-hidden ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <div className={`${subtextColor} text-xs tracking-tight mb-1 flex items-center gap-1`}>
                        <TrendingUp size={12} className="text-[#FF4D8D]" /> Safe to Spend Today
                      </div>
                      <div className={`${textColor} text-3xl font-black tracking-tighter`}>
                        {currencySymbols[currency]}
                        {remainingToday.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`${subtextColor} text-xs tracking-tight mb-1`}>Today's Limit</div>
                      <div className={`${textColor} text-lg font-bold tracking-tight`}>
                        {currencySymbols[currency]}
                        {dailyAllowance.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={`w-full h-2.5 rounded-full overflow-hidden mb-2 ${isLight ? "bg-slate-200" : "bg-white/10"}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentageToday}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${
                        percentageToday >= 100
                          ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                          : "bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] shadow-[0_0_12px_rgba(0,229,255,0.8)]"
                      }`}
                    />
                  </div>

                  <div className={`flex justify-between text-[11px] font-medium ${subtextColor} mb-2`}>
                    <span>{percentageToday}% spent today</span>
                    <span>
                      Spent Today: {currencySymbols[currency]}{spentToday.toLocaleString()}
                    </span>
                  </div>

                  <div className={`text-[11px] p-2.5 rounded-xl text-center border font-medium ${
                    status === "danger"
                      ? "bg-red-500/10 border-red-500/20 text-red-500"
                      : status === "warning"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  }`}>
                    {feedback}
                  </div>
                </div>
              ) : (
                <div
                  className={`p-5 rounded-3xl border mb-5 relative overflow-hidden ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <div className={`${subtextColor} text-xs tracking-tight mb-1 flex items-center gap-1`}>
                        <TrendingUp size={12} className="text-[#7B61FF]" /> {t.spentThisMonth || "Spent This Month"}
                      </div>
                      <div className={`${textColor} text-3xl font-black tracking-tighter`}>
                        {currencySymbols[currency]}
                        {spentThisMonth.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`${subtextColor} text-xs tracking-tight mb-1`}>{t.targetLimit || "Monthly Limit"}</div>
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

                  <div className={`flex justify-between text-[11px] font-medium ${subtextColor} mb-3`}>
                    <span>{spentPercent}% {t.spent || "spent"}</span>
                    <span>
                      {remaining > 0 ? `${currencySymbols[currency]}${remaining.toLocaleString()} ${t.remaining || "remaining"}` : (t.budgetExceeded || "Budget Exceeded!")}
                    </span>
                  </div>

                  {/* Advanced metrics breakdown for transparency */}
                  <div className={`p-3 rounded-2xl border text-[11px] space-y-1.5 ${isLight ? "bg-slate-100/50 border-slate-200/60" : "bg-white/5 border-white/10"}`}>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Emergency Buffer (Protected)</span>
                      <span className={`${textColor} font-semibold font-mono`}>-{currencySymbols[currency]}{emergencyBuffer.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Savings Goals Reservation</span>
                      <span className={`${textColor} font-semibold font-mono`}>-{currencySymbols[currency]}{savingsCommitment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Future Commitments</span>
                      <span className={`${textColor} font-semibold font-mono`}>-{currencySymbols[currency]}{futureCommitments.toLocaleString()}</span>
                    </div>
                    <hr className={isLight ? "border-slate-200" : "border-white/10"} />
                    {projectedRemaining > 0 ? (
                      <div className="text-emerald-500 font-medium text-center">
                        Projected finish: {currencySymbols[currency]}{projectedRemaining.toLocaleString()} under budget
                      </div>
                    ) : (
                      <div className="text-red-500 font-medium text-center">
                        Projected finish: {currencySymbols[currency]}{Math.abs(dailyBudget - projectedMonthEnd).toLocaleString()} over budget
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                  <Plus size={14} /> {t.addToBudget || "Add Funds"}
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
                  <Sliders size={14} /> {t.setTargetLimit || "Update Limit"}
                </button>
              </div>

              {/* TAB 1: Add Amount Directly to Current Budget */}
              {activeTab === "add" && (
                <form onSubmit={handleAddDirectAmount} className="space-y-5">
                  <div>
                    <label className={`block text-xs font-bold mb-2 ${isLight ? "text-slate-700" : "text-white/80"}`}>
                      {t.amountToAddToBudget || "Amount to Add"}
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
                      <Sparkles size={12} className="text-[#FF4D8D]" /> {t.quickAdditionChips || "Quick Add"}
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
                      {t.noteSourceOptional || "Note / Source (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={budgetTitle}
                      onChange={(e) => setBudgetTitle(e.target.value)}
                      placeholder={t.noteSourcePlaceholder || "e.g. Salary, Bonus, Pocket Money"}
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
                    <Plus size={18} /> {t.addToMonthlyBudgetLimit || "Add Funds"}
                  </motion.button>
                </form>
              )}

              {/* TAB 2: Edit Daily Budget Target */}
              {activeTab === "target" && (
                <form onSubmit={handleSaveTarget} className="space-y-5">
                  <div>
                    <label className={`block text-xs font-bold mb-2 ${isLight ? "text-slate-700" : "text-white/80"}`}>
                      {t.newTargetBudgetLimit || "New Monthly Limit"}
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-[#00E5FF] text-2xl font-black">{currencySymbols[currency]}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value.replace(/[^0-9.]/g, ""))}
                        placeholder={t.enterTargetAmount || "Enter target amount"}
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
                    <div className={`${subtextColor} text-xs mb-2 font-medium`}>{t.quickTargetPresets || "Quick Presets"}</div>
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
                    <Check size={18} /> {t.saveNewTargetLimit || "Save Limit"}
                  </motion.button>
                </form>
              )}

      {/* End */}
    </BottomSheet>
  );
}

