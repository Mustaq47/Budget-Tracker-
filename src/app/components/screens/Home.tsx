import cozifyLogo from "../../../assets/cozify-logo.png";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { GlassCard } from "../GlassCard";
import { GlassIcon } from "../GlassIcon";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  DollarSign,
  Wallet,
  Plane,
} from "lucide-react";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { WalletModal } from "../modals/WalletModal";
import { TripsModal } from "../modals/TripsModal";
import { BudgetModal } from "../modals/BudgetModal";
import { GoalsModal } from "../modals/GoalsModal";
import { SafeToSpendModal } from "../modals/SafeToSpendModal";
import { SafeAvatar } from "../SafeAvatar";
import { useTranslation } from "../../../utils/translations";
import { useNavigate } from "react-router";
import {
  pageTitleClass,
  pageSubtitleClass,
  sectionTitleClass,
  incomeTextClass,
  expenseTextClass,
  getListItemCardClass,
} from "../../../utils/uiTokens";
import { useDailyBudget } from "../../hooks/useDailyBudget";
import { formatCompactCurrency } from "../../../utils/formatters";
import { staggerContainer, staggerItem, triggerHaptic, springConfig } from "../../../utils/motion";

export function Home() {
  const navigate = useNavigate();
  const {
    user,
    transactions,
    activeModal,
    setActiveModal,
    theme,
    colorMode,
    currency,
    lastBudgetSetMonth,
    setLastBudgetSetMonth,
    hasCompletedOnboarding,
  } = useBudgetStore();
  const { t, translateDynamic } = useTranslation();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const isLight = !activeTheme.isDark;
  const userName = user?.displayName || user?.email?.split("@")[0] || "User";

  useEffect(() => {
    if (hasCompletedOnboarding) {
      const currentMonth = new Date().toISOString().substring(0, 7);
      if (lastBudgetSetMonth !== currentMonth) {
        setLastBudgetSetMonth(currentMonth);
      }
    }
  }, [hasCompletedOnboarding, lastBudgetSetMonth, setLastBudgetSetMonth]);

  const {
    allowance,
    spent,
    remaining,
    percentage,
    status,
    feedback,
    label,
  } = useDailyBudget();
  const isOverBudget = status === "danger";
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;
  const quickActions = [
    {
      icon: Wallet,
      label: t.wallet || "Wallet",
      glow: "purple" as const,
      action: () => setActiveModal("wallet"),
    },
    {
      icon: Plane,
      label: t.trips || "Trips",
      glow: "gold" as const,
      action: () => setActiveModal("trips"),
    },
    {
      icon: DollarSign,
      label: t.budget || "Budget",
      glow: "pink" as const,
      action: () => setActiveModal("budget"),
    },
    {
      icon: Zap,
      label: t.goals || "Goals",
      glow: "blue" as const,
      action: () => setActiveModal("goals"),
    },
  ];
  const recentTransactions = transactions.slice(0, 5);
  return (
    <div className="min-h-screen px-6 pt-12 pb-32">
      {" "}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between mb-12 select-none"
      >
        {" "}
        <div
          className="flex items-center gap-4 cursor-pointer flex-1 min-w-0 pr-4"
          onClick={() => {
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate(30);
            }
            navigate("/profile");
          }}
        >
          {" "}
          <div className="relative shrink-0">
            {" "}
            <SafeAvatar
              src={user?.photoURL}
              name={userName}
              size="lg"
              className="w-14 h-14 border-2 border-white/20 shadow-md"
            />{" "}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0a0a1f] rounded-full" />{" "}
          </div>{" "}
          <div className="flex flex-col min-w-0 flex-1">
            {" "}
            <div className={`${subtextColor} ${pageSubtitleClass} font-medium truncate`}>
              {t.welcome},
            </div>{" "}
            <h1 className={`${textColor} ${pageTitleClass} truncate`}>
              {userName}
            </h1>{" "}
          </div>{" "}
        </div>{" "}
        <div
          onClick={() => navigate("/profile")}
          className="cursor-pointer transition-all duration-300 hover:scale-105 shrink-0"
        >
          {" "}
          <img
            src={cozifyLogo}
            alt="coZify"
            className={`h-12 w-auto object-contain transition-all duration-300 ${isLight ? "drop-shadow-sm" : "invert hue-rotate-180 brightness-110 drop-shadow-default"}`}
          />{" "}
        </div>{" "}
      </motion.div>{" "}
      <div className="flex justify-center mb-12">
        {" "}
        <div className="relative w-80 h-80">
          {" "}
          <svg className="w-full h-full -rotate-90">
            {" "}
            <defs>
              {" "}
              <linearGradient
                id="ringGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                {" "}
                <stop
                  offset="0%"
                  stopColor={activeTheme.ringGradient[0]}
                />{" "}
                <stop offset="50%" stopColor={activeTheme.ringGradient[1]} />{" "}
                <stop
                  offset="100%"
                  stopColor={activeTheme.ringGradient[2]}
                />{" "}
              </linearGradient>{" "}
              <filter id="glow">
                {" "}
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />{" "}
                <feMerge>
                  {" "}
                  <feMergeNode in="coloredBlur" />{" "}
                  <feMergeNode in="SourceGraphic" />{" "}
                </feMerge>{" "}
              </filter>{" "}
            </defs>{" "}
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke={
                isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)"
              }
              strokeWidth="20"
            />{" "}
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
            />{" "}
          </svg>{" "}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer select-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => {
              triggerHaptic(30);
              setActiveModal("safe-to-spend");
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
          >
            <div
              className={`${subtextColor} mb-2 tracking-tight font-semibold`}
            >
              {label}
            </div>
            <motion.div
              className={`${isOverBudget ? "text-red-500" : textColor} text-5xl tracking-tighter mb-2 font-black`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {formatCompactCurrency(remaining, currencySymbols[currency])}
            </motion.div>
            <div
              className={`${subtextColor} tracking-tight text-sm font-medium`}
            >
              {t.spent || "Spent"}:{" "}
              {formatCompactCurrency(spent, currencySymbols[currency])} /{" "}
              {formatCompactCurrency(allowance, currencySymbols[currency])}
            </div>
            <motion.div
              className={`mt-4 px-4 py-2 rounded-full backdrop-blur-xl ${status === "danger"
                  ? "bg-red-500/20 text-red-600 border border-red-500/30 font-bold"
                  : status === "warning"
                    ? "bg-amber-500/20 text-amber-600 border border-amber-500/30 font-bold"
                    : "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 font-bold"
                } tracking-tight text-xs`}
              animate={status === "danger" ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {status === "danger" ? (t.budgetExceeded || "⚠️ Budget Exceeded") : feedback}
            </motion.div>
          </motion.div>{" "}
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
          />{" "}
        </div>{" "}
      </div>{" "}
      <GlassCard className="mb-6">
        {" "}
        <div className={`${subtextColor} ${sectionTitleClass}`}>
          {t.quickActions || "Quick Actions"}
        </div>{" "}
        <div className="grid grid-cols-4 gap-4">
          {" "}
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              onClick={action.action}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              {" "}
              <GlassIcon
                icon={action.icon}
                size="md"
                glow={action.glow}
                asChild
              />{" "}
              <span
                className={`text-xs ${subtextColor} tracking-tight font-medium`}
              >
                {action.label}
              </span>{" "}
            </motion.button>
          ))}{" "}
        </div>{" "}
      </GlassCard>{" "}
      <GlassCard>
        {" "}
        <div className={`${subtextColor} ${sectionTitleClass}`}>
          {t.recentActivity || "Recent Activity"}
        </div>{" "}
        {recentTransactions.length === 0 ? (
          <div
            className={`py-8 text-center ${subtextColor} text-sm tracking-tight`}
          >
            {" "}
            {t.noRecentActivity || "No recent activity yet. Tap + to add your first transaction."}{" "}
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {" "}
            {recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id || index}
                variants={staggerItem}
                className={`flex items-center justify-between p-3.5 rounded-2xl border ${getListItemCardClass(isLight)}`}
              >
                {" "}
                <div className="flex items-center gap-3">
                  {" "}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl border ${transaction.type === "income" ? "bg-emerald-500/10 border-emerald-500/20" : isLight ? "bg-slate-200 border-slate-300" : "bg-white/5 border-white/10"}`}
                  >
                    {" "}
                    {transaction.type === "income" ? (
                      <TrendingUp size={18} className="text-emerald-500" />
                    ) : (
                      <TrendingDown
                        size={18}
                        className={isLight ? "text-slate-600" : "text-white/60"}
                      />
                    )}{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <div
                      className={`${textColor} tracking-tight font-bold text-sm`}
                    >
                      {translateDynamic(transaction.title)}
                    </div>{" "}
                    <div className={`${subtextColor} text-xs tracking-tight`}>
                      {transaction.time || "Today"}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div
                  className={
                    transaction.type === "income"
                      ? incomeTextClass
                      : expenseTextClass
                  }
                >
                  {" "}
                  {transaction.type === "income" ? "+" : "-"}
                  {currencySymbols[currency]}
                  {transaction.amount.toLocaleString()}{" "}
                </div>{" "}
              </motion.div>
            ))}{" "}
          </motion.div>
        )}{" "}
      </GlassCard>{" "}
      {/* Quick Action Modals */}
      <SafeToSpendModal
        isOpen={activeModal === "safe-to-spend"}
        onClose={() => setActiveModal(null)}
      />{" "}
      <WalletModal
        isOpen={activeModal === "wallet"}
        onClose={() => setActiveModal(null)}
      />{" "}
      <TripsModal
        isOpen={activeModal === "trips"}
        onClose={() => setActiveModal(null)}
      />{" "}
      <BudgetModal
        isOpen={activeModal === "budget"}
        onClose={() => setActiveModal(null)}
      />{" "}
      <GoalsModal
        isOpen={activeModal === "goals"}
        onClose={() => setActiveModal(null)}
      />{" "}
    </div>
  );
}
