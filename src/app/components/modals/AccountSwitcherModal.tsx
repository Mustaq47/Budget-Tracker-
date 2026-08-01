import { motion, AnimatePresence } from "motion/react";
import { X, User, Check, Plus, Trash2, LogIn, Sparkles } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { useTranslation } from "../../../utils/translations";
import { SafeAvatar } from "../SafeAvatar";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { signInWithGoogleDirect } from "../../../services/firebase";
import { logger } from "../../../utils/logger";

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const avatarPresets = [
  "linear-gradient(135deg, #16A34A 0%, #3B82F6 100%)",
  "linear-gradient(135deg, #7B61FF 0%, #00E5FF 100%)",
  "linear-gradient(135deg, #FF4D8D 0%, #FF8F6B 100%)",
  "linear-gradient(135deg, #FFD166 0%, #F78C6A 100%)",
  "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
  "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
];

export function AccountSwitcherModal({ isOpen, onClose }: AccountSwitcherModalProps) {
  const navigate = useNavigate();
  const { user, savedAccounts = [], switchAccount, addSavedAccount, removeSavedAccount, setUser, theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(avatarPresets[0]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleSwitch = (uid: string) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }
    switchAccount(uid);
    onClose();
  };

  const handleRemove = (e: React.MouseEvent, uid: string) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([20, 20, 20]);
    }
    removeSavedAccount(uid);
  };

  const handleGoogleSwitch = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMsg("");
      const result = await signInWithGoogleDirect();
      const gUser = result?.user;
      if (gUser) {
        const profile = {
          uid: gUser.uid,
          email: gUser.email || "",
          displayName: gUser.displayName || gUser.email?.split("@")[0] || "Google User",
          photoURL: gUser.photoURL || avatarPresets[0],
          age: undefined,
          gender: undefined,
        };
        setUser(profile);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(50);
        }
        onClose();
      }
    } catch (err: any) {
      logger.error("Google account switch error:", err);
      setErrorMsg(err?.message || "Failed to switch account with Google.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!newDisplayName.trim()) {
      setErrorMsg("Please enter a display name.");
      return;
    }
    const email = newEmail.trim() || `${newDisplayName.toLowerCase().replace(/\s+/g, "")}@user.local`;
    const newUid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    addSavedAccount({
      uid: newUid,
      email,
      displayName: newDisplayName.trim(),
      photoURL: selectedAvatar,
      age: undefined,
      gender: undefined,
    });

    setNewDisplayName("");
    setNewEmail("");
    setShowAddForm(false);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className={`relative w-full max-w-md ${
              isLight
                ? "bg-[#F8FAFC] border-slate-200 text-slate-800"
                : "bg-[#0B0914] border-white/10 text-white"
            } border-t sm:border rounded-t-[36px] sm:rounded-[36px] p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-[111]`}
          >
            <div className={`w-12 h-1.5 rounded-full ${isLight ? "bg-slate-300" : "bg-white/20"} mx-auto mb-6`} />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <User size={20} className="text-purple-500" />
                </div>
                <div>
                  <h3 className={`text-lg font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    Switch Accounts
                  </h3>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-white/50"} tracking-tight`}>
                    Select or add a user profile
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`w-9 h-9 rounded-full ${
                  isLight
                    ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                } flex items-center justify-center border transition-colors cursor-pointer`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 mb-6 max-h-[45vh]">
              {savedAccounts.map((acc) => {
                const isActive = user?.uid === acc.uid;
                const bgStyle =
                  acc.photoURL?.startsWith("linear-gradient") || !acc.photoURL
                    ? { background: acc.photoURL || "linear-gradient(135deg, #16A34A 0%, #3B82F6 100%)" }
                    : {
                        backgroundImage: `url(${acc.photoURL})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      };

                return (
                  <motion.div
                    key={acc.uid}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSwitch(acc.uid)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-purple-500/15 border-purple-500/50 shadow-[0_0_20px_rgba(123,97,255,0.25)]"
                        : isLight
                        ? "bg-white border-slate-200/80 hover:border-slate-300 shadow-sm"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <SafeAvatar src={acc.photoURL} name={acc.displayName} size="md" />
                      <div>
                        <div className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-1.5 capitalize`}>
                          {acc.displayName || "User"}
                          {isActive && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500 text-white font-bold">
                              Active
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${isLight ? "text-slate-500" : "text-white/50"}`}>
                          {acc.email || "No email"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                          <Check size={14} className="text-emerald-500" />
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleRemove(e, acc.uid)}
                          className="w-7 h-7 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center border border-red-500/30 transition-colors cursor-pointer"
                          title="Remove profile"
                        >
                          <Trash2 size={13} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {savedAccounts.length === 0 && (
                <div className={`text-center py-6 ${isLight ? "text-slate-400" : "text-white/50"} text-xs`}>
                  No saved accounts found.
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="text-xs text-red-500 font-medium mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                {errorMsg}
              </div>
            )}

            {showAddForm ? (
              <form
                onSubmit={handleCreateAccount}
                className={`p-4 rounded-2xl ${
                  isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/5 border-white/10"
                } border space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-1.5`}>
                    <Sparkles size={14} className="text-purple-500" />
                    New Profile Details
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className={`text-xs ${isLight ? "text-slate-500 hover:text-slate-900" : "text-white/60 hover:text-white"}`}
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className={`text-[10px] ${isLight ? "text-slate-500" : "text-white/60"} font-semibold mb-1 block`}>
                    DISPLAY NAME
                  </label>
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="e.g. Alex (Business)"
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/40 border-white/10 text-white"
                    } border rounded-xl px-3 py-2 text-sm focus:border-purple-500 outline-none`}
                    required
                  />
                </div>

                <div>
                  <label className={`text-[10px] ${isLight ? "text-slate-500" : "text-white/60"} font-semibold mb-1 block`}>
                    EMAIL (OPTIONAL)
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/40 border-white/10 text-white"
                    } border rounded-xl px-3 py-2 text-sm focus:border-purple-500 outline-none`}
                  />
                </div>

                <div>
                  <label className={`text-[10px] ${isLight ? "text-slate-500" : "text-white/60"} font-semibold mb-1 block`}>
                    AVATAR PRESET
                  </label>
                  <div className="flex gap-2">
                    {avatarPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSelectedAvatar(preset)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          selectedAvatar === preset ? "border-white scale-110 shadow-md" : "border-transparent opacity-60"
                        }`}
                        style={{ background: preset }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Create & Switch Profile
                </button>
              </form>
            ) : (
              <div className="space-y-2.5">
                <button
                  onClick={handleGoogleSwitch}
                  disabled={isGoogleLoading}
                  className={`w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer ${
                    isGoogleLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs font-black text-blue-600 shrink-0 shadow-sm">
                    G
                  </div>
                  <span>{isGoogleLoading ? "Connecting with Google..." : "Switch / Add Account with Google"}</span>
                </button>

                <button
                  onClick={() => setShowAddForm(true)}
                  className={`w-full py-3 rounded-2xl ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                  } border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer`}
                >
                  <Plus size={16} className="text-purple-500" />
                  Add Local Profile
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
}
