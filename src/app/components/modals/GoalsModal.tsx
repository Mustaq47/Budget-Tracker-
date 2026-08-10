import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Zap, Plus, Coins, Target, Trash2, Sparkles, Trophy } from "lucide-react";
import { useBudgetStore, SavingsGoal, currencySymbols } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import confetti from "canvas-confetti";

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const goalCategories = ["Vacation", "Emergency Fund", "Electronics", "Vehicle", "Home", "Investment", "Other"];
const glowThemes: Array<"gold" | "blue" | "purple" | "pink"> = ["gold", "blue", "purple", "pink"];

export function GoalsModal({ isOpen, onClose }: GoalsModalProps) {
  const { goals, addGoal, contributeToGoal, deleteGoal, currency, theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [category, setCategory] = useState("Savings");
  const [selectedGlow, setSelectedGlow] = useState<"gold" | "blue" | "purple" | "pink">("gold");

  const [contributionAmount, setContributionAmount] = useState("");

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (!title.trim() || isNaN(target) || target <= 0) return;

    addGoal({
      title: title.trim(),
      targetAmount: target,
      category,
      glow: selectedGlow,
    });

    const initial = parseFloat(initialAmount);
    if (!isNaN(initial) && initial > 0) {
      // Small timeout or direct call after state update
      const newlyAdded = goals[goals.length - 1];
      if (newlyAdded) {
        contributeToGoal(newlyAdded.id, initial);
      }
    }

    setTitle("");
    setTargetAmount("");
    setInitialAmount("");
    setShowAddGoal(false);
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForContribution) return;
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) return;

    const goal = goals.find(g => g.id === selectedGoalForContribution);
    contributeToGoal(selectedGoalForContribution, amount);
    
    if (goal && (goal.currentAmount + amount) >= goal.targetAmount && goal.currentAmount < goal.targetAmount) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setContributionAmount("");
    setSelectedGoalForContribution(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[110] max-w-md mx-auto pointer-events-auto"
          >
            <div
              className={`backdrop-blur-3xl border-t rounded-t-[40px] p-6 pt-3 max-h-[85vh] overflow-y-auto pb-12 relative transition-colors ${
                isLight
                  ? "bg-white/95 border-slate-200 text-slate-900 shadow-[0_-12px_50px_rgba(0,0,0,0.1)]"
                  : "bg-gradient-to-b from-[#181530]/95 via-[#0F0D24]/98 to-[#090816] border-white/20 text-white shadow-[0_-12px_50px_rgba(255,209,102,0.25)]"
              }`}
            >
              {/* Drag Handle */}
              <div className={`w-12 h-1 rounded-full mx-auto mb-5 ${isLight ? "bg-slate-300" : "bg-white/20"}`} />

              <button
                onClick={onClose}
                className={`absolute top-5 right-6 w-9 h-9 rounded-full backdrop-blur-xl flex items-center justify-center border cursor-pointer transition-colors z-10 ${
                  isLight
                    ? "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                    : "bg-white/10 border-white/15 hover:bg-white/20 text-white/80"
                }`}
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFD166] via-[#FF4D8D] to-[#7B61FF] p-[1px] shadow-[0_0_20px_rgba(255,209,102,0.4)]">
                  <div className="w-full h-full rounded-[15px] bg-[#120F28] flex items-center justify-center">
                    <Zap size={22} className="text-[#FFD166]" />
                  </div>
                </div>
                <div>
                  <h2 className={`${textColor} text-xl font-black tracking-tight flex items-center gap-2`}>
                    Savings Goals <Trophy size={16} className="text-[#FFD166]" />
                  </h2>
                  <div className={`${subtextColor} text-xs tracking-tight`}>
                    {goals.length === 0 ? "No active goals" : `${goals.length} Financial Milestone${goals.length > 1 ? "s" : ""}`}
                  </div>
                </div>
              </div>

              {/* Goals List or Empty State */}
              {goals.length === 0 && !showAddGoal ? (
                <div
                  className={`p-8 rounded-3xl border text-center mb-6 backdrop-blur-xl ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD166]/20 to-[#FF4D8D]/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <Target size={32} className="text-[#FFD166]" />
                  </div>
                  <h3 className={`${textColor} font-bold text-base mb-1`}>No Savings Goals Set</h3>
                  <p className={`${subtextColor} text-xs mb-6 max-w-[240px] mx-auto`}>
                    Set up custom target goals for vacations, emergency funds, or tech upgrades and track your progress.
                  </p>
                  <button
                    onClick={() => setShowAddGoal(true)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FFD166] via-[#FF4D8D] to-[#7B61FF] text-black font-extrabold text-xs shadow-[0_0_20px_rgba(255,209,102,0.4)] hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
                  >
                    <Plus size={16} /> Create Your First Goal
                  </button>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {goals.map((goal: SavingsGoal) => {
                    const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                    const isCompleted = pct >= 100;

                    return (
                      <div
                        key={goal.id}
                        className={`p-5 rounded-3xl border transition-all backdrop-blur-xl relative overflow-hidden group ${
                          isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/12 hover:border-white/25"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className={`${textColor} font-extrabold text-base tracking-tight flex items-center gap-2`}>
                              {goal.title}
                              {isCompleted && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                                  🎉 Achieved
                                </span>
                              )}
                            </div>
                            <div className={`${subtextColor} text-xs tracking-tight capitalize`}>{goal.category}</div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-[#FFD166] font-black text-sm tracking-tight">{pct}%</div>
                              <div className={`${subtextColor} text-[10px] tracking-tight`}>
                                {currencySymbols[currency]}{goal.currentAmount.toLocaleString()} / {currencySymbols[currency]}{goal.targetAmount.toLocaleString()}
                              </div>
                            </div>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              title="Delete goal"
                              className="w-7 h-7 rounded-full bg-white/5 hover:bg-rose-600/80 flex items-center justify-center border border-white/10 transition-all cursor-pointer ml-1"
                            >
                              <Trash2 size={13} className="text-white/70 hover:text-white" />
                            </button>
                          </div>
                        </div>

                        {/* Animated Glowing Progress Bar */}
                        <div className={`w-full h-3 rounded-full overflow-hidden mb-4 p-[1px] border ${isLight ? "bg-slate-200 border-slate-300" : "bg-black/40 border-white/10"}`}>
                          <motion.div
                            className={`h-full rounded-full ${
                              isCompleted
                                ? "bg-gradient-to-r from-emerald-400 to-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.6)]"
                                : "bg-gradient-to-r from-[#FFD166] via-[#FF4D8D] to-[#7B61FF] shadow-[0_0_12px_rgba(255,209,102,0.5)]"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>

                        <button
                          onClick={() => setSelectedGoalForContribution(goal.id)}
                          className={`w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                            isLight
                              ? "bg-white hover:bg-slate-100 text-slate-900 border-slate-200"
                              : "bg-white/10 hover:bg-white/15 text-white border-white/10"
                          }`}
                        >
                          <Coins size={15} className="text-[#FFD166]" /> Contribute Funds
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Contribute Sub-Modal / Form */}
              {selectedGoalForContribution && (
                <form
                  onSubmit={handleContribute}
                  className={`p-5 rounded-3xl border mb-6 space-y-3 shadow-lg ${
                    isLight ? "bg-slate-50 border-amber-300" : "bg-gradient-to-br from-white/10 to-white/5 border-[#FFD166]/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={`${textColor} flex items-center gap-1.5`}>
                      <Target size={16} className="text-[#FFD166]" /> Deposit Funds to Goal
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedGoalForContribution(null)}
                      className={`${subtextColor} hover:text-current`}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-[#FFD166] text-lg font-bold">{currencySymbols[currency]}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="Amount to deposit"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                      className={`w-full border rounded-2xl pl-10 pr-4 py-3 text-base font-extrabold focus:outline-none focus:border-[#FFD166] ${
                        isLight
                          ? "bg-white border-slate-200 text-slate-900"
                          : "bg-black/40 border-white/20 text-white"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setContributionAmount(amt.toString())}
                        className={`py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                            : "bg-white/5 border-white/10 text-white/80 hover:bg-white/15"
                        }`}
                      >
                        +{currencySymbols[currency]}
                        {amt}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedGoalForContribution(null)}
                      className={`flex-1 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isLight
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-white/10 text-white/70 hover:bg-white/15"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl text-xs font-extrabold bg-[#FFD166] text-black shadow-md hover:bg-[#ffe08a]"
                    >
                      Confirm Deposit
                    </button>
                  </div>
                </form>
              )}

              {/* Create New Goal */}
              {showAddGoal ? (
                <form
                  onSubmit={handleCreateGoal}
                  className={`space-y-4 p-5 rounded-3xl border ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/15"
                  }`}
                >
                  <div className={`${textColor} text-sm font-extrabold tracking-tight flex items-center gap-2`}>
                    <Sparkles size={16} className="text-[#FFD166]" /> Create New Savings Goal
                  </div>

                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${isLight ? "text-slate-700" : "text-white/70"}`}>
                      Goal Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dream Trip to Japan, New Macbook"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full border rounded-2xl px-4 py-3 text-xs focus:outline-none transition-all ${
                        isLight
                          ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#FFD166]"
                          : "bg-black/40 border-white/15 text-white placeholder:text-white/30 focus:border-[#FFD166]"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isLight ? "text-slate-700" : "text-white/70"}`}>
                        Target Amount ({currencySymbols[currency]})
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        placeholder="50000"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                        className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none transition-all ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#FFD166]"
                            : "bg-black/40 border-white/15 text-white placeholder:text-white/30 focus:border-[#FFD166]"
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isLight ? "text-slate-700" : "text-white/70"}`}>
                        Initial Deposit ({currencySymbols[currency]})
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0 (Optional)"
                        value={initialAmount}
                        onChange={(e) => setInitialAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                        className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none transition-all ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#FFD166]"
                            : "bg-black/40 border-white/15 text-white placeholder:text-white/30 focus:border-[#FFD166]"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${isLight ? "text-slate-700" : "text-white/70"}`}>
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full border rounded-2xl px-3 py-3 text-xs focus:outline-none ${
                        isLight
                          ? "bg-white border-slate-200 text-slate-900 focus:border-[#FFD166]"
                          : "bg-[#120F28] border-white/15 text-white focus:border-[#FFD166]"
                      }`}
                    >
                      {goalCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddGoal(false)}
                      className={`flex-1 py-3 rounded-2xl text-xs transition-all cursor-pointer ${
                        isLight
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-white/10 text-white/70 hover:bg-white/15"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-[#FFD166] to-[#FF4D8D] text-black shadow-[0_0_20px_rgba(255,209,102,0.4)] flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-all"
                    >
                      <Plus size={16} /> Create Goal
                    </button>
                  </div>
                </form>
              ) : (
                goals.length > 0 && (
                  <button
                    onClick={() => setShowAddGoal(true)}
                    className={`w-full py-3.5 rounded-2xl border border-dashed font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isLight
                        ? "border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100"
                        : "border-white/25 hover:border-white/40 text-white/80 hover:text-white bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <Plus size={16} /> Create New Savings Goal
                  </button>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
