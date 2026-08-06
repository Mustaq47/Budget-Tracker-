// Admin Zustand Store
// Centralized state management for all admin dashboard data

import { create } from "zustand";
import type {
  AdminTab,
  AdminStoreState,
  AdminLoadingState,
  UserDirectoryEntry,
  DashboardMetrics,
  AnalyticsSummary,
  RevenueMetrics,
  SupportTicket,
  IamRoleAssignment,
} from "../types/admin.types";

interface AdminStoreActions {
  setActiveTab: (tab: AdminTab) => void;
  setLoading: (tab: keyof AdminLoadingState, value: boolean) => void;
  setError: (error: string | null) => void;
  setUsers: (users: UserDirectoryEntry[]) => void;
  setDashboardMetrics: (metrics: DashboardMetrics) => void;
  setAnalytics: (analytics: AnalyticsSummary) => void;
  setRevenue: (revenue: RevenueMetrics) => void;
  setTickets: (tickets: SupportTicket[]) => void;
  setIamRoles: (roles: IamRoleAssignment[]) => void;
  setLastRefresh: (date: Date) => void;
  resetError: () => void;
}

type AdminStore = AdminStoreState & AdminStoreActions;

const initialLoading: AdminLoadingState = {
  dashboard: false,
  users: false,
  revenue: false,
  analytics: false,
  settings: false,
};

export const useAdminStore = create<AdminStore>((set) => ({
  // State
  activeTab: "dashboard",
  isLoading: initialLoading,
  error: null,
  lastRefresh: null,
  users: [],
  dashboardMetrics: null,
  analytics: null,
  revenue: null,
  tickets: [],
  iamRoles: [],

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  setLoading: (tab, value) =>
    set((state) => ({
      isLoading: { ...state.isLoading, [tab]: value },
    })),

  setError: (error) => set({ error }),
  resetError: () => set({ error: null }),

  setUsers: (users) => set({ users }),
  setDashboardMetrics: (dashboardMetrics) => set({ dashboardMetrics }),
  setAnalytics: (analytics) => set({ analytics }),
  setRevenue: (revenue) => set({ revenue }),
  setTickets: (tickets) => set({ tickets }),
  setIamRoles: (iamRoles) => set({ iamRoles }),
  setLastRefresh: (date) => set({ lastRefresh: date }),
}));
