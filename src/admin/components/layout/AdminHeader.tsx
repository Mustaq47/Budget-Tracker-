// Admin Header — sticky, blurred, role badge
// M3 tokens, minimal editorial style

import React from "react";
import { motion } from "motion/react";
import { RefreshCw, ArrowLeft, ShieldCheck } from "lucide-react";
import type { AdminRole } from "../../types/admin.types";

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  SUPPORT_MODERATOR: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  ANALYST: "bg-teal-500/15 text-teal-500 border-teal-500/30",
  USER: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

interface AdminHeaderProps {
  userEmail?: string;
  role?: AdminRole;
  isLoading?: boolean;
  isDark: boolean;
  onRefresh: () => void;
  onBack: () => void;
  lastRefresh?: Date | null;
}

export function AdminHeader({
  userEmail,
  role,
  isLoading,
  isDark,
  onRefresh,
  onBack,
  lastRefresh,
}: AdminHeaderProps) {
  const headerBg = isDark
    ? "bg-[#1C1C1E]/75 border-white/5"
    : "bg-white/75 border-slate-200/50";
  const titleColor = isDark ? "text-white" : "text-[#111827]";
  const subColor = isDark ? "text-white/50" : "text-[#6B7280]";
  const btnBg = isDark
    ? "bg-white/5 border-white/10 text-white hover:bg-white/10 shadow-sm"
    : "bg-white border-slate-200/50 text-[#6B7280] hover:bg-slate-50 shadow-sm";

  const roleStyle = role ? ROLE_STYLES[role] || ROLE_STYLES["USER"] : ROLE_STYLES["USER"];

  const refreshLabel = lastRefresh
    ? `Updated ${new Date(lastRefresh).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "Refresh";

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-2xl ${headerBg}`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: back + title */}
        <div className="flex items-center gap-3 min-w-0">
          <motion.button
            onClick={onBack}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-xl border flex-shrink-0 transition-colors cursor-pointer ${btnBg}`}
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <h1 className={`text-base font-black tracking-tight truncate ${titleColor}`}>
                Admin Control
              </h1>
              {role && (
                <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border flex-shrink-0 ${roleStyle}`}>
                  {role.replace(/_/g, " ")}
                </span>
              )}
            </div>
            {userEmail && (
              <p className={`text-[10px] truncate mt-0.5 ${subColor}`}>{userEmail}</p>
            )}
          </div>
        </div>

        {/* Right: refresh */}
        <motion.button
          onClick={onRefresh}
          whileTap={{ scale: 0.9 }}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer flex-shrink-0 ${btnBg}`}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">{refreshLabel}</span>
        </motion.button>
      </div>
    </header>
  );
}
