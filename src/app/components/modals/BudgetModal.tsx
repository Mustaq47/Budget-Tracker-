import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, DollarSign, Check, Plus, Sliders, TrendingUp, Sparkles } from "lucide-react";
import { useBudgetStore } from "../../../store/useBudgetStore";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetBudgets = [1500, 2500, 5000, 10000];
const quickAddPresets = [50, 100, 200, 500, 1000];

export function BudgetModal({ isOpen, onClose }: BudgetModalProps) {
  const { dailyBudget, setDailyBudget, transactions, addTransaction } = useBudgetStore();

  const [activeTab, setActiveTab] = useState<"add" | "target">("add");
  const [spentInput, setSpentInput] = useState("");
  const [spentTitle, setSpentTitle] = useState("");
  const [budgetInput, setBudgetInput] = useState(dailyBudget.toString());

  // Calculate spent today
  const todayIso = new Date().toISOString().split("T")[0];
  const spentToday = transactions
    .filter((t) => t.type === "expense" && t.date === todayIso)
    .reduce((s, t) => s + t.amount, 0);

  const remaining = Math.max(0, dailyBudget - spentToday);
  const spentPercent = Math.min(100, Math.round((spentToday / (dailyBudget || 1)) * 100));

  const handleAddDirectAmount = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(spentInput);
    if (!isNaN(val) && val > 0) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      addTransaction({
        title: spentTitle.trim() || "Daily Expense",
        amount: val,
        category: "General",
        type: "expense",
        time: timeStr,
        glow: "pink",
      });
      setSpentInput("");
      setSpentTitle("");
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
            <div className="backdrop-blur-[60px] bg-gradient-to-b from-white/12 via-white/8 to-[#0B0914] border-t border-white/20 rounded-t-[48px] p-7 shadow-[0_-10px_50px_rgba(255,77,141,0.3),0_-4px_20px_rgba(0,0,0,0.8)] max-h-[88vh] overflow-y-auto">
              
              {/* Drag Handle */}
              <div className="w-12 h-1.5 rounded-full bg-white/25 mx-auto mb-5" />

              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 cursor-pointer hover:bg-white/20 transition-all"
              >
                <X size={18} className="text-white/80" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4D8D] to-[#7B61FF] flex items-center justify-center shadow-[0_0_20px_rgba(255,77,141,0.5)]">
                  <DollarSign size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-black tracking-tight">Daily Budget</h2>
                  <div className="text-white/60 text-xs tracking-tight">Manage Spent & Target Allowance</div>
                </div>
              </div>

              {/* Current Spent & Target Overview Card */}
              <div className="p-5 rounded-3xl bg-white/5 border border-white/10 mb-5 relative overflow-hidden">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <div className="text-white/50 text-xs tracking-tight mb-1 flex items-center gap-1">
                      <TrendingUp size={12} className="text-[#FF4D8D]" /> Spent Today
                    </div>
                    <div className="text-white text-3xl font-black tracking-tighter">
                      ₹{spentToday.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/50 text-xs tracking-tight mb-1">Target Limit</div>
                    <div className="text-white/80 text-lg font-bold tracking-tight">
                      ₹{dailyBudget.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden mb-2">
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

                <div className="flex justify-between text-[11px] text-white/50 font-medium">
                  <span>{spentPercent}% spent</span>
                  <span>{remaining > 0 ? `₹${remaining.toLocaleString()} remaining` : "Budget Exceeded!"}</span>
                </div>
              </div>

              {/* Dual Tab Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("add")}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "add"
                      ? "bg-gradient-to-r from-[#FF4D8D] to-[#7B61FF] text-white shadow-md"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Plus size={14} /> Add Spent Amount
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("target")}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "target"
                      ? "bg-gradient-to-r from-[#FF4D8D] to-[#7B61FF] text-white shadow-md"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Sliders size={14} /> Set Target Limit
                </button>
              </div>

              {/* TAB 1: Add Amount Directly to Current Spent */}
              {activeTab === "add" && (
                <form onSubmit={handleAddDirectAmount} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-2">
                      Amount to Add Directly into Spent
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-[#FF4D8D] text-2xl font-black">₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={spentInput}
                        onChange={(e) => setSpentInput(e.target.value.replace(/[^0-9.]/g, ""))}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/15 rounded-2xl pl-10 pr-4 py-4 text-white text-2xl font-black placeholder:text-white/20 focus:outline-none focus:border-[#FF4D8D] shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Quick Add Chips */}
                  <div>
                    <div className="text-white/50 text-xs mb-2 font-medium flex items-center gap-1">
                      <Sparkles size={12} className="text-[#FF4D8D]" /> Quick Addition Chips
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {quickAddPresets.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleQuickAddChip(amt)}
                          className="py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-white/80 hover:bg-[#FF4D8D]/20 hover:border-[#FF4D8D]/40 transition-all cursor-pointer"
                        >
                          +₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-2">Note / Description (Optional)</label>
                    <input
                      type="text"
                      value={spentTitle}
                      onChange={(e) => setSpentTitle(e.target.value)}
                      placeholder="e.g. Lunch, Taxi, Coffee"
                      className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FF4D8D]"
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
                        : "bg-white/10 text-white/30 cursor-not-allowed border border-white/5"
                    }`}
                  >
                    <Plus size={18} /> Add to Today's Spent Total
                  </motion.button>
                </form>
              )}

              {/* TAB 2: Edit Daily Budget Target */}
              {activeTab === "target" && (
                <form onSubmit={handleSaveTarget} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-2">New Target Budget Limit</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-[#00E5FF] text-2xl font-black">₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value.replace(/[^0-9.]/g, ""))}
                        placeholder="Enter target amount"
                        className="w-full bg-white/5 border border-white/15 rounded-2xl pl-10 pr-4 py-4 text-white text-2xl font-black placeholder:text-white/20 focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                  </div>

                  {/* Preset Chips */}
                  <div>
                    <div className="text-white/50 text-xs mb-2 font-medium">Quick Target Presets</div>
                    <div className="grid grid-cols-4 gap-2">
                      {presetBudgets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setBudgetInput(preset.toString())}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            budgetInput === preset.toString()
                              ? "bg-[#00E5FF] border-[#00E5FF] text-black shadow-md"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          ₹{preset.toLocaleString()}
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

