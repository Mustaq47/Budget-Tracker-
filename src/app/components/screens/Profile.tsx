import { useState } from "react";
import { motion } from "motion/react";
import { GlassCard } from "../GlassCard";
import { GlassIcon } from "../GlassIcon";
import { 
  User, Bell, Lock, CreditCard, Globe, HelpCircle, LogOut, ChevronRight, LogIn,
  HardDrive, Cloud, CloudUpload, CloudDownload, ShieldCheck, RefreshCw, Check, Palette
} from "lucide-react";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { logout } from "../../../services/firebase";
import { useNavigate } from "react-router";
import { uploadBackupToFirestore, downloadBackupFromFirestore } from "../../../services/firestoreService";
import { DesignModal } from "../modals/DesignModal";

export function Profile() {
  const navigate = useNavigate();
  const { 
    user, isAuthenticated, logoutUser, transactions, cardsCount,
    dailyBudget, cards, goals,
    isCloudBackupEnabled, setCloudBackupEnabled,
    lastBackupTime, setLastBackupTime, restoreCloudState
  } = useBudgetStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);

  const displayName = user?.displayName || user?.email?.split("@")[0] || (isAuthenticated ? "Authenticated User" : "Guest User");
  const email = user?.email || user?.phoneNumber || (isAuthenticated ? "Registered Account" : "Not signed in");

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = Math.max(0, income - expense);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.warn("Logout error:", err);
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
      title: "Account",
      items: [
        { icon: User, label: "Profile Settings", glow: "purple" as const },
        { icon: Bell, label: "Notifications", glow: "blue" as const },
        { icon: Lock, label: "Privacy & Security", glow: "pink" as const },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: Palette, label: "Design & Themes", glow: "pink" as const, action: () => setIsDesignModalOpen(true) },
        { icon: CreditCard, label: "Payment Methods", glow: "gold" as const },
        { icon: Globe, label: "Language & Region", glow: "purple" as const },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", glow: "blue" as const },
        isAuthenticated
          ? {
              icon: LogOut,
              label: "Sign Out",
              glow: "pink" as const,
              action: handleLogout,
            }
          : {
              icon: LogIn,
              label: "Sign In / Register",
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
        <h1 className="text-white text-3xl tracking-tighter mb-2">Profile</h1>
        <div className="text-white/60 tracking-tight">Manage your account & privacy</div>
      </motion.div>

      <GlassCard className="mb-6" glow glowColor="purple">
        <div className="flex items-center gap-4">
          <motion.div className="relative" whileHover={{ scale: 1.05 }}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7B61FF] to-[#FF4D8D] flex items-center justify-center shadow-[0_0_30px_rgba(123,97,255,0.6)] overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-white" strokeWidth={1.5} />
              )}
            </div>
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7B61FF] to-[#FF4D8D] blur-xl opacity-50 pointer-events-none"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <div className="flex-1">
            <div className="text-white text-xl tracking-tight mb-1 capitalize">{displayName}</div>
            <div className="text-white/60 text-xs tracking-tight">{email}</div>
          </div>
          {!isAuthenticated && (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7B61FF] to-[#FF4D8D] text-white text-xs font-semibold shadow-md hover:opacity-90 transition-all cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </GlassCard>

      <GlassCard className="mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-white text-2xl tracking-tighter mb-1">
              ₹{balance >= 1000 ? `${(balance / 1000).toFixed(1)}K` : balance}
            </div>
            <div className="text-white/60 text-xs tracking-tight">Balance</div>
          </div>
          <div>
            <div className="text-white text-2xl tracking-tighter mb-1">{transactions.length}</div>
            <div className="text-white/60 text-xs tracking-tight">Transactions</div>
          </div>
          <div>
            <div className="text-white text-2xl tracking-tighter mb-1">{cardsCount}</div>
            <div className="text-white/60 text-xs tracking-tight">Cards</div>
          </div>
        </div>
      </GlassCard>

      {/* Cloud Storage & Local Privacy Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="text-white/60 mb-3 ml-2 tracking-tight flex items-center justify-between">
          <span>Data Storage & Cloud Backup</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
            <HardDrive size={10} /> Local-First Storage
          </span>
        </div>

        <GlassCard glow glowColor="blue">
          <div className="space-y-4">
            
            {/* Storage Status Badge */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#7B61FF]/20 border border-white/10 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-[#00E5FF]" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Phone Data Privacy</div>
                  <div className="text-white/50 text-xs">
                    {isCloudBackupEnabled ? "Backup Enabled to Firestore" : "Data stored only on user phone"}
                  </div>
                </div>
              </div>
            </div>

            {/* Cloud Backup Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <GlassIcon icon={Cloud} size="sm" glow="purple" asChild />
                <div>
                  <div className="text-white text-sm font-semibold">Cloud Backup & Sync</div>
                  <div className="text-white/40 text-[11px]">Sync data to Firestore database</div>
                </div>
              </div>
              <button
                onClick={() => setCloudBackupEnabled(!isCloudBackupEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                  isCloudBackupEnabled ? "bg-[#00E5FF]" : "bg-white/15"
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
                    ? "bg-gradient-to-r from-[#7B61FF] to-[#00E5FF] text-white border-white/20 shadow-md cursor-pointer hover:scale-[1.02]"
                    : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
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
                    ? "bg-white/10 hover:bg-white/15 text-white border-white/20 cursor-pointer hover:scale-[1.02]"
                    : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
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
              <div className="text-center text-[10px] text-white/40 pt-1">
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
          <div className="text-white/60 mb-3 ml-2 tracking-tight">{section.title}</div>
          <GlassCard>
            <div className="space-y-1">
              {section.items.map((item) => (
                <motion.button
                  key={item.label}
                  onClick={item.action}
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl transition-all hover:bg-white/5 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <GlassIcon icon={item.icon} size="sm" glow={item.glow} asChild />
                    <span className="text-white tracking-tight">{item.label}</span>
                  </div>
                  <ChevronRight size={20} className="text-white/40" />
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      ))}

      <div className="text-center text-white/40 text-xs tracking-tight mb-8">
        ZENTRO v1.0.0
      </div>

      <DesignModal
        isOpen={isDesignModalOpen}
        onClose={() => setIsDesignModalOpen(false)}
      />
    </div>
  );
}
