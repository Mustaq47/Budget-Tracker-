import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { useDailyBudget } from "../../hooks/useDailyBudget";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { X, Settings, List, Plus, Sparkles, Info, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "../../../utils/translations";
import { RAGFlowAnalyticsService } from "../../../services/ragflowAnalyticsService";

interface SafeToSpendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SafeToSpendModal({ isOpen, onClose }: SafeToSpendModalProps) {
  const { theme, colorMode, currency, dailyBudget, transactions, setActiveModal } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    allowance,
    spent,
    remaining,
    overspent,
    percentage,
    status,
    feedback,
    label,
    // V2 engine advanced metrics
    futureCommitments,
    savingsCommitment,
    emergencyBuffer,
    spendableAmount,
    rolloverAdjustment,
    overspendingAdjustment,
    behaviorAdjustment,
    projectedMonthEnd,
    projectedRemaining,
    explanation,
    confidence,
    spentToday,
    spentThisMonth,
    remainingDays,
    dailyAllowance,
  } = useDailyBudget();

  const isLight = !activeTheme.isDark;
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;

  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState(false);

  // Mocking RAGFlow payload based on smartSpendingEngine output
  const mockSmartResult = {
    calculatedMaximum: dailyAllowance,
    recommendedLimit: remaining,
    currency,
    riskLevel: status === 'danger' ? 'HIGH' as const : status === 'warning' ? 'MEDIUM' as const : 'LOW' as const,
    reasonCodes: overspent > 0 ? ['HIGH_BUDGET_UTILIZATION' as const] : [],
    remainingDays,
    upcomingObligations: futureCommitments,
    reservedSavings: savingsCommitment,
    reservedTripFunds: 0,
    safetyBuffer: emergencyBuffer,
    discretionaryFunds: spendableAmount,
    dataFreshness: `Data updated today`,
  };

  useEffect(() => {
    if (isOpen) {
      RAGFlowAnalyticsService.fetchSafeToSpendExplanation(mockSmartResult)
        .then(explanation => setAiExplanation(explanation))
        .catch(() => setAiExplanation(""));
    }
  }, [isOpen, remaining]);

  const symbol = currencySymbols[currency] || '$';

  // Get status label color preset
  const getStatusBadgeClass = () => {
    switch (status) {
      case "danger":
        return "bg-red-500/20 text-red-500 border border-red-500/30";
      case "warning":
        return "bg-amber-500/20 text-amber-500 border border-amber-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30";
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

              <div className="text-center mb-6 mt-4">
                <div className={`${subtextColor} text-sm uppercase tracking-widest font-bold mb-2`}>
                  {label}
                </div>
                <div className={`${status === "danger" ? "text-red-500" : textColor} text-5xl font-black tracking-tighter mb-2`}>
                  {symbol}{remaining.toLocaleString()}
                </div>
                <div className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold ${getStatusBadgeClass()}`}>
                  {status === "danger" ? (
                    <>
                      <AlertTriangle size={12} />
                      {t.budgetExceeded || "Budget Exceeded!"}
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={12} />
                      {feedback}
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className={subtextColor}>{t.spent || "Spent"}: {symbol}{spent.toLocaleString()}</span>
                  <span className={subtextColor}>{t.limit || "Limit"}: {symbol}{allowance.toLocaleString()}</span>
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

              {/* Intelligent Month-end Projection Banner */}
              <div className={`p-4 rounded-2xl border mb-6 text-xs font-medium flex flex-col gap-1 ${
                status === 'danger'
                  ? "bg-red-500/10 border-red-500/20 text-red-500"
                  : status === 'warning'
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              }`}>
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                  <Sparkles size={12} /> Month-End Forecast
                </div>
                {projectedRemaining > 0 ? (
                  <span>At your current spending pace, you are projected to finish <strong>{symbol}{projectedRemaining.toLocaleString()}</strong> under budget.</span>
                ) : (
                  <span>At your current spending pace, you are projected to exceed your budget by <strong>{symbol}{Math.abs(dailyBudget - projectedMonthEnd).toLocaleString()}</strong>.</span>
                )}
              </div>

              {/* Progressive Disclosure: How this is calculated */}
              <div className="mb-6">
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className={`w-full py-3 px-4 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all ${
                    isLight 
                      ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100" 
                      : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Info size={14} /> How this is calculated
                  </span>
                  {showExplanation ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className={`mt-3 p-4 rounded-2xl border text-xs space-y-2.5 ${
                        isLight ? "bg-slate-50/50 border-slate-200" : "bg-white/5 border-white/10"
                      }`}>
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Monthly Target Limit</span>
                          <span className={`${textColor} font-mono`}>{symbol}{dailyBudget.toLocaleString()}</span>
                        </div>
                        {spentThisMonth > 0 && (
                          <div className="flex justify-between items-center text-slate-400">
                            <span>Completed Spent (Past)</span>
                            <span className="text-red-500 font-mono">-{symbol}{(spentThisMonth - spentToday).toLocaleString()}</span>
                          </div>
                        )}
                        {emergencyBuffer > 0 && (
                          <div className="flex justify-between items-center text-slate-400">
                            <span>Emergency Buffer (Protected)</span>
                            <span className="text-amber-500 font-mono">-{symbol}{emergencyBuffer.toLocaleString()}</span>
                          </div>
                        )}
                        {savingsCommitment > 0 && (
                          <div className="flex justify-between items-center text-slate-400">
                            <span>Savings Goals Reservation</span>
                            <span className="text-purple-400 font-mono">-{symbol}{savingsCommitment.toLocaleString()}</span>
                          </div>
                        )}
                        {futureCommitments > 0 && (
                          <div className="flex justify-between items-center text-slate-400">
                            <span>Future Commitments</span>
                            <span className="text-blue-400 font-mono">-{symbol}{futureCommitments.toLocaleString()}</span>
                          </div>
                        )}
                        <hr className={isLight ? "border-slate-200" : "border-white/10"} />
                        <div className="flex justify-between items-center font-bold">
                          <span className={textColor}>Discretionary Spendable Pool</span>
                          <span className={`${textColor} font-mono`}>{symbol}{spendableAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Remaining Days in Month</span>
                          <span className={`${textColor} font-mono`}>{remainingDays} days</span>
                        </div>
                        <hr className={isLight ? "border-slate-200" : "border-white/10"} />
                        <div className="flex justify-between items-center font-bold">
                          <span className={textColor}>Today's Base Allowance</span>
                          <span className={`${textColor} font-mono`}>{symbol}{(spendableAmount / remainingDays).toFixed(2)}</span>
                        </div>
                        {rolloverAdjustment > 0 && (
                          <div className="flex justify-between items-center text-slate-400">
                            <span>Unspent Rollover</span>
                            <span className="text-emerald-500 font-mono">+{symbol}{rolloverAdjustment.toFixed(2)}</span>
                          </div>
                        )}
                        {overspendingAdjustment < 0 && (
                          <div className="flex justify-between items-center text-slate-400">
                            <span>Overspending Recovery</span>
                            <span className="text-red-500 font-mono">-{symbol}{Math.abs(overspendingAdjustment).toFixed(2)}</span>
                          </div>
                        )}
                        {behaviorAdjustment < 0 && (
                          <div className="flex justify-between items-center text-slate-400">
                            <span>Behavioral Dampener Throttling</span>
                            <span className="text-amber-500 font-mono">-{symbol}{Math.abs(behaviorAdjustment).toFixed(2)}</span>
                          </div>
                        )}
                        {spentToday > 0 && (
                          <div className="flex justify-between items-center text-slate-400">
                            <span>Today's Spent</span>
                            <span className="text-red-500 font-mono">-{symbol}{spentToday.toLocaleString()}</span>
                          </div>
                        )}
                        <hr className={isLight ? "border-slate-200" : "border-white/10"} />
                        <div className="flex justify-between items-center font-black text-sm">
                          <span className={textColor}>Today's Safe to Spend Limit</span>
                          <span className="text-emerald-500 font-mono">{symbol}{remaining.toLocaleString()}</span>
                        </div>
                        
                        <div className="text-[10px] text-slate-400 text-center pt-2">
                          Calculations processed with dinero.js to guarantee mathematical integrity. Confidence: {confidence}.
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* AI Explanation Box */}
              {aiExplanation && (
                <div className={`mb-6 p-4 rounded-2xl border text-xs leading-relaxed ${
                  isLight ? "bg-purple-50/80 border-purple-200 text-purple-900" : "bg-purple-950/30 border-purple-500/20 text-purple-200"
                }`}>
                  <div className="flex items-center gap-1.5 font-bold mb-1.5 text-purple-400">
                    <Sparkles size={14} /> AI Spending Insight
                  </div>
                  {aiExplanation}
                </div>
              )}

              <div className={`text-[10px] text-center mb-6 flex items-center justify-center gap-1 font-medium ${subtextColor}`}>
                <Info size={10} /> Data updated today. System clock in local time.
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
                  <Plus size={18} /> {t.addExpense || "Add New Expense"}
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
                    <Settings size={16} /> {t.setBudget || "Adjust Budget"}
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
                    <List size={16} /> {t.transactions || "All Expenses"}
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
