import { useState } from "react";
import { motion } from "motion/react";
import { GlassCard } from "../GlassCard";
import { GlassIcon } from "../GlassIcon";
import { SafeAvatar } from "../SafeAvatar";
import { 
  User, Bell, Lock, CreditCard, Globe, HelpCircle, LogOut, ChevronRight, LogIn,
  HardDrive, Cloud, CloudUpload, CloudDownload, ShieldCheck, RefreshCw, Check, Palette,
  Sun, Moon, Users, FileText
} from "lucide-react";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { logout } from "../../../services/firebase";
import { useNavigate } from "react-router";
import { uploadBackupToFirestore, downloadBackupFromFirestore } from "../../../services/firestoreService";
import { DesignModal } from "../modals/DesignModal";
import { ProfileSettingsModal } from "../modals/ProfileSettingsModal";
import { NotificationsModal } from "../modals/NotificationsModal";
import { PrivacyModal } from "../modals/PrivacyModal";
import { LanguageRegionModal } from "../modals/LanguageRegionModal";
import { AccountSwitcherModal } from "../modals/AccountSwitcherModal";
import { UserProfileModal } from "../modals/UserProfileModal";
import { HelpCenterModal } from "../modals/HelpCenterModal";
import { PrivacyPolicyModal } from "../modals/PrivacyPolicyModal";
import { TermsConditionsModal } from "../modals/TermsConditionsModal";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { useTranslation } from "../../../utils/translations";
import { pageTitleClass, pageSubtitleClass } from "../../../utils/uiTokens";
import { useLongPress } from "../../../utils/useLongPress";
import { logger } from "../../../utils/logger";

