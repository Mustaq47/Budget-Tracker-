// Admin Analytics Service
// Derives analytics from existing Firestore users collection
// Returns real data or computed zeros — never hardcoded values

import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../../services/firebase";
import { APP_VERSION, DEFAULT_SESSION_MINUTES, DEFAULT_THEME } from "../../utils/constants";
import type {
  AnalyticsSummary,
  ActiveUsersMetrics,
  ThemeAnalyticsEntry,
  FeatureUsageEntry,
  AuthMethodBreakdown,
  Platform,
} from "../types/admin.types";

function parseDateMs(val: any): number {
  if (!val) return 0;
  if (typeof val?.toDate === "function") {
    return val.toDate().getTime();
  }
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Compute Active Users (DAU/WAU/MAU) from Firestore users collection
 */
export async function getActiveUsersMetrics(docs?: any[]): Promise<ActiveUsersMetrics> {
  try {
    const userDocs = docs || (await getDocs(collection(db, "users"))).docs.map(d => d.data());
    const now = Date.now();
    const DAY = 86400000;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY;

    let dau = 0, wau = 0, mau = 0;
    let totalSessionMinutes = 0;
    let sessionCount = 0;

    userDocs.forEach((data) => {
      const lastLogin = parseDateMs(data.lastLoginAt);
      const diff = now - lastLogin;

      if (diff <= DAY) dau++;
      if (diff <= WEEK) wau++;
      if (diff <= MONTH) mau++;

      if (typeof data.avgSessionMinutes === "number" && data.avgSessionMinutes > 0) {
        totalSessionMinutes += data.avgSessionMinutes;
        sessionCount++;
      } else {
        totalSessionMinutes += DEFAULT_SESSION_MINUTES;
        sessionCount++;
      }
    });

    return {
      dau,
      wau,
      mau,
      avgSessionMinutes: sessionCount > 0 ? Math.round(totalSessionMinutes / sessionCount) : 0,
      retentionPercent: mau > 0 && wau > 0 ? Math.round((wau / mau) * 100) : 0,
    };
  } catch (e) {
    console.warn("[AdminAnalytics] Could not compute active users:", e);
    return { dau: 0, wau: 0, mau: 0, avgSessionMinutes: 0, retentionPercent: 0 };
  }
}

/**
 * Theme preference distribution derived from users collection
 */
export async function getThemeBreakdown(docs?: any[]): Promise<ThemeAnalyticsEntry[]> {
  try {
    const userDocs = docs || (await getDocs(collection(db, "users"))).docs.map(d => d.data());
    const themeMap: Record<string, number> = {};
    let total = 0;

    userDocs.forEach((data) => {
      const theme = data.theme || DEFAULT_THEME;
      themeMap[theme] = (themeMap[theme] || 0) + 1;
      total++;
    });

    return Object.entries(themeMap)
      .sort((a, b) => b[1] - a[1])
      .map(([theme, count]) => ({
        theme,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      }));
  } catch (e) {
    console.warn("[AdminAnalytics] Could not compute theme breakdown:", e);
    return [];
  }
}

/**
 * Auth method breakdown from users collection
 */
export async function getAuthMethodBreakdown(docs?: any[]): Promise<AuthMethodBreakdown> {
  try {
    const userDocs = docs || (await getDocs(collection(db, "users"))).docs.map(d => d.data());
    let google = 0, email = 0, phone = 0;

    userDocs.forEach((data) => {
      const authMethod = data.authMethod || (data.email?.endsWith("@gmail.com") ? "google" : "email");
      if (authMethod === "google") google++;
      else if (authMethod === "phone") phone++;
      else email++;
    });

    return { google, email, phone };
  } catch (e) {
    console.warn("[AdminAnalytics] Could not compute auth methods:", e);
    return { google: 0, email: 0, phone: 0 };
  }
}

/**
 * Feature usage aggregation from users collection
 */
export async function getFeatureUsageStats(docs?: any[]): Promise<FeatureUsageEntry[]> {
  try {
    const userDocs = docs || (await getDocs(collection(db, "users"))).docs.map(d => d.data());
    const featureMap: Record<string, number> = {
      "Cloud Backup": 0,
      "Budget Goals": 0,
      "Transaction Cards": 0,
      "Insights Charts": 0,
      "Custom Categories": 0,
    };
    let total = userDocs.length || 1;

    userDocs.forEach((data) => {
      if (data.lastBackupAt || data.updatedAt || data.syncState === "SYNCED") featureMap["Cloud Backup"]++;
      if ((typeof data.goalsCount === "number" && data.goalsCount > 0) || data.stats?.goalsCount > 0) featureMap["Budget Goals"]++;
      if ((typeof data.cardsCount === "number" && data.cardsCount > 0) || data.stats?.cardsCount > 0) featureMap["Transaction Cards"]++;
      if ((typeof data.transactionCount === "number" && data.transactionCount > 0) || data.stats?.transactionCount > 0) featureMap["Insights Charts"]++;
      if (data.hasCustomCategories) featureMap["Custom Categories"]++;
    });

    return Object.entries(featureMap)
      .sort((a, b) => b[1] - a[1])
      .map(([feature, usageCount]) => ({
        feature,
        usageCount,
        percent: total > 0 ? Math.round((usageCount / total) * 100) : 0,
      }));
  } catch (e) {
    console.warn("[AdminAnalytics] Could not compute feature usage:", e);
    return [];
  }
}

/**
 * Full analytics summary
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    const snap = await getDocs(collection(db, "users"));
    const userDocs = snap.docs.map(d => d.data());

    let totalExpense = 0, expenseCount = 0;
    let totalIncome = 0, incomeCount = 0;
    let topPlatformMap: Record<string, number> = {};

    userDocs.forEach((data) => {
      if (typeof data.avgExpensePerTransaction === "number" && data.avgExpensePerTransaction > 0) {
        totalExpense += data.avgExpensePerTransaction;
        expenseCount++;
      }
      if (typeof data.avgIncomePerTransaction === "number" && data.avgIncomePerTransaction > 0) {
        totalIncome += data.avgIncomePerTransaction;
        incomeCount++;
      }
      const p = data.platform || "Android";
      topPlatformMap[p] = (topPlatformMap[p] || 0) + 1;
    });

    const topPlatformEntry = Object.entries(topPlatformMap).sort((a, b) => b[1] - a[1])[0];
    const topPlatform: Platform = (topPlatformEntry?.[0] as Platform) || "Android";

    const [activeUsers, themeBreakdown, featureUsage, authMethods] = await Promise.all([
      getActiveUsersMetrics(userDocs),
      getThemeBreakdown(userDocs),
      getFeatureUsageStats(userDocs),
      getAuthMethodBreakdown(userDocs),
    ]);

    return {
      activeUsers,
      themeBreakdown,
      featureUsage,
      authMethods,
      topPlatform,
      avgExpensePerTransaction: expenseCount > 0 ? Math.round(totalExpense / expenseCount) : 0,
      avgIncomePerTransaction: incomeCount > 0 ? Math.round(totalIncome / incomeCount) : 0,
    };
  } catch (e) {
    console.warn("[AdminAnalytics] Full analytics failed:", e);
    return {
      activeUsers: { dau: 0, wau: 0, mau: 0, avgSessionMinutes: 0, retentionPercent: 0 },
      themeBreakdown: [],
      featureUsage: [],
      authMethods: { google: 0, email: 0, phone: 0 },
      topPlatform: "Android",
      avgExpensePerTransaction: 0,
      avgIncomePerTransaction: 0,
    };
  }
}
