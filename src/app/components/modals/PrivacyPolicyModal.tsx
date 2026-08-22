import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ShieldCheck,
  Lock,
  Database,
  Cloud,
  EyeOff,
  Trash2,
  Mail,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const { theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;

  if (!isOpen) return null;

  const sections = [
    {
      icon: Database,
      title: "1. Local-First Architecture & Data Collection",
      content:
        "coZify is designed with a Local-First architecture. All your financial transactions, daily budgets, custom categories, Wallet balances, Trips, and Goals are stored locally in your device's secure browser/app storage by default. We do not automatically upload your financial records to any remote server.",
    },
    {
      icon: EyeOff,
      title: "2. No Bank Connections (Manual Entry)",
      content:
        "coZify is a manual tracking application. We do not integrate with Plaid, Yodlee, or any other bank aggregation services. We never ask for, collect, or store your banking credentials, account numbers, or credit card details.",
    },
    {
      icon: Cloud,
      title: "3. Optional Cloud Backup & Sync",
      content:
        "If you choose to sign in with Google to enable Cloud Backup, your profile's basic information (email address, display name, and avatar picture) is authenticated via Google Firebase. When you initiate a backup, an encrypted copy of your data is stored in your private Google Firebase Cloud Firestore database.",
    },
    {
      icon: ShieldCheck,
      title: "4. Zero Tracking, Zero Ads & No Selling",
      content:
        "We never sell, rent, trade, or distribute your personal or financial data to advertisers, marketing companies, or data brokers. There are no third-party tracking cookies or advertising SDKs embedded in coZify.",
    },
    {
      icon: Lock,
      title: "5. Data Security & Encryption",
      content:
        "Your local records are protected by your device's built-in security. Data transmitted for Cloud Backup uses industry-standard TLS encryption in transit and is stored encrypted at rest on Google's infrastructure.",
    },
    {
      icon: Trash2,
      title: "6. Your Rights & Data Deletion",
      content:
        "You retain 100% ownership of your data. You can export a full JSON backup of your records or permanently delete all local and cloud data at any time using the 'Wipe Everything' feature under Account > Privacy & Security.",
    },
    {
      icon: UserCheck,
      title: "7. Developer & Privacy Contact",
      content:
        "For any privacy inquiries, data requests, or support regarding this policy, please contact the developer directly via email at mustaqsk47@gmail.com.",
    },
  ];

  const accentGradient = `linear-gradient(135deg, ${activeTheme.primaryColor}, ${activeTheme.secondaryColor})`;
  const accentGlow = `0 4px 15px ${activeTheme.primaryColor}30`;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className={`relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border ${activeTheme.bgClass} ${
              isLight ? "border-slate-200 text-slate-800" : "border-white/10 text-white"
            } backdrop-blur-2xl`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-6 py-5 border-b shrink-0 ${
                isLight ? "border-slate-200" : "border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: accentGradient, boxShadow: accentGlow }}
                >
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    Privacy Policy
                  </h2>
                  <p className={`text-xs font-medium ${isLight ? "text-slate-500" : "text-white/60"}`}>
                    coZify v1.0.0 • August 2026
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className={`p-2 rounded-full border transition-colors cursor-pointer ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Privacy Banner */}
              <div
                className="p-4 rounded-2xl border flex items-start gap-3"
                style={{
                  background: `${activeTheme.primaryColor}10`,
                  borderColor: `${activeTheme.primaryColor}25`,
                  color: isLight ? `${activeTheme.primaryColor}` : `${activeTheme.primaryColor}`,
                }}
              >
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: activeTheme.primaryColor }} />
                <div className={`text-xs leading-relaxed font-medium ${isLight ? "text-slate-800" : "text-white/90"}`}>
                  <span className="font-bold">Your Privacy is Protected:</span> coZify operates on a zero-knowledge local-first model. Your spending, budgets, and habits are your private business.
                </div>
              </div>

              {/* 3-Column Quick-Facts Bento */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { icon: Lock, label: "Zero-Knowledge", sub: "Local Encryption" },
                  { icon: Database, label: "100% Owned", sub: "Your Device Only" },
                  { icon: EyeOff, label: "No Tracking", sub: "Zero Ad SDKs" },
                ].map(({ icon: Icon, label, sub }, i) => (
                  <div key={i} className={`p-3 rounded-2xl border text-center ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"}`}>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                      style={{ background: `${activeTheme.primaryColor}15`, color: activeTheme.primaryColor }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>{label}</div>
                    <div className={`text-[9px] mt-0.5 ${isLight ? "text-slate-500" : "text-white/60"}`}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* Policy Sections */}
              <div className="space-y-3">
                {sections.map((sec, idx) => {
                  const IconComp = sec.icon;
                  const sectionNum = `0${idx + 1}`;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                        isLight ? "bg-slate-50 border-slate-200 hover:border-slate-300" : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div
                        className="absolute top-0 left-0 bottom-0 w-1 opacity-80"
                        style={{ background: accentGradient }}
                      />
                      <div className="flex items-center justify-between mb-2 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              isLight ? "bg-slate-200" : "bg-white/10"
                            }`}
                          >
                            <IconComp className="w-4 h-4" style={{ color: activeTheme.primaryColor }} />
                          </div>
                          <h4
                            className={`text-xs font-black tracking-tight ${
                              isLight ? "text-slate-900" : "text-white"
                            }`}
                          >
                            {sec.title}
                          </h4>
                        </div>
                        <span
                          className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded border"
                          style={{
                            background: `${activeTheme.primaryColor}10`,
                            borderColor: `${activeTheme.primaryColor}25`,
                            color: activeTheme.primaryColor,
                          }}
                        >
                          {sectionNum}
                        </span>
                      </div>
                      <p
                        className={`text-xs leading-relaxed pl-2 ${
                          isLight ? "text-slate-600 font-medium" : "text-white/70"
                        }`}
                      >
                        {sec.content}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Contact Card */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? "bg-slate-100 border-slate-200" : "border-white/10"
                }`}
                style={!isLight ? { background: `${activeTheme.primaryColor}10` } : {}}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                      Privacy Officer & Developer
                    </h4>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border"
                      style={{
                        background: `${activeTheme.primaryColor}20`,
                        borderColor: `${activeTheme.primaryColor}35`,
                        color: activeTheme.primaryColor,
                      }}
                    >
                      ⚡ Verified
                    </span>
                  </div>
                  <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-white/60"}`}>
                    Mustaq • mustaqsk47@gmail.com
                  </p>
                </div>
                <a
                  href="mailto:mustaqsk47@gmail.com?subject=coZify%20Privacy%20Policy%20Inquiry"
                  className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
                  style={{ background: accentGradient }}
                >
                  <Mail className="w-3.5 h-3.5" /> Direct Inquiry
                </a>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`px-6 py-4 border-t flex items-center justify-between shrink-0 ${
                isLight
                  ? "bg-slate-100 border-slate-200 text-slate-600"
                  : "bg-black/20 border-white/10 text-white/50"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: activeTheme.primaryColor }} />
                <span>coZify v1.0.0 • Verified Local-First Charter</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-white shadow-lg hover:opacity-90 flex items-center gap-1.5"
                  style={{ background: accentGradient, boxShadow: accentGlow }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Acknowledge & Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
}