export function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { 
    user, isAuthenticated, logoutUser, transactions, cardsCount,
    dailyBudget, cards, goals,
    isCloudBackupEnabled, setCloudBackupEnabled,
    lastBackupTime, setLastBackupTime, restoreCloudState,
    colorMode, setColorMode, toggleColorMode, theme,
    activeModal, setActiveModal, currency, savedAccounts
  } = useBudgetStore();

  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const isLight = !activeTheme.isDark;

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);

  const accountLongPressHandlers = useLongPress({
    onLongPress: () => setIsAccountSwitcherOpen(true),
    onClick: () => setIsUserProfileOpen(true),
    delayMs: 500,
  });

  const displayName = user?.displayName || user?.email?.split("@")[0] || (isAuthenticated ? "Authenticated User" : "Guest User");
  const email = user?.email || user?.phoneNumber || (isAuthenticated ? "Registered Account" : "Not signed in");

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = Math.max(0, income - expense);

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
        cards,
        goals,
      });
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
    {
      title: t.account,
      items: [
        { icon: User, label: t.profileSettings, glow: "purple" as const, action: () => setActiveModal("profile-settings") },
        { icon: Bell, label: t.notifications, glow: "blue" as const, action: () => setActiveModal("notifications") },
        { icon: Lock, label: t.privacySecurity, glow: "pink" as const, action: () => setActiveModal("privacy-security") },
      ],
    },
    {
      title: t.preferences,
      items: [
        { icon: Palette, label: t.designThemes, glow: "pink" as const, action: () => setIsDesignModalOpen(true) },
        { icon: CreditCard, label: t.paymentMethods, glow: "gold" as const, action: () => setActiveModal("cards") },
        { icon: Globe, label: t.languageRegion, glow: "purple" as const, action: () => setActiveModal("language-region") },
      ],
    },
    {
      title: t.support,
      items: [
        { icon: HelpCircle, label: t.help, glow: "blue" as const, action: () => setActiveModal("help-center") },
        { icon: ShieldCheck, label: "Privacy Policy", glow: "purple" as const, action: () => setActiveModal("privacy-policy") },
        { icon: FileText, label: "Terms & Conditions", glow: "blue" as const, action: () => setActiveModal("terms-conditions") },
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
    <div className="min-h-screen px-6 pt-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={`${textColor} ${pageTitleClass}`}>{t.profile}</h1>
        <div className={`${subtextColor} ${pageSubtitleClass}`}>{t.manageAccount}</div>
      </motion.div>

      <GlassCard
        className="mb-6 cursor-pointer select-none active:scale-[0.99] transition-all"
        glow
        glowColor="purple"
        onClick={() => setIsUserProfileOpen(true)}
        {...accountLongPressHandlers}
      >
        <div
          className="flex items-center gap-4 cursor-pointer select-none py-1 w-full"
          onClick={(e) => {
            e.stopPropagation();
            setIsUserProfileOpen(true);
          }}
          title="Tap to show user profile, hold to add/switch user"
        >
          <motion.div
            className="relative cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsUserProfileOpen(true);
            }}
          >
            <SafeAvatar src={user?.photoURL} name={displayName} size="2xl" />
          </motion.div>
          <div
            className="flex-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsUserProfileOpen(true);
            }}
          >
            <div className={`${textColor} text-xl tracking-tight mb-1 capitalize font-bold`}>{displayName}</div>
            <div className={`${subtextColor} text-xs tracking-tight`}>{email}</div>
          </div>
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/login");
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#3B82F6] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer"
              >
                {t.signInBtn}
              </button>
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserProfileOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-purple-300">Profile</span>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className={`${textColor} text-2xl tracking-tighter mb-1 font-black`}>
              {currencySymbols[currency]}{balance >= 1000 ? `${(balance / 1000).toFixed(1)}K` : balance}
            </div>
            <div className={`${subtextColor} text-xs tracking-tight font-medium`}>{t.balance}</div>
          </div>
          <div>
            <div className={`${textColor} text-2xl tracking-tighter mb-1 font-black`}>{transactions.length}</div>
            <div className={`${subtextColor} text-xs tracking-tight font-medium`}>{t.transactions}</div>
          </div>
          <div>
            <div className={`${textColor} text-2xl tracking-tighter mb-1 font-black`}>{cardsCount}</div>
            <div className={`${subtextColor} text-xs tracking-tight font-medium`}>{t.cards}</div>
          </div>
        </div>
      </GlassCard>

      {/* Cloud Storage & Local Privacy Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className={`${subtextColor} mb-3 ml-2 tracking-tight flex items-center justify-between font-semibold`}>
          <span>Data Storage & Cloud Backup</span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-bold border border-emerald-500/30 flex items-center gap-1">
            <HardDrive size={10} /> Local-First Storage
          </span>
        </div>

        <GlassCard glow glowColor="blue">
          <div className="space-y-4">
            
            {/* Storage Status Badge */}
            <div className={`flex items-center justify-between p-3 rounded-2xl border ${isLight ? "bg-slate-100/80 border-slate-200" : "bg-white/5 border-white/10"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16A34A]/20 to-[#3B82F6]/20 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-emerald-500" />
                </div>
                <div>
                  <div className={`${textColor} font-bold text-sm`}>Phone Data Privacy</div>
                  <div className={`${subtextColor} text-xs`}>
                    {isCloudBackupEnabled ? "Backup Enabled to Firestore" : "Data stored only on user phone"}
                  </div>
                </div>
              </div>
            </div>

            {/* Cloud Backup Toggle */}
            <div className={`flex items-center justify-between p-3 rounded-2xl border ${isLight ? "bg-slate-100/80 border-slate-200" : "bg-white/5 border-white/10"}`}>
              <div className="flex items-center gap-3">
                <GlassIcon icon={Cloud} size="sm" glow="purple" asChild />
                <div>
                  <div className={`${textColor} text-sm font-bold`}>Cloud Backup & Sync</div>
                  <div className={`${subtextColor} text-[11px]`}>Sync data to Firestore database</div>
                </div>
              </div>
              <button
                onClick={() => setCloudBackupEnabled(!isCloudBackupEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                  isCloudBackupEnabled ? "bg-emerald-500" : isLight ? "bg-slate-300" : "bg-white/15"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isCloudBackupEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Sync / Restore Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleBackupNow}
                disabled={isSyncing || !isAuthenticated}
                className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  isAuthenticated
                    ? "bg-gradient-to-r from-[#16A34A] to-[#3B82F6] text-white border-white/20 shadow-md cursor-pointer hover:scale-[1.02]"
                    : "bg-slate-200/50 text-slate-400 border-slate-300 cursor-not-allowed"
                }`}
              >
                {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <CloudUpload size={15} />}
                Backup Now
              </button>

              <button
                onClick={handleRestoreNow}
                disabled={isSyncing || !isAuthenticated}
                className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  isAuthenticated
                    ? isLight ? "bg-slate-200/80 hover:bg-slate-300 text-slate-900 border-slate-300 cursor-pointer" : "bg-white/10 hover:bg-white/15 text-white border-white/20 cursor-pointer"
                    : "bg-slate-200/50 text-slate-400 border-slate-300 cursor-not-allowed"
                }`}
              >
                {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <CloudDownload size={15} />}
                Restore Cloud
              </button>
            </div>

            {/* Sync Feedback Message */}
            {syncStatus && (
              <div className="text-center text-xs font-semibold text-[#00E5FF] pt-1">
                {syncStatus}
              </div>
            )}

            {lastBackupTime && (
              <div className={`text-center text-[10px] ${subtextColor} pt-1`}>
                Last Cloud Backup: {new Date(lastBackupTime).toLocaleString()}
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {settingsSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
          className="mb-6"
        >
          <div className={`${subtextColor} mb-3 ml-2 tracking-tight font-semibold`}>{section.title}</div>
          <GlassCard>
            <div className="space-y-1">
              {section.items.map((item) => (
                <motion.button
                  key={item.label}
                  onClick={item.action}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                    isLight ? "hover:bg-slate-100" : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GlassIcon icon={item.icon} size="sm" glow={item.glow} asChild />
                    <span className={`${textColor} tracking-tight font-bold text-sm`}>{item.label}</span>
                  </div>
                  <ChevronRight size={20} className={isLight ? "text-slate-400" : "text-white/40"} />
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      ))}

      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative group cursor-pointer" onClick={() => navigate("/")}>
          <img
            src="/cozify-logo.png"
            alt="coZify Brand Logo"
            className={`h-10 w-auto mb-3 object-contain transition-all duration-300 ${
              isLight
                ? "opacity-95 drop-shadow-sm group-hover:scale-105"
                : "invert hue-rotate-180 brightness-110 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)] group-hover:scale-105"
            }`}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px] uppercase tracking-wider shadow-sm">
            v1.0.0
          </span>
          <span className={`${subtextColor} text-xs font-semibold tracking-tight`}>
            Track • Manage • Grow
          </span>
        </div>
      </div>

      <DesignModal
        isOpen={isDesignModalOpen}
        onClose={() => setIsDesignModalOpen(false)}
      />

      <ProfileSettingsModal
        isOpen={activeModal === "profile-settings"}
        onClose={() => setActiveModal(null)}
      />

      <NotificationsModal
        isOpen={activeModal === "notifications"}
        onClose={() => setActiveModal(null)}
      />

      <PrivacyModal
        isOpen={activeModal === "privacy-security"}
        onClose={() => setActiveModal(null)}
      />

      <LanguageRegionModal
        isOpen={activeModal === "language-region"}
        onClose={() => setActiveModal(null)}
      />

      <AccountSwitcherModal
        isOpen={isAccountSwitcherOpen}
        onClose={() => setIsAccountSwitcherOpen(false)}
      />

      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        onEditProfile={() => setActiveModal("profile-settings")}
        onSwitchUser={() => setIsAccountSwitcherOpen(true)}
      />

      <HelpCenterModal
        isOpen={activeModal === "help-center"}
        onClose={() => setActiveModal(null)}
      />

      <PrivacyPolicyModal
        isOpen={activeModal === "privacy-policy"}
        onClose={() => setActiveModal(null)}
      />

      <TermsConditionsModal
        isOpen={activeModal === "terms-conditions"}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
