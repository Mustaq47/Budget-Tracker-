// Admin Panel — All TypeScript Interfaces & Types
// Material Design 3 compliant, zero hardcoded values

export type AdminTab = "dashboard" | "users" | "revenue" | "analytics" | "settings";

export type SyncState = "SYNCED" | "OFFLINE_LOCAL" | "PENDING" | "FLAGGED";
export type Platform = "Android" | "Web" | "iOS";
export type UserStatus = "ACTIVE" | "IDLE" | "SUSPENDED" | "DELETED";
export type AdminRole = "SUPER_ADMIN" | "SUPPORT_MODERATOR" | "ANALYST" | "USER";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "HIGH" | "MEDIUM" | "LOW";
export type TicketCategory = "GENERAL" | "BUG" | "LEGAL_PRIVACY" | "FEATURE_REQUEST" | "BILLING";

// ─── Metric Card ──────────────────────────────────────────────
export interface MetricCardData {
  label: string;
  value: string | number;
  delta?: number; // percent change
  deltaType?: "positive" | "negative" | "neutral";
  icon?: string;
  color?: "emerald" | "blue" | "purple" | "amber" | "red" | "slate";
  suffix?: string;
  source?: "firestore" | "computed" | "no_data";
}

// ─── Dashboard ────────────────────────────────────────────────
export interface DashboardMetrics {
  totalUsers: number;
  activeToday: number;
  newUsersToday: number;
  syncedCloud: number;
  offlineLocal: number;
  openTickets: number;
  adminRolesCount: number;
  v100AdoptionPercent: number;
  googleLoginCount: number;
  emailLoginCount: number;
  androidCount: number;
  webCount: number;
  iosCount: number;
}

// ─── User Directory ────────────────────────────────────────────
export interface UserDirectoryEntry {
  uid: string;
  email: string;
  displayName: string;
  syncState: SyncState;
  appVersion: string;
  platform: Platform;
  lastLoginAt: string;
  lastBackupAt?: string;
  status: UserStatus;
  stats: {
    transactionCount: number;
    cardsCount: number;
    goalsCount: number;
    localStorageSizeKb: number;
  };
}

// ─── Analytics ────────────────────────────────────────────────
export interface ActiveUsersMetrics {
  dau: number;   // Daily
  wau: number;   // Weekly
  mau: number;   // Monthly
  avgSessionMinutes: number;
  retentionPercent: number;
}

export interface ThemeAnalyticsEntry {
  theme: string;
  count: number;
  percent: number;
}

export interface FeatureUsageEntry {
  feature: string;
  usageCount: number;
  percent: number;
}

export interface AuthMethodBreakdown {
  google: number;
  email: number;
  phone: number;
}

export interface AnalyticsSummary {
  activeUsers: ActiveUsersMetrics;
  themeBreakdown: ThemeAnalyticsEntry[];
  featureUsage: FeatureUsageEntry[];
  authMethods: AuthMethodBreakdown;
  topPlatform: Platform;
  avgExpensePerTransaction: number;
  avgIncomePerTransaction: number;
}

// ─── Revenue ──────────────────────────────────────────────────
export interface RevenueValue {
  value: number;
  currency: string;
  source: "firestore" | "no_data";
}

export interface RevenueMetrics {
  today: RevenueValue;
  thisMonth: RevenueValue;
  thisYear: RevenueValue;
  mrr: RevenueValue;
  arr: RevenueValue;
  arpu: RevenueValue;       // Average Revenue Per User
  ltv: RevenueValue;        // Lifetime Value
  churnRate: RevenueValue;
  activeSubscriptions: number;
  trialUsers: number;
  countryBreakdown: Array<{ country: string; amount: number; currency: string }>;
  platformBreakdown: Array<{ platform: Platform; amount: number; percent: number }>;
}

// ─── Support Tickets ──────────────────────────────────────────
export interface SupportTicket {
  id: string;
  userEmail: string;
  userUid?: string;
  subject: string;
  question: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  reply?: {
    content: string;
    repliedBy: string;
    repliedAt: string;
  };
}

// ─── IAM ──────────────────────────────────────────────────────
export interface IamRoleAssignment {
  id: string;
  email: string;
  role: AdminRole;
  grantedBy: string;
  grantedAt: string;
  lastActiveAt?: string;
  permissions: {
    canManageUsers: boolean;
    canManageQueries: boolean;
    canManageIam: boolean;
    canExportLogs: boolean;
  };
}

// ─── Admin Store ───────────────────────────────────────────────
export interface AdminLoadingState {
  dashboard: boolean;
  users: boolean;
  revenue: boolean;
  analytics: boolean;
  settings: boolean;
}

export interface AdminStoreState {
  activeTab: AdminTab;
  isLoading: AdminLoadingState;
  error: string | null;
  lastRefresh: Date | null;
  users: UserDirectoryEntry[];
  dashboardMetrics: DashboardMetrics | null;
  analytics: AnalyticsSummary | null;
  revenue: RevenueMetrics | null;
  tickets: SupportTicket[];
  iamRoles: IamRoleAssignment[];
}

// ─── Table ────────────────────────────────────────────────────
export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
}
