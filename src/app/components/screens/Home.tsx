import { useState } from "react";
import { motion } from "motion/react";
import { GlassCard } from "../GlassCard";
import { GlassIcon } from "../GlassIcon";
import { TrendingUp, TrendingDown, Zap, DollarSign, Wallet, CreditCard } from "lucide-react";
import logo from "../../../imports/zeee.png";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { WalletModal } from "../modals/WalletModal";
import { CardsModal } from "../modals/CardsModal";
import { BudgetModal } from "../modals/BudgetModal";
import { GoalsModal } from "../modals/GoalsModal";

export function Home() {
  const { user, dailyBudget, transactions, activeModal, setActiveModal } = useBudgetStore();

  const userName = user?.displayName || user?.email?.split("@")[0] || "User";
  const todayISO = new Date().toISOString().split("T")[0];

  const spentToday = transactions
    .filter((t) => t.type === "expense" && t.date === todayISO)
    .reduce((sum, t) => sum + t.amount, 0);

  const percentage = Math.min(100, Math.round((spentToday / dailyBudget) * 100));
  const isOverBudget = percentage > 80;

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const quickActions = [
    { icon: Wallet, label: "Wallet", glow: "purple" as const, action: () => setActiveModal("wallet") },
    { icon: CreditCard, label: "Cards", glow: "blue" as const, action: () => setActiveModal("cards") },
    { icon: DollarSign, label: "Budget", glow: "pink" as const, action: () => setActiveModal("budget") },
    { icon: Zap, label: "Goals", glow: "gold" as const, action: () => setActiveModal("goals") },
  ];

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="min-h-screen px-6 pt-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12"
      >
        <img src={logo} alt="ZENTRO" className="h-12 mb-8" />
        <div className="text-white/60 mb-2 tracking-tight">Welcome back,</div>
        <h1 className="text-white text-3xl tracking-tighter capitalize">{userName}</h1>
      </motion.div>

      <div className="flex justify-center mb-12">
        <div className="relative w-80 h-80">
          <svg className="w-full h-full -rotate-90">
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7B61FF" />
                <stop offset="50%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#FF4D8D" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="20"
            />

            <motion.circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              filter="url(#glow)"
            />
          </svg>

          <motion.div
            onClick={() => setActiveModal("budget")}
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="text-white/60 mb-2 tracking-tight group-hover:text-white transition-colors">Spent Today</div>
            <motion.div
              className="text-white text-5xl tracking-tighter mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ₹{spentToday.toLocaleString()}
            </motion.div>
            <div className="text-white/40 tracking-tight group-hover:text-[#FF4D8D] font-bold transition-colors">
              of ₹{dailyBudget.toLocaleString()} <span className="text-[10px] underline ml-1">Tap to edit</span>
            </div>
            <motion.div
              className={`mt-4 px-4 py-2 rounded-full backdrop-blur-xl ${
                isOverBudget
                  ? "bg-[#FF4D8D]/20 text-[#FF4D8D] border border-[#FF4D8D]/30"
                  : "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30"
              } tracking-tight`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isOverBudget ? "⚠️ Watch your spending" : "✓ You're in control"}
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 60px rgba(123, 97, 255, 0.3)",
                "0 0 80px rgba(0, 229, 255, 0.4)",
                "0 0 60px rgba(255, 77, 141, 0.3)",
                "0 0 60px rgba(123, 97, 255, 0.3)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
      </div>

      <GlassCard className="mb-6">
        <div className="text-white/60 mb-4 tracking-tight">Quick Actions</div>
        <div className="grid grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
            >
              <GlassIcon icon={action.icon} size="md" glow={action.glow} asChild />
              <span className="text-xs text-white/60 tracking-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard glow glowColor="purple">
        <div className="text-white/60 mb-4 tracking-tight">Recent Activity</div>
        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-white/40 text-sm tracking-tight">
            No recent activity yet. Tap <span className="text-[#7B61FF] font-bold">+</span> to add your first transaction.
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10 ${
                      transaction.type === "income" ? "bg-[#00E5FF]/10" : "bg-white/5"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <TrendingUp size={18} className="text-[#00E5FF]" />
                    ) : (
                      <TrendingDown size={18} className="text-white/60" />
                    )}
                  </div>
                  <div>
                    <div className="text-white tracking-tight">{transaction.title}</div>
                    <div className="text-white/40 text-xs tracking-tight">{transaction.time || "Today"}</div>
                  </div>
                </div>
                <div
                  className={`tracking-tight ${
                    transaction.type === "income" ? "text-[#00E5FF]" : "text-white"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Quick Action Modals */}
      <WalletModal isOpen={activeModal === "wallet"} onClose={() => setActiveModal(null)} />
      <CardsModal isOpen={activeModal === "cards"} onClose={() => setActiveModal(null)} />
      <BudgetModal isOpen={activeModal === "budget"} onClose={() => setActiveModal(null)} />
      <GoalsModal isOpen={activeModal === "goals"} onClose={() => setActiveModal(null)} />
    </div>
  );
}
