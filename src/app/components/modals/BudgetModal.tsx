import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, DollarSign, Check, Plus, Minus, Sparkles, TrendingUp } from "lucide-react";
import { useBudgetStore } from "../../../store/useBudgetStore";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetBudgets = [1000, 2000, 5000, 10000];

export function BudgetModal({ isOpen, onClose }: BudgetModalProps) {
  const { dailyBudget, setDailyBudget } = useBudgetStore();
  const [budgetInput, setBudgetInput] = useState(dailyBudget.toString());

  const currentVal = parseFloat(budgetInput) || 0;
  const monthlyProjection = currentVal * 30;

  const handleAdjust = (delta: number) => {
    const next = Math.max(100, currentVal + delta);
    setBudgetInput(next.toString());
  };

  const handleSave = (e: React.FormEvent) => {
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
            <div className="backdrop-blur-3xl bg-gradient-to-b from-[#181530]/95 via-[#0F0D24]/98 to-[#090816] border-t border-white/20 rounded-t-[40px] p-6 pt-3 shadow-[0_-12px_50px_rgba(255,77,141,0.3),0_-4px_25px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto pb-12 relative text-white">
              
              {/* Drag handle */}
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-5" />

              <button
                onClick={onClose}
                className="absolute top-5 right-6 w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/15 cursor-pointer hover:bg-white/20 transition-colors z-10"
              >
                <X size={18} className="text-white/80" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4D8D] via-[#FFD166] to-[#7B61FF] p-[1px] shadow-[0_0_20px_rgba(255,77,141,0.4)]">
                  <div className="w-full h-full rounded-[15px] bg-[#120F28] flex items-center justify-center">
                    <DollarSign size={22} className="text-[#FF4D8D]" />
                  </div>
                </div>
                <div>
                  <h2 className="text-white text-xl font-black tracking-tight flex items-center gap-2">
                    Daily Budget Limit <Sparkles size={16} className="text-[#FFD166]" />
                  </h2>
                  <div className="text-white/50 text-xs tracking-tight">Manage & Control Daily Spending Cap</div>
                </div>
              </div>

              {/* Current Target & Monthly Projection Card */}
              <div className="relative p-6 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/15 mb-6 backdrop-blur-2xl overflow-hidden text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF4D8D]/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Configured Daily Target</div>
                <div className="text-white text-4xl font-black tracking-tighter mb-4 drop-shadow-md">
                  ₹{dailyBudget.toLocaleString()}
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/80 text-xs font-medium">
                  <TrendingUp size={14} className="text-[#00E5FF]" />
                  <span>Monthly Projection: <strong className="text-white">₹{monthlyProjection.toLocaleString()}</strong></span>
                </div>
              </div>

              {/* Edit Amount Form */}
              <form onSubmit={handleSave} className="space-y-5 bg-white/5 p-5 rounded-3xl border border-white/10">
                <div className="text-white/90 text-sm font-bold tracking-tight">Set New Budget Target</div>

                <div>
                  <div className="relative flex items-center mb-3">
                    <span className="absolute left-4 text-[#FF4D8D] text-xl font-bold">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="Enter amount"
                      className="w-full bg-black/30 border border-white/15 rounded-2xl pl-10 pr-4 py-3.5 text-white text-xl font-extrabold placeholder:text-white/20 focus:outline-none focus:border-[#FF4D8D] transition-all"
                    />
                  </div>

                  {/* Step Adjust (+ / - Buttons) */}
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAdjust(-1000)}
                      className="py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/15 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Minus size={12} /> ₹1K
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(-500)}
                      className="py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/15 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Minus size={12} /> ₹500
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(500)}
                      className="py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/15 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus size={12} /> ₹500
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(1000)}
                      className="py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/15 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus size={12} /> ₹1K
                    </button>
                  </div>
                </div>

                {/* Preset Chips */}
                <div>
                  <div className="text-white/40 text-[11px] mb-2 font-medium">Quick Presets</div>
                  <div className="grid grid-cols-4 gap-2">
                    {presetBudgets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBudgetInput(preset.toString())}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          budgetInput === preset.toString()
                            ? "bg-[#FF4D8D] border-[#FF4D8D] text-white shadow-[0_0_15px_rgba(255,77,141,0.5)]"
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
                  className="w-full py-3.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#FF4D8D] via-[#7B61FF] to-[#00E5FF] text-white shadow-[0_0_25px_rgba(255,77,141,0.5)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={18} /> Save Daily Budget Limit
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
