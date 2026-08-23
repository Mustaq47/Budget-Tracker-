// AdminShell — Root admin layout with auth guard, 5-tab nav, page transitions
// Security: blocks render if not admin, redirects to /login

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { useAdminIAM } from "../../../services/adminIamService";
import { useAdminData } from "../../hooks/useAdminData";
import { AdminHeader } from "./AdminHeader";
import { AdminBottomNav } from "./AdminBottomNav";
import { DashboardTab } from "../../tabs/DashboardTab";
import { UsersTab } from "../../tabs/UsersTab";
import { RevenueTab } from "../../tabs/RevenueTab";
import { AnalyticsTab } from "../../tabs/AnalyticsTab";
import { SettingsTab } from "../../tabs/SettingsTab";
import type { AdminTab, IamRoleAssignment, SupportTicket } from "../../types/admin.types";
import { useAdminStore } from "../../store/adminStore";

export function AdminShell() {
  const navigate = useNavigate();
  const { theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isDark = activeTheme.isDark;

  // Auth guard
  const { role, isSuperAdmin, userEmail, isLoading: iamLoading } = useAdminIAM();

  // Redirect non-admins
  useEffect(() => {
    if (!iamLoading && role === "USER") {
      navigate("/login", { replace: true });
    }
  }, [role, iamLoading, navigate]);

  // Data
  const data = useAdminData();
  const { activeTab, setActiveTab, setIamRoles, setTickets } = useAdminStore();

  const openTickets = data.tickets.filter(
    (t: any) => t.status === "OPEN" || t.status === "IN_PROGRESS"
  ).length;

  const bg = isDark ? "bg-[#121212]" : "bg-[#F8FAFC]";

  // Show loading shell while IAM is checking
  if (iamLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className={`text-xs font-bold ${isDark ? "text-[#94A3B8]" : "text-[#6B7280]"}`}>
            Verifying access...
          </span>
        </div>
      </div>
    );
  }

  // Block render if not admin (redirect effect above handles navigation)
  if (role === "USER") {
    return null;
  }

  const isTabLoading =
    (activeTab === "dashboard" && data.isLoading.dashboard) ||
    (activeTab === "users" && data.isLoading.dashboard) ||
    (activeTab === "analytics" && data.isLoading.analytics) ||
    (activeTab === "revenue" && data.isLoading.revenue) ||
    (activeTab === "settings" && data.isLoading.dashboard);

  return (
    <div className={`min-h-screen ${bg}`}>
      <AdminHeader
        userEmail={userEmail || undefined}
        role={role as any}
        isLoading={data.isAnyLoading}
        isDark={isDark}
        onRefresh={data.refreshCurrentTab}
        onBack={() => navigate("/profile")}
        lastRefresh={data.lastRefresh}
      />

      {/* Tab Content */}
      <main className="max-w-2xl mx-auto px-4 pt-5 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ type: "spring", damping: 28, stiffness: 280, duration: 0.25 }}
          >
            {activeTab === "dashboard" && (
              <DashboardTab
                metrics={data.dashboardMetrics}
                recentUsers={data.users}
                isLoading={isTabLoading}
                isDark={isDark}
              />
            )}
            {activeTab === "users" && (
              <UsersTab
                users={data.users}
                isLoading={isTabLoading}
                isDark={isDark}
              />
            )}
            {activeTab === "revenue" && (
              <RevenueTab
                revenue={data.revenue}
                isLoading={isTabLoading}
                isDark={isDark}
              />
            )}
            {activeTab === "analytics" && (
              <AnalyticsTab
                analytics={data.analytics}
                isLoading={isTabLoading}
                isDark={isDark}
              />
            )}
            {activeTab === "settings" && (
              <SettingsTab
                iamRoles={data.iamRoles as any}
                tickets={data.tickets as any}
                userEmail={userEmail || ""}
                isSuperAdmin={isSuperAdmin}
                isLoading={isTabLoading}
                isDark={isDark}
                onIamUpdate={(roles) => setIamRoles(roles)}
                onTicketUpdate={(tickets) => setTickets(tickets)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <AdminBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDark={isDark}
        openTickets={openTickets}
        role={role}
      />
    </div>
  );
}
