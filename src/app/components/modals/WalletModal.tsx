import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Wallet, ArrowDownRight, ArrowUpRight, PlusCircle, Sparkles } from "lucide-react";
import { useBudgetStore } from "../../../store/useBudgetStore";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const depositPresets = [500, 1000, 5000, 10000];

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { transactions, addTransaction } = useBudgetStore();
  const [depositAmount, setDepositAmount] = useState("");
  const [depositSource, setDepositSource] = useState("");

  const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = Math.max(0, income - expense);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    addTransaction({
      title: depositSource.trim() || "Wallet Deposit",
      amount,
      category: "Income",
      time: timeStr,
      type: "income",
      glow: "purple",
    });

    setDepositAmount("");
    setDepositSource("");
    onClose();
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
            <div className="backdrop-blur-3xl bg-gradient-to-b from-[#181530]/95 via-[#0F0D24]/98 to-[#090816] border-t border-white/20 rounded-t-[40px] p-6 pt-3 shadow-[0_-12px_50px_rgba(123,97,255,0.3),0_-4px_25px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto pb-12 relative text-white">
              
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
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D] p-[1px] shadow-[0_0_20px_rgba(123,97,255,0.4)]">
                  <div className="w-full h-full rounded-[15px] bg-[#120F28] flex items-center justify-center">
                    <Wallet size={22} className="text-[#00E5FF]" />
                  </div>
                </div>
                <div>
                  <h2 className="text-white text-xl font-black tracking-tight flex items-center gap-2">
                    Zentro Wallet <Sparkles size={16} className="text-[#FFD166]" />
                  </h2>
                  <div className="text-white/50 text-xs tracking-tight">Available Funds & Digital Cashflow</div>
                </div>
              </div>

              {/* Glass Card Balance Container */}
              <div className="relative p-6 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/15 mb-6 backdrop-blur-2xl overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <div className="absolute top-0 right-0 w-36 h-36 bg-[#7B61FF]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#00E5FF]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Total Available Balance</div>
                <div className="text-white text-4xl font-black tracking-tighter mb-5">
                  ₹{totalBalance.toLocaleString()}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2.5 bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/20">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <ArrowDownRight size={16} className="text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white/50 text-[10px] uppercase font-bold tracking-tight truncate">Total Income</div>
                      <div className="text-emerald-400 font-extrabold text-sm truncate">₹{income.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 bg-rose-500/10 p-2.5 rounded-2xl border border-rose-500/20">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                      <ArrowUpRight size={16} className="text-rose-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white/50 text-[10px] uppercase font-bold tracking-tight truncate">Total Expenses</div>
                      <div className="text-rose-400 font-extrabold text-sm truncate">₹{expense.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deposit Form */}
              <form onSubmit={handleDeposit} className="space-y-4 bg-white/5 p-5 rounded-3xl border border-white/10">
                <div className="text-white/90 text-sm font-bold tracking-tight">Add Funds to Wallet</div>
                
                <div>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-[#00E5FF] text-xl font-bold">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="0"
                      className="w-full bg-black/30 border border-white/15 rounded-2xl pl-10 pr-4 py-3.5 text-white text-xl font-extrabold placeholder:text-white/20 focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>
                </div>

                {/* Preset Chips */}
                <div>
                  <div className="text-white/40 text-[11px] mb-2 font-medium">Quick Amount</div>
                  <div className="grid grid-cols-4 gap-2">
                    {depositPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDepositAmount(preset.toString())}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          depositAmount === preset.toString()
                            ? "bg-[#00E5FF] border-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        +₹{preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={depositSource}
                    onChange={(e) => setDepositSource(e.target.value)}
                    placeholder="Source / Description (e.g. Salary, Bank Deposit)"
                    className="w-full bg-black/30 border border-white/15 rounded-2xl px-4 py-3 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#00E5FF] transition-all"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={!depositAmount}
                  whileHover={{ scale: depositAmount ? 1.02 : 1 }}
                  whileTap={{ scale: depositAmount ? 0.98 : 1 }}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    depositAmount
                      ? "bg-gradient-to-r from-[#7B61FF] via-[#00E5FF] to-[#7B61FF] text-white shadow-[0_0_25px_rgba(123,97,255,0.5)]"
                      : "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                  }`}
                >
                  <PlusCircle size={18} />
                  Deposit Funds
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
