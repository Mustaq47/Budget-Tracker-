import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { useAdminIAM } from "../../services/adminIamService";
import { useBudgetStore } from "../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../utils/themePresets";

export function AdminProtectedRoute() {
  const { isAdmin, isLoading, role, userEmail } = useAdminIAM();
  const { theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? "bg-slate-50" : "bg-[#0f1123]"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className={`text-xs font-bold tracking-widest uppercase ${isLight ? "text-slate-500" : "text-white/60"}`}>
            Verifying IAM Credentials...
          </span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isLight ? "bg-slate-100" : "bg-[#0f1123]"}`}>
        <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl text-center ${
          isLight ? "bg-white border-slate-200" : "bg-white/5 border-white/10"
        }`}>
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className={`text-xl font-black tracking-tight mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>
            IAM Access Restricted
          </h1>
          <p className={`text-xs leading-relaxed mb-4 ${isLight ? "text-slate-600 font-medium" : "text-white/70"}`}>
            The coZify Executive Admin Control Panel is strictly protected by Role-Based Access Control (RBAC).
          </p>
          <div className={`p-3 rounded-xl border mb-6 text-left ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-black/30 border-white/10"
          }`}>
            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
              <span className={isLight ? "text-slate-500" : "text-white/50"}>CURRENT ACCOUNT:</span>
              <span className="text-red-400 font-mono">{userEmail}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className={isLight ? "text-slate-500" : "text-white/50"}>REQUIRED ROLE:</span>
              <span className="text-emerald-400">SUPER_ADMIN / MODERATOR</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 text-white text-xs font-extrabold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Profile
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
