// Central Admin Data Orchestration Hook
// Loads all admin data with per-tab loading states

import { useCallback, useEffect } from "react";
import { useAdminStore } from "../store/adminStore";
import { getMonitoredUsers, getLoginAnalytics } from "../../services/adminMonitoringService";
import { getIamRoleAssignments } from "../../services/adminIamService";
import { getSupportTickets } from "../../services/supportQueryService";
import { getAnalyticsSummary } from "../services/adminAnalyticsService";
import { getRevenueMetrics } from "../services/adminRevenueService";
import type { DashboardMetrics, UserDirectoryEntry, IamRoleAssignment } from "../types/admin.types";

export function useAdminData() {
  const store = useAdminStore();

  const loadDashboard = useCallback(async () => {
    store.setLoading("dashboard", true);
    try {
      const [users, loginAnalytics, tickets, iamRoles] = await Promise.all([
        getMonitoredUsers(),
        getLoginAnalytics(),
        getSupportTickets(),
        getIamRoleAssignments(),
      ]);

      // Map to UserDirectoryEntry
      const userEntries: UserDirectoryEntry[] = users.map((u) => ({
        ...u,
        status: u.syncState === "FLAGGED" ? "SUSPENDED" : "ACTIVE",
      }));

      store.setUsers(userEntries);
      store.setTickets(tickets as any);
      store.setIamRoles(iamRoles as any);

      // Compute dashboard metrics
      const now = Date.now();
      const DAY = 86400000;
      const activeToday = users.filter(
        (u) => now - new Date(u.lastLoginAt).getTime() <= DAY
      ).length;
      const newUsersToday = users.filter(
        (u) => now - new Date(u.lastLoginAt).getTime() <= DAY
      ).length;

      const metrics: DashboardMetrics = {
        totalUsers: loginAnalytics.totalUserCount,
        activeToday,
        newUsersToday,
        syncedCloud: loginAnalytics.syncedCloudCount,
        offlineLocal: loginAnalytics.offlineLocalCount,
        openTickets: tickets.filter(
          (t: any) => t.status === "OPEN" || t.status === "IN_PROGRESS"
        ).length,
        adminRolesCount: iamRoles.length,
        v100AdoptionPercent: loginAnalytics.v100AdoptionPercent,
        googleLoginCount: users.filter((u) => (u as any).authMethod === "google").length,
        emailLoginCount: users.filter((u) => (u as any).authMethod !== "google").length,
        androidCount: users.filter((u) => u.platform === "Android").length,
        webCount: users.filter((u) => u.platform === "Web").length,
        iosCount: users.filter((u) => u.platform === "iOS").length,
      };

      store.setDashboardMetrics(metrics);
      store.setLastRefresh(new Date());
    } catch (e: any) {
      store.setError(e?.message || "Failed to load dashboard data");
    } finally {
      store.setLoading("dashboard", false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    store.setLoading("analytics", true);
    try {
      const summary = await getAnalyticsSummary();
      store.setAnalytics(summary);
    } catch (e: any) {
      store.setError(e?.message || "Failed to load analytics");
    } finally {
      store.setLoading("analytics", false);
    }
  }, []);

  const loadRevenue = useCallback(async () => {
    store.setLoading("revenue", true);
    try {
      const revenue = await getRevenueMetrics();
      store.setRevenue(revenue);
    } catch (e: any) {
      store.setError(e?.message || "Failed to load revenue");
    } finally {
      store.setLoading("revenue", false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadDashboard(), loadAnalytics(), loadRevenue()]);
  }, [loadDashboard, loadAnalytics, loadRevenue]);

  const refreshCurrentTab = useCallback(async () => {
    const tab = store.activeTab;
    if (tab === "dashboard" || tab === "users" || tab === "settings") await loadDashboard();
    else if (tab === "analytics") await loadAnalytics();
    else if (tab === "revenue") await loadRevenue();
  }, [store.activeTab, loadDashboard, loadAnalytics, loadRevenue]);

  useEffect(() => {
    loadAll();
  }, []);

  return {
    ...store,
    loadAll,
    refreshCurrentTab,
    isAnyLoading:
      store.isLoading.dashboard ||
      store.isLoading.analytics ||
      store.isLoading.revenue ||
      store.isLoading.users ||
      store.isLoading.settings,
  };
}
