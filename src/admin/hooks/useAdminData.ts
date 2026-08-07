// Central Admin Data Orchestration Hook
// Loads all admin data with per-tab loading states

import { useCallback, useEffect, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAdminStore } from "../store/adminStore";
import { getMonitoredUsers } from "../../services/adminMonitoringService";
import { APP_VERSION, DEFAULT_THEME } from "../../utils/constants";
import { getIamRoleAssignments } from "../../services/adminIamService";
import { getSupportTickets } from "../../services/supportQueryService";
import { getAnalyticsSummary } from "../services/adminAnalyticsService";
import { getRevenueMetrics } from "../services/adminRevenueService";
import type { DashboardMetrics, UserDirectoryEntry, IamRoleAssignment } from "../types/admin.types";

export function useAdminData() {
  const store = useAdminStore();
  // Keep a ref so the snapshot callback always sees the latest tickets/iamRoles
  const ticketsRef = useRef<any[]>([]);
  const iamRolesRef = useRef<any[]>([]);

  /** Rebuild dashboard metrics from a fresh users array */
  const rebuildMetrics = useCallback(
    (users: any[], tickets: any[], iamRoles: any[]) => {
      const now = Date.now();
      const DAY = 86400000;
      const activeToday = users.filter(
        (u) => now - new Date(u.lastLoginAt).getTime() <= DAY
      ).length;
      const newUsersToday = activeToday;
      const syncedCloud = users.filter((u) => u.syncState === "SYNCED").length;
      const offlineLocal = users.length - syncedCloud;
      const v100Count = users.filter((u) => u.appVersion === APP_VERSION).length;
      const v100AdoptionPercent =
        users.length > 0 ? Math.round((v100Count / users.length) * 100) : 100;

      const metrics: DashboardMetrics = {
        totalUsers: users.length,
        activeToday,
        newUsersToday,
        syncedCloud,
        offlineLocal,
        openTickets: tickets.filter(
          (t: any) => t.status === "OPEN" || t.status === "IN_PROGRESS"
        ).length,
        adminRolesCount: iamRoles.length,
        v100AdoptionPercent,
        googleLoginCount: users.filter((u: any) => u.authMethod === "google").length,
        emailLoginCount: users.filter((u: any) => u.authMethod !== "google").length,
        androidCount: users.filter((u: any) => u.platform === "Android").length,
        webCount: users.filter((u: any) => u.platform === "Web").length,
        iosCount: users.filter((u: any) => u.platform === "iOS").length,
      };

      const userEntries: UserDirectoryEntry[] = users.map((u: any) => ({
        ...u,
        status: u.syncState === "FLAGGED" ? "SUSPENDED" : "ACTIVE",
      }));

      store.setDashboardMetrics(metrics);
      store.setUsers(userEntries);
      store.setLastRefresh(new Date());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );


  const loadDashboard = useCallback(async () => {
    store.setLoading("dashboard", true);
    try {
      const [tickets, iamRoles] = await Promise.all([
        getSupportTickets(),
        getIamRoleAssignments(),
      ]);
      ticketsRef.current = tickets as any[];
      iamRolesRef.current = iamRoles as any[];
      store.setTickets(tickets as any);
      store.setIamRoles(iamRoles as any);

      // Fetch users once for initial load (snapshot will keep it live)
      const users = await getMonitoredUsers();
      rebuildMetrics(users, tickets as any[], iamRoles as any[]);
    } catch (e: any) {
      store.setError(e?.message || "Failed to load dashboard data");
    } finally {
      store.setLoading("dashboard", false);
    }
  }, [rebuildMetrics]);

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

  // ─── Real-time Firestore listener on users collection ────────────────────
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const users: any[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const email = (data.email || `user_${docSnap.id}@device.local`).toLowerCase();
          return {
            uid: docSnap.id,
            email,
            displayName: data.displayName || email.split("@")[0] || "coZify User",
            syncState: data.updatedAt ? "SYNCED" : "OFFLINE_LOCAL",
            appVersion: data.appVersion || APP_VERSION,
            platform: data.platform || "Android",
            lastLoginAt: data.lastLoginAt || new Date().toISOString(),
            lastBackupAt: data.updatedAt?.toDate?.()?.toISOString?.() || undefined,
            authMethod: data.authMethod || "email",
            stats: {
              transactionCount: data.transactionCount ?? 0,
              cardsCount: data.cardsCount ?? 0,
              goalsCount: data.goalsCount ?? 0,
              localStorageSizeKb: data.localStorageSizeKb ?? 0,
            },
          };
        });
        // Sort newest login first
        users.sort(
          (a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime()
        );
        rebuildMetrics(users, ticketsRef.current, iamRolesRef.current);
      },
      (err) => {
        console.warn("[AdminData] Firestore onSnapshot error:", err);
      }
    );
    return () => unsub();
  }, [rebuildMetrics]);

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
