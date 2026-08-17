import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Wallet, ArrowDownRight, ArrowUpRight, PlusCircle, MinusCircle, Sparkles, CreditCard, ChevronRight, Check } from "lucide-react";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetAmounts = [500, 1000, 5000, 10000];

// Spring physics for Apple-like motion
const springConfig = { type: "spring" as const, stiffness: 350, damping: 30 };

// Sparkline component to visualize recent cashflow with high-end premium aesthetics
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  if (data.length < 2) return <div className="h-20" />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const padding = 15; // Vertical padding to prevent clipping
  const range = max - min || 1;
  
  const points: [number, number][] = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - padding - ((val - min) / range) * (100 - padding * 2);
    return [x, y];
  });

  const curvePath = useMemo(() => {
    let path = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0[0] + (p1[0] - p0[0]) * 0.4;
      const cp1y = p0[1];
      const cp2x = p0[0] + (p1[0] - p0[0]) * 0.6;
      const cp2y = p1[1];
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1[0]},${p1[1]}`;
    }
    return path;
  }, [points]);

  const fillPath = `${curvePath} L 100,100 L 0,100 Z`;

  return (
    <div className="w-full h-20 relative">
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="40%" stopColor={color} stopOpacity="0.1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={`glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Fill Gradient */}
        <motion.path 
          d={fillPath} 
          fill={`url(#gradient-${color})`} 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
        
        {/* Glow Stroke */}
        <motion.path 
          d={curvePath} 
          fill="none" 
          stroke={color} 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          filter={`url(#glow-${color})`}
          opacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
        
        {/* Main Crisp Stroke */}
        <motion.path 
          d={curvePath} 
          fill="none" 
          stroke={color} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
        
        {/* Endpoint Pulsing Dot */}
        <motion.circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r="2.5"
          fill="white"
          stroke={color}
          strokeWidth="1.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6, type: "spring", bounce: 0.6 }}
        />
      </svg>
    </div>
  );
};

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { transactions, trips, addTransaction, updateTripSpent, currency, theme, colorMode, setActiveModal } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;
  
  const [activeAction, setActiveAction] = useState<"deposit" | "withdraw" | null>(null);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Financial Context
  const incomeTxs = transactions.filter((t) => t.type === "income");
  const expenseTxs = transactions.filter((t) => t.type === "expense");
  
  const income = incomeTxs.reduce((sum, t) => sum + t.amount, 0);
  const expense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = Math.max(0, income - expense);

  // Generate sparkline data from the last 15 transactions
  const sparklineData = useMemo(() => {
    let runBal = totalBalance;
    const history = [runBal];
    const recent = [...transactions].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 15);
    for (const tx of recent) {
      if (tx.type === "income") runBal -= tx.amount;
      if (tx.type === "expense") runBal += tx.amount;
      history.push(Math.max(0, runBal));
    }
    return history.reverse();
  }, [transactions, totalBalance]);

  const recentTxs = [...transactions].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 3);

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    if (activeAction === "withdraw" && val > totalBalance) {
      alert("Insufficient funds for this withdrawal.");
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const selectedTrip = trips?.find(t => t.id === selectedTripId);
    
    let title = source.trim();
    if (!title) {
      title = activeAction === "deposit" ? "Wallet Deposit" : "Wallet Withdrawal";
      if (selectedTrip) title += ` (${selectedTrip.title})`;
    }

    addTransaction({
      title,
      amount: val,
      category: activeAction === "deposit" ? "Income" : "Transfer",
      time: timeStr,
      type: activeAction === "deposit" ? "income" : "expense",
      glow: activeAction === "deposit" ? "purple" : "pink",
      tripId: selectedTripId || undefined,
    });

    if (activeAction === "withdraw" && selectedTripId) {
      updateTripSpent(selectedTripId, val);
    }

    // Reset state & close
    setAmount("");
    setSource("");
    setSelectedTripId(null);
    setActiveAction(null);
    onClose();
  };

  const resetAndClose = () => {
    setActiveAction(null);
    setAmount("");
    setSelectedTripId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Deep blur backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={springConfig}
            className="fixed bottom-0 left-0 right-0 z-[110] max-w-lg mx-auto flex flex-col justify-end"
          >
            <div
              className={`w-full max-h-[92vh] flex flex-col rounded-t-[40px] relative transition-colors ${
                isLight
                  ? "bg-white/95 border-t border-slate-200 text-slate-900 shadow-[0_-20px_50px_rgba(0,0,0,0.15)]"
                  : "bg-gradient-to-b from-[#181530]/98 via-[#0F0D24]/98 to-[#090816] border-t border-white/10 text-white shadow-[0_-20px_60px_rgba(123,97,255,0.25)]"
              } backdrop-blur-3xl`}
            >
              {/* Pill Handle */}
              <div className="shrink-0 pt-4 pb-2 flex justify-center w-full bg-transparent">
                <div className={`w-12 h-1.5 rounded-full ${isLight ? "bg-slate-300" : "bg-white/20"}`} />
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 pb-12 hide-scrollbar">
                
                {/* Header Row */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7B61FF] to-[#00E5FF] p-[1px] shadow-lg shadow-[#7B61FF]/30">
                      <div className="w-full h-full rounded-[15px] bg-[#120F28] flex items-center justify-center">
                        <Wallet size={20} className="text-[#00E5FF]" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                        Wallet <Sparkles size={16} className="text-[#FFD166]" />
                      </h2>
                      <div className={`text-xs font-semibold tracking-wide ${isLight ? "text-slate-500" : "text-white/50"}`}>
                        Liquidity Center
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={resetAndClose}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                      isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-200" : "bg-white/5 hover:bg-white/10 border-white/10"
                    }`}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Hero Balance Card */}
                <motion.div 
                  layout
                  className="relative rounded-[32px] p-6 mb-8 overflow-hidden group shadow-2xl"
                >
                  <motion.div 
                    className="absolute inset-0 z-0 bg-gradient-to-br from-[#1A1A2E] to-[#0B0B1A]"
                    animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
                  />
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#7B61FF]/30 rounded-full blur-[60px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00E5FF]/20 rounded-full blur-[60px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                  
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Available Balance</div>
                      <div className="text-white text-5xl font-black tracking-tighter drop-shadow-lg">
                        <span className="text-[#00E5FF]/80 text-4xl mr-1">{currencySymbols[currency]}</span>
                        {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="mt-8">
                      <Sparkline data={sparklineData} color={isLight ? "#00E5FF" : "#7B61FF"} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
                      <div>
                        <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <ArrowDownRight size={12} /> Inflow
                        </div>
                        <div className="text-white font-bold text-sm">{currencySymbols[currency]}{income.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <ArrowUpRight size={12} /> Outflow
                        </div>
                        <div className="text-white font-bold text-sm">{currencySymbols[currency]}{expense.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Action Pad Grid */}
                <AnimatePresence mode="wait">
                  {!activeAction ? (
                    <motion.div
                      key="action-grid"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="grid grid-cols-2 gap-3"
                    >
                      <button 
                        onClick={() => setActiveAction("deposit")}
                        className={`p-5 rounded-3xl border flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                          isLight ? "bg-emerald-50 border-emerald-200" : "bg-emerald-500/10 border-emerald-500/20"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <PlusCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">Deposit</span>
                      </button>

                      <button 
                        onClick={() => setActiveAction("withdraw")}
                        className={`p-5 rounded-3xl border flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                          isLight ? "bg-rose-50 border-rose-200" : "bg-rose-500/10 border-rose-500/20"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
                          <MinusCircle size={24} className="text-rose-600 dark:text-rose-400" />
                        </div>
                        <span className="font-bold text-sm text-rose-700 dark:text-rose-300">Withdraw</span>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="action-form"
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={springConfig}
                      onSubmit={handleAction}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center px-2">
                        <h3 className="font-bold text-lg">
                          {activeAction === "deposit" ? "Add Funds" : "Withdraw Funds"}
                        </h3>
                        <button type="button" onClick={() => setActiveAction(null)} className="text-sm font-bold opacity-60">Cancel</button>
                      </div>

                      {/* Giant Number Input */}
                      <div className={`p-6 rounded-[32px] border transition-colors ${
                        activeAction === "deposit" 
                          ? (isLight ? "bg-emerald-50/50 border-emerald-200" : "bg-emerald-500/5 border-emerald-500/20")
                          : (isLight ? "bg-rose-50/50 border-rose-200" : "bg-rose-500/5 border-rose-500/20")
                      }`}>
                        <div className="relative flex items-center justify-center">
                          <span className={`text-3xl font-black mr-2 ${
                            activeAction === "deposit" ? "text-emerald-500" : "text-rose-500"
                          }`}>{currencySymbols[currency]}</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                            placeholder="0.00"
                            autoFocus
                            className="bg-transparent border-none outline-none text-5xl font-black tracking-tighter w-[60%] placeholder:opacity-30"
                          />
                        </div>
                      </div>

                      {/* Preset Chips */}
                      <div className="grid grid-cols-4 gap-2">
                        {presetAmounts.map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val.toString())}
                            className={`py-3 rounded-2xl text-xs font-bold transition-all ${
                              amount === val.toString()
                                ? (activeAction === "deposit" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-rose-500 text-white shadow-lg shadow-rose-500/30")
                                : (isLight ? "bg-slate-100 hover:bg-slate-200" : "bg-white/5 hover:bg-white/10")
                            }`}
                          >
                            {val >= 1000 ? `${val/1000}k` : val}
                          </button>
                        ))}
                      </div>

                      {/* Trip Selector (Only for Withdrawals) */}
                      {(activeAction === "withdraw" && trips && trips.length > 0) && (
                        <div className="space-y-2 pt-2">
                          <div className={`text-xs font-bold uppercase tracking-wider px-2 ${isLight ? "text-slate-500" : "text-white/40"}`}>
                            Link to Trip (Optional)
                          </div>
                          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                            {trips.map(trip => (
                              <button
                                key={trip.id}
                                type="button"
                                onClick={() => setSelectedTripId(selectedTripId === trip.id ? null : trip.id)}
                                className={`shrink-0 w-36 p-3 rounded-2xl text-left border relative transition-all ${
                                  selectedTripId === trip.id
                                    ? (isLight ? "border-slate-800 ring-2 ring-slate-800" : "border-white ring-2 ring-white")
                                    : (isLight ? "border-slate-200 opacity-60 hover:opacity-100" : "border-white/10 opacity-60 hover:opacity-100")
                                }`}
                                style={selectedTripId === trip.id ? { background: trip.gradient } : {}}
                              >
                                {selectedTripId === trip.id && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                                    <Check size={12} strokeWidth={3} />
                                  </div>
                                )}
                                <div className={`font-bold text-sm mb-1 ${selectedTripId === trip.id ? "text-white" : ""}`}>
                                  {trip.title}
                                </div>
                                <div className={`font-mono text-[10px] uppercase tracking-widest ${selectedTripId === trip.id ? "text-white/80" : "opacity-50"}`}>
                                  Budget: {currencySymbols[currency]}{trip.budget}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <input
                          type="text"
                          value={source}
                          onChange={(e) => setSource(e.target.value)}
                          placeholder="Note (e.g. Salary, Rent)"
                          className={`w-full p-4 rounded-[20px] font-medium outline-none transition-all ${
                            isLight ? "bg-slate-50 focus:bg-white border border-slate-200" : "bg-black/20 focus:bg-black/40 border border-white/10"
                          }`}
                        />
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        disabled={!amount}
                        className={`w-full py-4 rounded-[20px] font-black text-sm flex items-center justify-center gap-2 transition-all ${
                          !amount
                            ? "opacity-50 cursor-not-allowed bg-slate-500/20"
                            : activeAction === "deposit"
                            ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/30"
                            : "bg-rose-500 text-white shadow-xl shadow-rose-500/30"
                        }`}
                      >
                        {activeAction === "deposit" ? "Confirm Deposit" : "Confirm Withdrawal"}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Recent Transactions list (Context) */}
                {!activeAction && recentTxs.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 pt-6 border-t border-dashed border-gray-500/30">
                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 px-2 ${isLight ? "text-slate-500" : "text-white/40"}`}>
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {recentTxs.map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center p-3 rounded-2xl hover:bg-slate-500/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                              tx.type === "income" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
                            }`}>
                              {tx.type === "income" 
                                ? <ArrowDownRight size={16} className="text-emerald-500" /> 
                                : <ArrowUpRight size={16} className="text-rose-500" />
                              }
                            </div>
                            <div>
                              <div className="font-bold text-sm">{tx.title}</div>
                              <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-white/40"}`}>{tx.date} • {tx.time}</div>
                            </div>
                          </div>
                          <div className={`font-black ${tx.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>
                            {tx.type === "income" ? "+" : "-"}{currencySymbols[currency]}{tx.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
