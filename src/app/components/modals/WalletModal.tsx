import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Wallet, ArrowDownRight, ArrowUpRight, PlusCircle, Sparkles } from "lucide-react";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const depositPresets = [500, 1000, 5000, 10000];

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { transactions, addTransaction, currency, theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
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
            <div
              className={`backdrop-blur-3xl border-t rounded-t-[40px] p-6 pt-3 max-h-[85vh] overflow-y-auto pb-12 relative transition-colors ${
                isLight
                  ? "bg-white/95 border-slate-200 text-slate-900 shadow-[0_-12px_50px_rgba(0,0,0,0.1)]"
                  : "bg-gradient-to-b from-[#181530]/95 via-[#0F0D24]/98 to-[#090816] border-white/20 text-white shadow-[0_-12px_50px_rgba(123,97,255,0.3)]"
              }`}
            >
              {/* Drag handle */}
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
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D] p-[1px] shadow-[0_0_20px_rgba(123,97,255,0.4)]">
                  <div className="w-full h-full rounded-[15px] bg-[#120F28] flex items-center justify-center">
                    <Wallet size={22} className="text-[#00E5FF]" />
                  </div>
                </div>
                <div>
                  <h2 className={`${textColor} text-xl font-black tracking-tight flex items-center gap-2`}>
                    coZify Wallet <Sparkles size={16} className="text-[#FFD166]" />
                  </h2>
                  <div className={`${subtextColor} text-xs tracking-tight`}>Available Funds & Digital Cashflow</div>
                </div>
              </div>

              {/* Glass Card Balance Container */}
              <div
                className={`relative p-6 rounded-3xl border mb-6 backdrop-blur-2xl overflow-hidden ${
                  isLight
                    ? "bg-slate-50/90 border-slate-200"
                    : "bg-gradient-to-br from-white/10 via-white/5 to-transparent border-white/15"
                }`}
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-[#7B61FF]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#00E5FF]/15 rounded-full blur-3xl pointer-events-none" />

                <div className={`${subtextColor} text-xs font-medium uppercase tracking-wider mb-1`}>
                  Total Available Balance
                </div>
                <div className={`${textColor} text-4xl font-black tracking-tighter mb-5`}>
                  {currencySymbols[currency]}
                  {totalBalance.toLocaleString()}
                </div>

                <div className={`grid grid-cols-2 gap-3 pt-4 border-t ${isLight ? "border-slate-200" : "border-white/10"}`}>
                  <div className="flex items-center gap-2.5 bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/20">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <ArrowDownRight size={16} className="text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <div className={`${subtextColor} text-[10px] uppercase font-bold tracking-tight truncate`}>
                        Total Income
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm truncate">
                        {currencySymbols[currency]}
                        {income.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 bg-rose-500/10 p-2.5 rounded-2xl border border-rose-500/20">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                      <ArrowUpRight size={16} className="text-rose-500" />
                    </div>
                    <div className="min-w-0">
                      <div className={`${subtextColor} text-[10px] uppercase font-bold tracking-tight truncate`}>
                        Total Expenses
                      </div>
                      <div className="text-rose-600 dark:text-rose-400 font-extrabold text-sm truncate">
                        {currencySymbols[currency]}
                        {expense.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deposit Form */}
              <form
                onSubmit={handleDeposit}
                className={`space-y-4 p-5 rounded-3xl border ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                }`}
              >
                <div className={`${textColor} text-sm font-bold tracking-tight`}>Add Funds to Wallet</div>

                <div>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-[#00E5FF] text-xl font-bold">{currencySymbols[currency]}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="0"
                      className={`w-full border rounded-2xl pl-10 pr-4 py-3.5 text-xl font-extrabold focus:outline-none transition-all ${
                        isLight
                          ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#7B61FF]"
                          : "bg-black/30 border-white/15 text-white placeholder:text-white/20 focus:border-[#00E5FF]"
                      }`}
                    />
                  </div>
                </div>

                {/* Preset Chips */}
                <div>
                  <div className={`${subtextColor} text-[11px] mb-2 font-medium`}>Quick Amount</div>
                  <div className="grid grid-cols-4 gap-2">
                    {depositPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDepositAmount(preset.toString())}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          depositAmount === preset.toString()
                            ? "bg-[#00E5FF] border-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                            : isLight
                            ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        +{currencySymbols[currency]}
                        {preset.toLocaleString()}
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
                    className={`w-full border rounded-2xl px-4 py-3 text-xs focus:outline-none transition-all ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#7B61FF]"
                        : "bg-black/30 border-white/15 text-white placeholder:text-white/30 focus:border-[#00E5FF]"
                    }`}
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
                      : isLight
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
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
