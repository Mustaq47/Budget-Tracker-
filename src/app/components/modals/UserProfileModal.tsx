import { motion, AnimatePresence } from "motion/react";
import { X, User, Edit3, Users, ShieldCheck, Mail, Calendar, CreditCard, Award, TrendingDown, Target } from "lucide-react";
import { createPortal } from "react-dom";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { SafeAvatar } from "../SafeAvatar";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile: () => void;
  onSwitchUser: () => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  onEditProfile,
  onSwitchUser,
}: UserProfileModalProps) {
  const { user, isAuthenticated, transactions, cards, goals, currency, isCloudBackupEnabled, theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;

  if (!isOpen) return null;

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Guest User";
  const email = user?.email || user?.phoneNumber || "Not signed in";
  const currencySymbol = currencySymbols[currency] || currency;

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    {
      icon: TrendingDown,
      label: "Total Spent",
      value: `${currencySymbol}${totalExpense.toLocaleString()}`,
      color: "from-pink-500 to-rose-600",
    },
    {
      icon: Award,
      label: "Transactions",
      value: transactions.length.toString(),
      color: "from-purple-500 to-indigo-600",
    },
    {
      icon: CreditCard,
      label: "Cards",
      value: cards.length.toString(),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Target,
      label: "Goals",
      value: goals.length.toString(),
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className={`relative w-full max-w-md ${isLight
                ? "bg-[#F8FAFC] border-slate-200 text-slate-800"
                : "bg-[#0B0914] border-white/10 text-white"
              } border-t sm:border rounded-t-[36px] sm:rounded-[36px] p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-[111]`}
          >
            <div className={`w-12 h-1.5 rounded-full ${isLight ? "bg-slate-300" : "bg-white/20"} mx-auto mb-5`} />

            <button
              onClick={onClose}
              className={`absolute top-6 right-6 w-9 h-9 rounded-full ${isLight
                  ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                } flex items-center justify-center border transition-colors`}
            >
              <X size={16} />
            </button>

            {/* Profile Avatar & Name */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-3">
                <SafeAvatar
                  src={user?.photoURL}
                  name={user?.displayName || "User"}
                  size="2xl"
                  className="w-24 h-24 border-2 border-purple-500/40 shadow-[0_0_35px_rgba(123,97,255,0.4)]"
                />
                <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-[10px] font-black text-white uppercase tracking-wider shadow-lg">
                  PRO
                </div>
              </div>

              <h2 className={`text-2xl font-black ${isLight ? "text-slate-900" : "text-white"} tracking-tight capitalize mb-1`}>
                {displayName}
              </h2>
              <div className={`flex items-center gap-1.5 text-xs ${isLight ? "text-slate-500" : "text-white/60"} mb-2`}>
                <Mail size={12} className="text-purple-500" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Verified Member
                </span>
                <span className={`px-2.5 py-1 rounded-full ${isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-white/5 border-white/10 text-white/70"
                  } text-[10px] font-medium flex items-center gap-1 border`}>
                  <Calendar size={12} />
                  Member since 2026
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {stats.map((stat, idx) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/5 border-white/10"
                      } border flex items-center gap-3`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0 shadow-md`}>
                      <IconComponent size={18} className="text-white" />
                    </div>
                    <div>
                      <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-white/50"} uppercase font-semibold`}>
                        {stat.label}
                      </div>
                      <div className={`text-sm font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                        {stat.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Account Details */}
            <div className={`p-4 rounded-2xl ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/5 border-white/10"
              } border mb-6 space-y-2.5 text-xs`}>
              <div className={`flex items-center justify-between ${isLight ? "text-slate-600" : "text-white/70"}`}>
                <span>Account Currency</span>
                <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"} uppercase`}>{currency}</span>
              </div>
              <div className={`flex items-center justify-between ${isLight ? "text-slate-600" : "text-white/70"}`}>
                <span>Cloud Sync Status</span>
                <span className={`font-bold ${isCloudBackupEnabled ? "text-emerald-500" : "text-white/50"}`}>
                  {isCloudBackupEnabled ? "Enabled" : "Offline / Manual"}
                </span>
              </div>
              <div className={`flex items-center justify-between ${isLight ? "text-slate-600" : "text-white/70"}`}>
                <span>User ID</span>
                <span className={`font-mono text-[10px] ${isLight ? "text-slate-400" : "text-white/40"} truncate max-w-[150px]`}>
                  {user?.uid || "local-device-user"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onClose();
                  onEditProfile();
                }}
                className={`py-3 rounded-2xl ${isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                    : "bg-white/10 hover:bg-white/15 border-white/15 text-white"
                  } border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer`}
              >
                <Edit3 size={15} className="text-purple-500" />
                Edit Profile
              </button>

              <button
                onClick={() => {
                  onClose();
                  onSwitchUser();
                }}
                className="py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-opacity cursor-pointer"
              >
                <Users size={15} />
                Switch User
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
}
