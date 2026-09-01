import cozifyLogo from "../../../assets/cozify-logo.png";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { GlassCard } from "../GlassCard";
import { GlassIcon } from "../GlassIcon";
import { SafeAvatar } from "../SafeAvatar";
import {
  User,
  Bell,
  Lock,
  Plane,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  LogIn,
  HardDrive,
  Cloud,
  CloudUpload,
  CloudDownload,
  ShieldCheck,
  RefreshCw,
  Check,
  Palette,
  Sun,
  Moon,
  Users,
  FileText,
  MessageSquareHeart,
  Smartphone,
  Info,
  Zap,
} from "lucide-react";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { useTripsStore } from "../../../store/useTripsStore";
import { useGoalsStore } from "../../../store/useGoalsStore";
import { useTranslation } from "../../../utils/translations";
import { formatCompactCurrency } from "../../../utils/formatters";
import { staggerContainer, staggerItem, triggerHaptic } from "../../../utils/motion";
import { logout } from "../../../services/firebase";
import { useNavigate } from "react-router";
import {
  uploadBackupToFirestore,
  downloadBackupFromFirestore,
  syncTripsToFirestore,
  downloadTripsFromFirestore,
  syncGoalsToFirestore,
  downloadGoalsFromFirestore,
} from "../../../services/firestoreService";
import { DesignModal } from "../modals/DesignModal";
import { ProfileSettingsModal } from "../modals/ProfileSettingsModal";
import { NotificationsModal } from "../modals/NotificationsModal";
import { PrivacyModal } from "../modals/PrivacyModal";
import { LanguageRegionModal } from "../modals/LanguageRegionModal";
import { AccountSwitcherModal } from "../modals/AccountSwitcherModal";
import { UserProfileModal } from "../modals/UserProfileModal";
import { FeedbackModal } from "../modals/FeedbackModal";
import { HelpCenterModal } from "../modals/HelpCenterModal";
import { PrivacyPolicyModal } from "../modals/PrivacyPolicyModal";
import { TermsConditionsModal } from "../modals/TermsConditionsModal";
import { BudgetModal } from "../modals/BudgetModal";
import { WalletModal } from "../modals/WalletModal";
import { TripsModal } from "../modals/TripsModal";
import { GoalsModal } from "../modals/GoalsModal";
import { getActiveThemeConfig } from "../../../utils/themePresets";

