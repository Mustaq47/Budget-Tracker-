import React, { useState } from "react";
import cozifyLogo from "../../../assets/cozify-logo.png";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Award,
  UserCheck,
  HelpCircle,
  LogOut,
  XCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import { App } from "@capacitor/app";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { logout } from "../../../services/firebase";

export function MandatoryTermsModal() {
  const { isAuthenticated, hasAcceptedTerms, setHasAcceptedTerms, logoutUser, theme, colorMode } = useBudgetStore();
  const [agreed, setAgreed] = useState(false);
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;

  // Only show if user is authenticated AND has not accepted Terms & Conditions
  if (!isAuthenticated || hasAcceptedTerms) return null;

  const sections = [
    {
      icon: CheckCircle2,
      title: "1. Acceptance of Terms",
      content:
        "By accessing, downloading, or using coZify, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, the application will close.",
    },
    {
      icon: Award,
      title: "2. Purpose & Self-Directed Use",
      content:
        "coZify is a personal budgeting and financial tracking application intended solely for informational organization. It does not provide financial, legal, tax, or investment advice.",
    },
    {
      icon: AlertCircle,
      title: "3. User Responsibilities & Accuracy",
      content:
        "You are solely responsible for the accuracy of all transaction records, budgets, and card information entered into coZify.",
    },
    {
      icon: Lock,
      title: "4. Account Security & Cloud Backups",
      content:
        "If using Google Sign-In for encrypted cloud backups, you remain responsible for maintaining the confidentiality of your Google credentials. You retain full ownership of your data.",
    },
    {
      icon: ShieldCheck,
      title: "5. Intellectual Property & Zero-Tracking",
      content:
        "All application layouts, logos, themes, and code are the exclusive property of coZify. coZify never sells user data or shows advertisements.",
    },
    {
      icon: HelpCircle,
      title: "6. Limitation of Liability",
      content:
        "coZify is provided 'as is' without warranty of any kind. The developer is not liable for any direct or indirect damages or data loss.",
    },
    {
      icon: UserCheck,
      title: "7. Developer Contact",
      content:
        "For any inquiries regarding these Terms & Conditions, contact the developer at mustaqsk47@gmail.com.",
    },
  ];

  const handleAccept = () => {
    if (!agreed) return;
    setHasAcceptedTerms(true);
  };

  const handleDeclineAndExit = async () => {
    try {
      // Exit native mobile app via Capacitor
      await App.exitApp();
    } catch (_) {
      // Ignore if running in web browser
    }
    // Logout and close window if web
    try {
      await logout();
    } catch (_) {}
    logoutUser();
    if (typeof window !== "undefined") {
      try {
        window.close();
      } catch (_) {}
      window.location.href = "/login";
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border ${
          isLight
            ? "bg-white/95 border-slate-200 text-slate-800"
            : "bg-[#0f1123]/95 border-white/15 text-white"
        } backdrop-blur-2xl`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-5 border-b shrink-0 ${
            isLight ? "border-slate-200 bg-slate-50/80" : "border-white/10 bg-white/5"
          }`}
        >
          <div className="flex items-center gap-3">
            <img
              src={cozifyLogo}
              alt="coZify Logo"
              className={`h-12 w-auto object-contain transition-all duration-300 ${
                isLight
                  ? "drop-shadow-sm"
                  : "invert hue-rotate-180 brightness-110 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              }`}
            />
            <div>
              <h2 className={`text-lg font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                Welcome to coZify
              </h2>
              <p className={`text-xs font-semibold ${isLight ? "text-blue-600" : "text-blue-400"}`}>
                Mandatory Terms & Conditions Agreement
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
            Action Required
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isLight
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-amber-500/10 border-amber-500/20 text-amber-300"
            }`}
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            <div className="text-xs leading-relaxed font-medium">
              <span className="font-bold">Required to continue:</span> After creating your account, you must accept our Terms & Conditions to use coZify. If you decline, the application will close.
            </div>
          </div>

          {/* Clauses list */}
          <div className="space-y-3">
            {sections.map((sec, idx) => {
              const IconComp = sec.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        isLight ? "bg-slate-200 text-slate-700" : "bg-white/10 text-white/80"
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <h4
                      className={`text-xs font-bold ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {sec.title}
                    </h4>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      isLight ? "text-slate-600 font-medium" : "text-white/70"
                    }`}
                  >
                    {sec.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agreement Checkbox Bar */}
        <div
          className={`px-6 py-4 border-t shrink-0 ${
            isLight
              ? "bg-slate-50 border-slate-200"
              : "bg-black/30 border-white/10"
          }`}
        >
          <label
            onClick={() => setAgreed(!agreed)}
            className="flex items-center gap-3 cursor-pointer select-none mb-4"
          >
            <div
              className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                agreed
                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/30"
                  : isLight
                  ? "border-slate-300 bg-white"
                  : "border-white/20 bg-white/5"
              }`}
            >
              {agreed && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
            <span
              className={`text-xs font-bold ${
                isLight ? "text-slate-800" : "text-white"
              }`}
            >
              I have read, understand, and agree to the coZify Terms & Conditions.
            </span>
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDeclineAndExit}
              className={`flex-1 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isLight
                  ? "bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-700"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
              }`}
            >
              <XCircle className="w-4 h-4 text-red-500" />
              Decline & Exit App
            </button>

            <button
              onClick={handleAccept}
              disabled={!agreed}
              className={`flex-1 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                agreed
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/30 hover:opacity-95"
                  : isLight
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Accept & Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
}
