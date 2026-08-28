import { motion, AnimatePresence } from "motion/react";
import {
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  Mail,
  UserCheck,
  Award,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";

interface TermsConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsConditionsModal({ isOpen, onClose }: TermsConditionsModalProps) {
  const { theme, colorMode, appVersion } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;

  if (!isOpen) return null;

  const sections = [
    {
      icon: CheckCircle2,
      title: "1. Acceptance of Terms",
      content:
        "By accessing, downloading, installing, or using the coZify application, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please discontinue use of the application.",
    },
    {
      icon: Award,
      title: "2. Purpose & Self-Directed Use",
      content:
        "coZify is a manual personal budgeting, expense tracking, and financial organization software tool. coZify is intended solely for personal informational use and does not provide financial, legal, tax, or investment advice.",
    },
    {
      icon: AlertCircle,
      title: "3. User Accuracy & Responsibilities",
      content:
        "Since coZify does not connect to banks, you are solely responsible for manually entering and ensuring the accuracy of all financial data, Wallet transactions, Trips, custom categories, card balances, and Savings Goals. The application calculates insights and progress based strictly on the data you manually provide.",
    },
    {
      icon: Lock,
      title: "4. Account Security & Cloud Backups",
      content:
        "If you use optional Google Sign-In for encrypted cloud backups, you are responsible for maintaining the confidentiality and security of your Google account credentials. You retain full ownership of all data stored locally or backed up to Google Firebase Cloud Firestore.",
    },
    {
      icon: ShieldCheck,
      title: "5. Intellectual Property",
      content:
        "All visual designs, custom themes, logos, iconography, source code, and user interface layouts within coZify are the exclusive intellectual property of the coZify developer.",
    },
    {
      icon: HelpCircle,
      title: "6. Limitation of Liability & 'As-Is' Provision",
      content:
        "coZify is provided 'as is' and 'as available' without warranty of any kind, express or implied. In no event shall the developer be liable for any direct, indirect, incidental, or consequential damages or data loss resulting from the use or inability to use the application.",
    },
    {
      icon: UserCheck,
      title: "7. Modifications & Developer Contact",
      content:
        "We reserve the right to update these Terms & Conditions as the application evolves. For any legal inquiries, support requests, or questions regarding these terms, contact the developer via email at mustaqsk47@gmail.com.",
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
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    Terms & Conditions
                  </h2>
                  <p className={`text-xs font-medium ${isLight ? "text-slate-500" : "text-white/60"}`}>
                    coZify v{appVersion} • August 2026
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
              {/* Executive Document Status Bar */}
              <div
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-[11px] font-extrabold border"
                style={{
                  background: `${activeTheme.primaryColor}10`,
                  borderColor: `${activeTheme.primaryColor}25`,
                  color: activeTheme.primaryColor,
                }}
              >
                <span>DOC ID: CZ-TOS-2026</span>
                <span>STATUS: ACTIVE AGREEMENT</span>
                <span>v{appVersion}</span>
              </div>

              {/* Legal Disclaimer Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  isLight
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                <div className="text-xs leading-relaxed font-medium">
                  <span className="font-bold">Important Legal Notice:</span> coZify is a self-directed personal budgeting software tool. It does not provide financial, legal, tax, or investment advice.
                </div>
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
                              isLight ? "bg-slate-200 text-slate-700" : "bg-white/10 text-white/80"
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

              {/* Contact Developer Card */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? "bg-slate-100 border-slate-200" : "border-white/10"
                }`}
                style={!isLight ? { background: `${activeTheme.primaryColor}10` } : {}}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-xs font-black ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      Legal & Compliance Contact
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
                  <p
                    className={`text-[11px] ${
                      isLight ? "text-slate-500" : "text-white/60"
                    }`}
                  >
                    Mustaq • mustaqsk47@gmail.com
                  </p>
                </div>
                <a
                  href="mailto:mustaqsk47@gmail.com?subject=coZify%20Terms%20and%20Conditions%20Inquiry"
                  className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
                  style={{ background: accentGradient }}
                >
                  <Mail className="w-3.5 h-3.5" /> Direct Legal Inquiry
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
                <span>coZify v{appVersion} • Verified Legal Charter</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-white shadow-lg hover:opacity-90 flex items-center gap-1.5"
                  style={{ background: accentGradient, boxShadow: accentGlow }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  I Agree & Accept Terms
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
