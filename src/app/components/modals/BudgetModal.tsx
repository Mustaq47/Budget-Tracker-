import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, DollarSign, Check, Sliders } from "lucide-react";
import { useBudgetStore } from "../../../store/useBudgetStore";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetBudgets = [1500, 2500, 5000, 10000];

export function BudgetModal({ isOpen, onClose }: BudgetModalProps) {
  const { dailyBudget, setDailyBudget } = useBudgetStore();
  const [budgetInput, setBudgetInput] = useState(dailyBudget.toString());

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] max-w-md mx-auto"
          >
            <div className="backdrop-blur-[60px] bg-gradient-to-b from-white/10 to-white/5 border-t border-white/20 rounded-t-[48px] p-8 shadow-[0_-8px_40px_rgba(123,97,255,0.4),0_-4px_20px_rgba(0,0,0,0.6)]">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 cursor-pointer"
              >
                <X size={20} className="text-white/70" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4D8D] to-[#FFD166] flex items-center justify-center shadow-lg">
                  <DollarSign size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-bold tracking-tight">Daily Budget</h2>
                  <div className="text-white/60 text-xs tracking-tight">Set Your Daily Spending Target</div>
                </div>
              </div>

              {/* Current Target Card */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 mb-6 text-center">
                <div className="text-white/50 text-xs tracking-tight mb-1">Current Target</div>
                <div className="text-white text-4xl font-black tracking-tighter">
                  ₹{dailyBudget.toLocaleString()}
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-2">New Target Amount</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-white/50 text-xl font-bold">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="Enter amount"
                      className="w-full bg-white/5 border border-white/15 rounded-2xl pl-10 pr-4 py-3.5 text-white text-xl font-bold placeholder:text-white/20 focus:outline-none focus:border-[#FF4D8D]"
                    />
                  </div>
                </div>

                {/* Preset Chips */}
                <div>
                  <div className="text-white/50 text-xs mb-2">Quick Presets</div>
                  <div className="grid grid-cols-4 gap-2">
                    {presetBudgets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBudgetInput(preset.toString())}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          budgetInput === preset.toString()
                            ? "bg-[#FF4D8D] border-[#FF4D8D] text-white shadow-md"
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
                  className="w-full py-4 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#FF4D8D] to-[#7B61FF] text-white shadow-[0_0_25px_rgba(255,77,141,0.5)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={18} /> Save New Budget Limit
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
