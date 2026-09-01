import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomSheet } from "../BottomSheet";
import { X, Wallet, ArrowDownRight, ArrowUpRight, PlusCircle, MinusCircle, Sparkles, CreditCard, ChevronRight, Check } from "lucide-react";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { useTripsStore } from "../../../store/useTripsStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { dinero, add, toDecimal } from 'dinero.js';
import * as currencies from 'dinero.js/currencies';
import { GlassIcon } from "../GlassIcon";

const getCurrencyObj = (cCode: string) => {
  return (currencies as any)[cCode] || (currencies as any).USD;
};

const toSubunits = (amount: number, currencyObj: any) => {
  const factor = currencyObj.base ** currencyObj.exponent;
  return Math.round(amount * factor);
};

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
    if (points.length === 0) return "";
    
    const smoothing = 0.02; // Extremely tight smoothing for maximum sharpness
    const line = (pointA: number[], pointB: number[]) => {
      const lengthX = pointB[0] - pointA[0];
      const lengthY = pointB[1] - pointA[1];
      return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
      };
    };
    const controlPoint = (current: number[], previous: number[], next: number[], reverse?: boolean) => {
      const p = previous || current;
      const n = next || current;
      const o = line(p, n);
      const angle = o.angle + (reverse ? Math.PI : 0);
      const length = o.length * smoothing;
      return [current[0] + Math.cos(angle) * length, current[1] + Math.sin(angle) * length];
    };

    let path = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1 = controlPoint(p1, p0, p2);
      const cp2 = controlPoint(p2, p1, p3, true);

      path += ` C ${cp1[0]},${cp1[1]} ${cp2[0]},${cp2[1]} ${p2[0]},${p2[1]}`;
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

        {/* Inner Data Points */}
        <motion.g
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05, delayChildren: 0.8 } }
          }}
        >
          {points.slice(0, points.length - 1).map((p, i) => (
            <motion.circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r="1.2"
              fill={color}
              opacity="0.8"
              variants={{
                hidden: { scale: 0, opacity: 0 },
                visible: { scale: 1, opacity: 0.8 }
              }}
            />
          ))}
        </motion.g>
      </svg>
    </div>
  );
};

import { calculateDineroBalance, calculateDineroTotal } from "../../../utils/dineroUtils";
import { formatCompactCurrency } from "../../../utils/formatters";
import { useTranslation } from "../../../utils/translations";

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { transactions, addTransaction, currency, theme, colorMode, setActiveModal, dailyBudget, setDailyBudget } = useBudgetStore();
  const { t, translate, translateDynamic } = useTranslation();
  const { trips, updateTripSpent } = useTripsStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;
  
  const [activeAction, setActiveAction] = useState<"deposit" | "withdraw" | null>(null);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Financial Context
  const incomeTxs = transactions.filter((t) => t.type === "income");
  const expenseTxs = transactions.filter((t) => t.type === "expense");
  const income = calculateDineroTotal(incomeTxs, currency);
  const expense = calculateDineroTotal(expenseTxs, currency);
  const totalBalance = calculateDineroBalance([], expenseTxs, currency, dailyBudget);

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
      alert(t.insufficientFunds || "Insufficient funds for this withdrawal.");
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const selectedTrip = trips?.find(t => t.id === selectedTripId);
    
    let title = source.trim();
    if (!title) {
      title = activeAction === "deposit" ? (t.walletDeposit || "Wallet Deposit") : (t.walletWithdrawal || "Wallet Withdrawal");
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

    if (activeAction === "deposit") {
      const cObj = getCurrencyObj(currency);
      const currentDinero = dinero({ amount: toSubunits(dailyBudget, cObj), currency: cObj });
      const addDinero = dinero({ amount: toSubunits(val, cObj), currency: cObj });
      const newTotal = add(currentDinero, addDinero);
      setDailyBudget(Number(toDecimal(newTotal)));
    }

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
    <BottomSheet isOpen={isOpen} onClose={resetAndClose} isLight={isLight}>
      {/* Header Row */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <GlassIcon icon={Wallet} size="md" glow="purple" asChild />
                    <div>
                      <h2 className={`${activeTheme.textColor} text-2xl font-black tracking-tight flex items-center gap-2`}>
                        {t.wallet || "Wallet"} <Sparkles size={16} className="text-[#FFD166]" />
                      </h2>
                      <div className={`text-xs font-semibold tracking-wide ${isLight ? "text-slate-500" : "text-white/50"}`}>
                        {t.liquidityCenter || "Liquidity Center"}
                      </div>
                    </div>
                  </div>
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
                      <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">{t.availableBalance || "Available Balance"}</div>
                      <div className="text-white text-5xl font-black tracking-tighter drop-shadow-lg">
                        {formatCompactCurrency(totalBalance, currencySymbols[currency])}
                      </div>
                    </div>

                    <div className="mt-8">
                      <Sparkline data={sparklineData} color={isLight ? "#00E5FF" : "#7B61FF"} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
                      <div>
                        <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <ArrowDownRight size={12} /> {t.inflow || "Inflow"}
                        </div>
                        <div className="text-white font-bold text-sm">{currencySymbols[currency]}{income.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <ArrowUpRight size={12} /> {t.outflow || "Outflow"}
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
                        <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">{t.deposit || "Deposit"}</span>
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
                        <span className="font-bold text-sm text-rose-700 dark:text-rose-300">{t.withdraw || "Withdraw"}</span>
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
                          {activeAction === "deposit" ? (t.addFunds || "Add Funds") : (t.withdrawFunds || "Withdraw Funds")}
                        </h3>
                        <button type="button" onClick={() => setActiveAction(null)} className="text-sm font-bold opacity-60">{t.cancel || "Cancel"}</button>
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
                            {t.linkToTripOptional || "Link to Trip (Optional)"}
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
                                  {t.budgetLabel || "Budget:"} {currencySymbols[currency]}{trip.budget}
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
                          placeholder={t.walletNotePlaceholder || "Note (e.g. Salary, Rent)"}
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
                        {activeAction === "deposit" ? (t.confirmDeposit || "Confirm Deposit") : (t.confirmWithdrawal || "Confirm Withdrawal")}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Recent Transactions list (Context) */}
                {!activeAction && recentTxs.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 pt-6 border-t border-dashed border-gray-500/30">
                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 px-2 ${isLight ? "text-slate-500" : "text-white/40"}`}>
                      {t.recentActivity || "Recent Activity"}
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
                              <div className="font-bold text-sm">{translateDynamic(tx.title)}</div>
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

      {/* End Header Row... actually bottom of sheet */}
    </BottomSheet>
  );
}