import { pageTitleClass, pageSubtitleClass } from "../../../utils/uiTokens";
import { useLongPress } from "../../../utils/useLongPress";
import { logger } from "../../../utils/logger";
import { useAdminIAM } from "../../../services/adminIamService";
import { calculateDineroBalance } from "../../../utils/dineroUtils";
export function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAdmin } = useAdminIAM();
  const {
    user,
    isAuthenticated,
    logoutUser,
    transactions,
    dailyBudget,
    customCategories,
    isCloudBackupEnabled,
    setCloudBackupEnabled,
    lastBackupTime,
    setLastBackupTime,
    restoreCloudState,
    colorMode,
    setColorMode,
    toggleColorMode,
    theme,
    activeModal,
    setActiveModal,
    currency,
    language,
    savedAccounts,
    appVersion,
    autoCheckUpdates,
    setAutoCheckUpdates,
  } = useBudgetStore();
  const { trips, tripsCount, setTrips } = useTripsStore();
  const { goals, setGoals } = useGoalsStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const isLight = !activeTheme.isDark;
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isTripsModalOpen, setIsTripsModalOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const accountLongPressHandlers = useLongPress({
    onLongPress: () => setIsAccountSwitcherOpen(true),
    onClick: () => setIsUserProfileOpen(true),
    delayMs: 500,
  });

  const [trialTimeLeft, setTrialTimeLeft] = useState("");

  useEffect(() => {
    if (!user?.uid?.startsWith("trial_") || !user.trialStartedAt) return;
    
    const TRIAL_LIMIT_MS = 3 * 24 * 60 * 60 * 1000;
    
    const updateTimer = () => {
      const remaining = user.trialStartedAt! + TRIAL_LIMIT_MS - Date.now();
      if (remaining <= 0) {
        setTrialTimeLeft("Expired");
      } else {
        const d = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const h = Math.floor((remaining / (1000 * 60 * 60)) % 24);
        const m = Math.floor((remaining / 1000 / 60) % 60);
        const s = Math.floor((remaining / 1000) % 60);
        setTrialTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const displayName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    (isAuthenticated ? "Authenticated User" : "Trial User");
  const email =
    user?.email ||
    user?.phoneNumber ||
    (isAuthenticated ? "Registered Account" : "Not signed in");
  const incomeTransactions = transactions.filter((t) => t.type === "income");
  const expenseTransactions = transactions.filter((t) => t.type === "expense");
  const balance = calculateDineroBalance(
    [],
    expenseTransactions,
    currency,
    dailyBudget
  );
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      logger.warn("Logout error:", err);
    }
    logoutUser();
    navigate("/login", { replace: true });
  };
  const handleBackupNow = async () => {
    if (!user?.uid) {
      setSyncStatus("Please sign in to backup data.");
      return;
    }
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const timeIso = await uploadBackupToFirestore(user.uid, {
        dailyBudget,
        transactions,
        customCategories,
        preferences: {
          theme,
          colorMode,
          currency,
          language,
        },
      });
      await syncTripsToFirestore(user.uid, trips);
      await syncGoalsToFirestore(user.uid, goals);
      setLastBackupTime(timeIso);
      setSyncStatus("Cloud backup complete!");
    } catch (err: any) {
      setSyncStatus(err?.message || "Backup failed.");
    } finally {
      setIsSyncing(false);
    }
  };
  const handleRestoreNow = async () => {
    if (!user?.uid) {
      setSyncStatus("Please sign in to restore backup.");
      return;
    }
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const backup = await downloadBackupFromFirestore(user.uid);
      if (backup) {
        restoreCloudState(backup);
        if (backup.updatedAtFormatted) {
          setLastBackupTime(backup.updatedAtFormatted);
        }

        const cloudTrips = await downloadTripsFromFirestore(user.uid);
        if (cloudTrips) setTrips(cloudTrips);

        const cloudGoals = await downloadGoalsFromFirestore(user.uid);
        if (cloudGoals) setGoals(cloudGoals);

        setSyncStatus("Data restored from Cloud!");
      } else {
        setSyncStatus("No cloud backup document found.");
      }
    } catch (err: any) {
      setSyncStatus(err?.message || "Restore failed.");
    } finally {
      setIsSyncing(false);
    }
  };
  const settingsSections = [
    ...(isAdmin
      ? [
          {
            title: "Executive Security & IAM",
            items: [
              {
                icon: ShieldCheck,
                label: "Admin Control Panel",
                badge: "IAM Root Admin",
                glow: "purple" as const,
                action: () => navigate("/admin"),
              },
            ],
          },
        ]
      : []),
    {
      title: t.account,
      items: [
        {
          icon: User,
          label: t.profileSettings,
          glow: "purple" as const,
          action: () => setActiveModal("profile-settings"),
        },
        {
          icon: Users,
          label: "Switch Accounts & Profiles",
          badge: savedAccounts.length > 1 ? `${savedAccounts.length} Saved` : undefined,
          glow: "blue" as const,
          action: () => setIsAccountSwitcherOpen(true),
        },
        {
          icon: Bell,
          label: t.notifications,
          glow: "blue" as const,
          action: () => setActiveModal("notifications"),
        },
        {
          icon: Lock,
          label: t.privacySecurity,
          glow: "pink" as const,
          action: () => setActiveModal("privacy-security"),
        },
      ],
    },
    {
      title: "Financial Management",
      items: [
        {
          icon: Zap,
          label: "Budget & Daily Limits",
          badge: `${currencySymbols[currency]}${dailyBudget.toLocaleString()}`,
          glow: "purple" as const,
          action: () => setIsBudgetModalOpen(true),
        },
        {
          icon: HardDrive,
          label: "Liquidity Wallet",
          glow: "pink" as const,
          action: () => setIsWalletModalOpen(true),
        },
        {
          icon: Plane,
          label: "Travel Trips & Plans",
          badge: tripsCount > 0 ? `${tripsCount} Active` : undefined,
          glow: "blue" as const,
          action: () => setIsTripsModalOpen(true),
        },
        {
          icon: Zap,
          label: "Savings Goals & Targets",
          badge: goals.length > 0 ? `${goals.length} Active` : undefined,
          glow: "purple" as const,
          action: () => setIsGoalsModalOpen(true),
        },
      ],
    },
    {
      title: t.preferences,
      items: [
        {
          icon: Palette,
          label: t.designThemes,
          glow: "pink" as const,
          action: () => setIsDesignModalOpen(true),
        },
        {
          icon: Globe,
          label: t.languageRegion,
          glow: "purple" as const,
          action: () => setActiveModal("language-region"),
        },
      ],
    },
    {
      title: "App & Version",
      items: [
        {
          icon: Smartphone,
          label: "coZify Version",
          badge: `v${appVersion}`,
          glow: "blue" as const,
          action: () => setActiveModal("app-version" as any),
        },
        {
          icon: RefreshCw,
          label: "Auto-Check for Updates",
          isToggle: true,
          toggleState: autoCheckUpdates,
          glow: "purple" as const,
          action: () => setAutoCheckUpdates(!autoCheckUpdates),
        }
      ],
    },
    {
      title: t.support,
      items: [
        {
          icon: MessageSquareHeart,
          label: "Give Feedback",
          badge: "New",
          glow: "pink" as const,
          action: () => setActiveModal("feedback" as any),
        },
        {
          icon: HelpCircle,
          label: t.help,
          badge: "24/7 FAQs",
          glow: "blue" as const,
          action: () => setActiveModal("help-center"),
        },
        {
          icon: ShieldCheck,
          label: "Privacy Policy",
          badge: "Local-First",
          glow: "purple" as const,
          action: () => setActiveModal("privacy-policy"),
        },
        {
          icon: FileText,
          label: "Terms & Conditions",
          badge: `v${appVersion}`,
          glow: "blue" as const,
          action: () => setActiveModal("terms-conditions"),
        },
        isAuthenticated
          ? {
              icon: LogOut,
              label: t.logout,
              glow: "pink" as const,
              action: handleLogout,
            }
          : {
              icon: LogIn,
              label: t.login,
              glow: "purple" as const,
              action: () => navigate("/login"),
            },
      ],
    },
  ];
  return (
    <div className="min-h-screen px-6 pt-12 pb-32">
      {" "}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {" "}
        <h1 className={`${textColor} ${pageTitleClass}`}>{t.profile}</h1>{" "}
        <div className={`${subtextColor} ${pageSubtitleClass}`}>
          {t.manageAccount}
        </div>{" "}
      </motion.div>{" "}
      <GlassCard
        className="mb-6 cursor-pointer select-none active:scale-[0.99] transition-all"
        onClick={() => setIsUserProfileOpen(true)}
        {...accountLongPressHandlers}
      >
        {" "}
        <div
          className="flex items-center gap-4 cursor-pointer select-none py-1 w-full"
          onClick={(e) => {
            e.stopPropagation();
            setIsUserProfileOpen(true);
          }}
          title="Tap to show user profile, hold to add/switch user"
        >
          {" "}
          <motion.div
            className="relative cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsUserProfileOpen(true);
            }}
          >
            {" "}
            <SafeAvatar
              src={user?.photoURL}
              name={displayName}
              size="2xl"
            />{" "}
          </motion.div>{" "}
          <div
            className="flex-1 cursor-pointer min-w-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsUserProfileOpen(true);
            }}
          >
            {" "}
            <div
              className={`${textColor} text-xl tracking-tight mb-1 capitalize font-bold truncate`}
            >
              {displayName}
            </div>{" "}
            <div className={`${subtextColor} text-xs tracking-tight truncate`}>
              {email}
            </div>{" "}
            {(user?.phoneNumber || user?.age || user?.gender) && (
              <div className="flex flex-wrap gap-1.5 mt-1.5 text-[10px]">
                {user?.phoneNumber && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20">
                    {user.phoneNumber}
                  </span>
                )}
                {(user?.age || user?.gender) && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                    {user?.age ? `${user.age} yrs` : ""} {user?.gender ? `• ${user.gender}` : ""}
                  </span>
                )}
              </div>
            )}
          </div>{" "}
          <div className="flex items-center gap-2">
            {" "}
            {!isAuthenticated ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/login");
                }}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer"
              >
                {" "}
                {t.signInBtn}{" "}
              </button>
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserProfileOpen(true);
                }}
                className="flex items-center p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                {" "}
                <ChevronRight className="w-5 h-5 text-white/40" />{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </GlassCard>{" "}

      {trialTimeLeft && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center justify-center text-center shadow-sm"
        >
          <div className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Zap size={12} className="fill-orange-500" /> Trial Mode
          </div>
          <div className="text-orange-400 font-mono text-xl font-black tracking-tighter">
            {trialTimeLeft}
          </div>
          <button 
            onClick={() => navigate("/login")}
            className="mt-2 text-[10px] font-bold text-orange-500 bg-orange-500/20 px-3 py-1 rounded-full hover:bg-orange-500/30 transition-colors"
          >
            Sign in to save data
          </button>
        </motion.div>
      )}

      <GlassCard className="mb-6">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div
              className={`${textColor} text-2xl tracking-tighter mb-1 font-black`}
            >
              {formatCompactCurrency(balance, currencySymbols[currency])}
            </div>
            <div
              className={`${subtextColor} text-xs tracking-tight font-medium`}
            >
              {t.balance}
            </div>
          </div>
          <div>
            <div
              className={`${textColor} text-2xl tracking-tighter mb-1 font-black`}
            >
              {transactions.length}
            </div>
            <div
              className={`${subtextColor} text-xs tracking-tight font-medium`}
            >
              {t.transactions}
            </div>
          </div>
          <div>
            <div
              className={`${textColor} text-2xl tracking-tighter mb-1 font-black`}
            >
              {tripsCount}
            </div>
            <div
              className={`${subtextColor} text-xs tracking-tight font-medium`}
            >
              Trips
            </div>
          </div>
          <div>
            <div
              className={`${textColor} text-2xl tracking-tighter mb-1 font-black`}
            >
              {goals.length}
            </div>
            <div
              className={`${subtextColor} text-xs tracking-tight font-medium`}
            >
              Goals
            </div>
          </div>
        </div>
      </GlassCard>
      {/* Cloud Storage & Local Privacy Section */}{" "}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {" "}
        <div
          className={`${subtextColor} mb-3 ml-2 tracking-tight flex items-center justify-between font-semibold`}
        >
          {" "}
          <span>Data Storage & Cloud Backup</span>{" "}
          <span 
            className="text-[10px] px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1"
            style={{ 
              color: activeTheme.primaryColor, 
              backgroundColor: `${activeTheme.primaryColor}33`,
              borderColor: `${activeTheme.primaryColor}4D`
            }}
          >
            {" "}
            <HardDrive size={10} /> Local-First Storage{" "}
          </span>{" "}
        </div>{" "}
        <GlassCard>
          {" "}
          <div className="space-y-4">
            {" "}
            {/* Storage Status Badge */}{" "}
            <div
              className={`flex items-center justify-between p-3 rounded-2xl border ${isLight ? "bg-slate-100/80 border-slate-200" : "bg-white/5 border-white/10"}`}
            >
              {" "}
              <div className="flex items-center gap-3">
                {" "}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeTheme.accentGradient} opacity-80 flex items-center justify-center`}>
                  {" "}
                  <ShieldCheck size={20} className="text-white drop-shadow-md" />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <div className={`${textColor} font-bold text-sm`}>
                    Phone Data Privacy
                  </div>{" "}
                  <div className={`${subtextColor} text-xs`}>
                    {" "}
                    {isCloudBackupEnabled
                      ? "Cloud Sync Enabled"
                      : "Data stored only on user phone"}{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {/* Cloud Backup Toggle */}{" "}
            <div
              className={`flex items-center justify-between p-3 rounded-2xl border ${isLight ? "bg-slate-100/80 border-slate-200" : "bg-white/5 border-white/10"}`}
            >
              {" "}
              <div className="flex items-center gap-3">
                {" "}
                <GlassIcon icon={Cloud} size="sm" glow="purple" asChild />{" "}
                <div>
                  {" "}
                  <div className={`${textColor} text-sm font-bold`}>
                    Cloud Backup & Sync
                  </div>{" "}
                  <div className={`${subtextColor} text-[11px]`}>
                    Sync data to Firestore database
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <button
                onClick={async () => {
                  const newState = !isCloudBackupEnabled;
                  setCloudBackupEnabled(newState);
                  if (user?.uid) {
                    try {
                      const { doc, setDoc } =
                        await import("firebase/firestore");
                      const { db } = await import("../../../services/firebase");
                      await setDoc(
                        doc(db, "users", user.uid),
                        { cloudSyncEnabled: newState },
                        { merge: true },
                      );
                    } catch (e) {
                      console.warn(
                        "Failed to update cloud sync preference in firestore",
                        e,
                      );
                    }
                  }
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${!isCloudBackupEnabled ? (isLight ? "bg-slate-300" : "bg-white/15") : ""}`}
                style={isCloudBackupEnabled ? { backgroundColor: activeTheme.primaryColor } : {}}
              >
                {" "}
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${isCloudBackupEnabled ? "translate-x-6" : "translate-x-0"}`}
                />{" "}
              </button>{" "}
            </div>{" "}
            {/* Sync / Restore Actions */}{" "}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {" "}
              <button
                onClick={handleBackupNow}
                disabled={isSyncing || !isAuthenticated}
                className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${isAuthenticated ? "text-white border-white/20 shadow-md cursor-pointer hover:scale-[1.02]" : "bg-slate-200/50 text-slate-400 border-slate-300 cursor-not-allowed"}`}
                style={isAuthenticated ? { background: `linear-gradient(to bottom right, ${activeTheme.primaryColor}, ${activeTheme.secondaryColor})` } : {}}
              >
                {" "}
                {isSyncing ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <CloudUpload size={15} />
                )}{" "}
                Backup Now{" "}
              </button>{" "}
              <button
                onClick={handleRestoreNow}
                disabled={isSyncing || !isAuthenticated}
                className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${isAuthenticated ? (isLight ? "bg-slate-200/80 hover:bg-slate-300 text-slate-900 border-slate-300 cursor-pointer" : "bg-white/10 hover:bg-white/15 text-white border-white/20 cursor-pointer") : "bg-slate-200/50 text-slate-400 border-slate-300 cursor-not-allowed"}`}
              >
                {" "}
                {isSyncing ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <CloudDownload size={15} />
                )}{" "}
                Restore Cloud{" "}
              </button>{" "}
            </div>{" "}
            {/* Sync Feedback Message */}{" "}
            {syncStatus && (
              <div className="text-center text-xs font-semibold text-primary pt-1">
                {" "}
                {syncStatus}{" "}
              </div>
            )}{" "}
            {lastBackupTime && (
              <div className={`text-center text-[10px] ${subtextColor} pt-1`}>
                {" "}
                Last Cloud Backup:{" "}
                {new Date(lastBackupTime).toLocaleString()}{" "}
              </div>
            )}{" "}
          </div>{" "}
        </GlassCard>{" "}
      </motion.div>{" "}
      {settingsSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
          className="mb-6"
        >
          {" "}
          <div
            className={`${subtextColor} mb-3 ml-2 tracking-tight font-semibold`}
          >
            {section.title}
          </div>{" "}
          <GlassCard>
            {" "}
            <motion.div 
              className="space-y-1"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {" "}
              {section.items.map((item) => (
                <motion.button
                  key={item.label}
                  variants={staggerItem}
                  onClick={(e) => {
                    triggerHaptic(15);
                    if (item.action) item.action(e as any);
                  }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${isLight ? "hover:bg-slate-100" : "hover:bg-white/5"}`}
                >
                  {" "}
                  <div className="flex items-center gap-2.5">
                    {" "}
                    <GlassIcon
                      icon={item.icon}
                      size="sm"
                      glow={item.glow}
                      asChild
                    />{" "}
                    <span
                      className={`${textColor} tracking-tight font-bold text-sm`}
                    >
                      {item.label}
                    </span>{" "}
                    {"badge" in item && item.badge && (
                      <span 
                        className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border"
                        style={{ 
                          color: activeTheme.primaryColor, 
                          backgroundColor: `${activeTheme.primaryColor}26`, 
                          borderColor: `${activeTheme.primaryColor}40` 
                        }}
                      >
                        {" "}
                        {item.badge}{" "}
                      </span>
                    )}{" "}
                  </div>{" "}
                  {"isToggle" in item ? (
                    <div
                      className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${!item.toggleState ? (isLight ? "bg-slate-300" : "bg-white/15") : ""}`}
                      style={item.toggleState ? { backgroundColor: activeTheme.primaryColor } : {}}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${item.toggleState ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </div>
                  ) : (
                    <ChevronRight
                      size={18}
                      className={isLight ? "text-slate-400" : "text-white/40"}
                    />
                  )}
                </motion.button>
              ))}{" "}
            </motion.div>{" "}
          </GlassCard>{" "}
        </motion.div>
      ))}{" "}
      <div className="flex flex-col items-center justify-center mb-8">
        {" "}
        <div
          className="relative group cursor-pointer mb-3 transition-all duration-300 group-hover:scale-105"
          onClick={() => navigate("/")}
        >
          {" "}
          <img
            src={cozifyLogo}
            alt="coZify Brand Logo"
            className={`h-16 w-auto object-contain transition-all duration-300 ${isLight ? "drop-shadow-sm" : "invert hue-rotate-180 brightness-110 drop-shadow-default"}`}
          />{" "}
        </div>{" "}
        <div className="flex items-center gap-2">
          {" "}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px] uppercase tracking-wider shadow-sm">
            {" "}
            v{appVersion}{" "}
          </span>{" "}
          <span
            className={`${subtextColor} text-xs font-semibold tracking-tight`}
          >
            {" "}
            Track • Manage • Grow{" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}
      <DesignModal
        isOpen={isDesignModalOpen}
        onClose={() => setIsDesignModalOpen(false)}
      />{" "}
      <ProfileSettingsModal
        isOpen={activeModal === "profile-settings"}
        onClose={() => setActiveModal(null)}
      />{" "}
      <NotificationsModal
        isOpen={activeModal === "notifications"}
        onClose={() => setActiveModal(null)}
      />{" "}
      <PrivacyModal
        isOpen={activeModal === "privacy-security"}
        onClose={() => setActiveModal(null)}
      />{" "}
      <LanguageRegionModal
        isOpen={activeModal === "language-region"}
        onClose={() => setActiveModal(null)}
      />{" "}
      <AccountSwitcherModal
        isOpen={isAccountSwitcherOpen}
        onClose={() => setIsAccountSwitcherOpen(false)}
      />{" "}
      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        onEditProfile={() => setActiveModal("profile-settings")}
        onSwitchUser={() => setIsAccountSwitcherOpen(true)}
      />{" "}
      <FeedbackModal
        isOpen={activeModal === "feedback"}
        onClose={() => setActiveModal(null)}
      />{" "}
      <HelpCenterModal
        isOpen={activeModal === "help-center"}
        onClose={() => setActiveModal(null)}
      />{" "}
      <PrivacyPolicyModal
        isOpen={activeModal === "privacy-policy"}
        onClose={() => setActiveModal(null)}
      />{" "}
      <TermsConditionsModal
        isOpen={activeModal === "terms-conditions"}
        onClose={() => setActiveModal(null)}
      />{" "}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />{" "}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />{" "}
      <TripsModal
        isOpen={isTripsModalOpen}
        onClose={() => setIsTripsModalOpen(false)}
      />{" "}
      <GoalsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
      />{" "}
    </div>
  );
}
