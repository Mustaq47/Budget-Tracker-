import { collection, getDocs, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, auth, isCapacitorNative } from "./firebase";
import { Capacitor } from "@capacitor/core";
import { APP_VERSION, DEFAULT_SESSION_MINUTES, DEFAULT_THEME } from "../utils/constants";

export type UserSyncState = 'SYNCED' | 'OFFLINE_LOCAL' | 'PENDING' | 'FLAGGED';

export interface UserStatusSummary {
  uid: string;
  email: string;
  displayName: string;
  syncState: UserSyncState;
  appVersion: string;
  platform: 'Android' | 'Web' | 'iOS';
  lastLoginAt: string;
  lastBackupAt?: string;
  stats: {
    transactionCount: number;
    cardsCount: number;
    goalsCount: number;
    localStorageSizeKb: number;
  };
}

export interface UserLoginSession {
  id: string;
  username: string;
  email: string;
  platform: 'Android' | 'Web' | 'iOS';
  version: string;
  loginTimestamp: string;
  status: 'ACTIVE' | 'IDLE' | 'SYNCED';
}

export interface LoginAnalyticsSummary {
  totalUserCount: number;
  loggedInCount: number;
  syncedCloudCount: number;
  offlineLocalCount: number;
  v100AdoptionPercent: number;
  recentLogins: UserLoginSession[];
}

/**
 * Sync user profile telemetry to Firestore users collection
 */
export async function syncUserProfileToFirestore(user: {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  age?: number | null;
  gender?: string | null;
  providerId?: string;
}, currentTheme?: string) {
  if (!user?.uid) return;
  try {
    const userRef = doc(db, "users", user.uid);
    const existingSnap = await getDoc(userRef);
    const nowIso = new Date().toISOString();

    let platform: "Android" | "Web" | "iOS" = "Web";
    try {
      if (isCapacitorNative) {
        platform = Capacitor.getPlatform() === "ios" ? "iOS" : "Android";
      } else if (navigator.userAgent.includes("Android")) {
        platform = "Android";
      } else if (navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad")) {
        platform = "iOS";
      }
    } catch (_) {
      platform = "Web";
    }

    const authMethod =
      user.providerId === "google.com" || user.email?.endsWith("@gmail.com")
        ? "google"
        : user.phoneNumber
        ? "phone"
        : "email";

    const payload: Record<string, any> = {
      uid: user.uid,
      email: (user.email || `user_${user.uid}@cozify.local`).toLowerCase(),
      displayName: user.displayName || user.email?.split("@")[0] || "coZify User",
      photoURL: user.photoURL || null,
      phoneNumber: user.phoneNumber || null,
      age: user.age || null,
      gender: user.gender || null,
      platform,
      authMethod,
      appVersion: APP_VERSION,
      lastLoginAt: nowIso,
      updatedAt: serverTimestamp(),
      syncState: "SYNCED",
      // Always write theme so Analytics stays accurate
      ...(currentTheme ? { theme: currentTheme } : {}),
    };

    if (!existingSnap.exists()) {
      payload.createdAt = nowIso;
      payload.theme = currentTheme || DEFAULT_THEME;
      payload.stats = {
        transactionCount: 0,
        cardsCount: 0,
        goalsCount: 0,
        localStorageSizeKb: 0,
      };
      payload.transactionCount = 0;
      payload.cardsCount = 0;
      payload.goalsCount = 0;
      payload.localStorageSizeKb = 0;
      payload.avgSessionMinutes = DEFAULT_SESSION_MINUTES;
      payload.hasCustomCategories = false;
      payload.avgExpensePerTransaction = 0;
      payload.avgIncomePerTransaction = 0;
    }

    setDoc(userRef, payload, { merge: true }).catch(e => console.warn("[AdminMonitoring] Offline user profile sync:", e));

    // Also write to special_emails collection
    if (payload.email) {
      const specialEmailRef = doc(db, "special_emails", payload.email);
      setDoc(specialEmailRef, {
        email: payload.email,
        uid: payload.uid,
        lastLoginAt: nowIso,
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch(e => console.warn("[AdminMonitoring] Offline special email sync:", e));
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[AdminMonitoring] Failed to sync user profile to Firestore:", err);
    }
  }
}

/**
 * Fetch monitored user status telemetry directly from Cloud Firestore (users collection)
 */
export async function getMonitoredUsers(): Promise<UserStatusSummary[]> {
  const usersMap = new Map<string, UserStatusSummary>();

  // 1. Proactively sync current logged-in user profile to Firestore so collection is never empty
  try {
    if (auth.currentUser) {
      await syncUserProfileToFirestore(auth.currentUser);
    }
  } catch (_) {}

  // Attempt cloud Firestore sync
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const email = (data.email || `user_${docSnap.id}@device.local`).toLowerCase();
      
      // Auto-migrate previous login users to special_emails collection
      try {
        const specialEmailRef = doc(db, "special_emails", email);
        setDoc(specialEmailRef, {
          email,
          uid: docSnap.id,
          lastLoginAt: data.lastLoginAt || new Date().toISOString(),
          updatedAt: serverTimestamp(),
        }, { merge: true }).catch(() => {});
      } catch (_) {}

      usersMap.set(email, {
        uid: docSnap.id,
        email,
        displayName: data.displayName || data.email?.split("@")[0] || "coZify User",
        syncState: data.updatedAt ? "SYNCED" : "OFFLINE_LOCAL",
        appVersion: data.appVersion || "v1.0.0",
        platform: data.platform || "Android",
        lastLoginAt: data.lastLoginAt || new Date().toISOString(),
        lastBackupAt: data.updatedAt?.toDate?.()?.toISOString?.() || undefined,
        stats: {
          transactionCount: typeof data.transactionCount === "number" ? data.transactionCount : 0,
          cardsCount: typeof data.cardsCount === "number" ? data.cardsCount : 0,
          goalsCount: typeof data.goalsCount === "number" ? data.goalsCount : 0,
          localStorageSizeKb: typeof data.localStorageSizeKb === "number" ? data.localStorageSizeKb : 0,
        },
      });
    });
  } catch (e) {
    console.warn("[AdminMonitoring] Offline/fallback mode for user telemetry.", e);
  }

  return Array.from(usersMap.values()).sort((a, b) => 
    new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime()
  );
}

/**
 * Get aggregated login analytics and telemetry summary for Admin Dashboard
 */
export async function getLoginAnalytics(): Promise<LoginAnalyticsSummary> {
  const users = await getMonitoredUsers();

  const totalUserCount = users.length;
  // Consider logged in / active if logged in within last 24h
  const now = Date.now();
  const loggedInCount = users.filter((u) => {
    const diff = now - new Date(u.lastLoginAt).getTime();
    return diff <= 24 * 3600000;
  }).length;

  const syncedCloudCount = users.filter((u) => u.syncState === "SYNCED").length;
  const offlineLocalCount = totalUserCount - syncedCloudCount;

  const v100Count = users.filter((u) => u.appVersion === "v1.0.0").length;
  const v100AdoptionPercent = totalUserCount > 0 ? Math.round((v100Count / totalUserCount) * 100) : 100;

  const recentLogins: UserLoginSession[] = users.map((u, index) => ({
    id: `sess_${u.uid}_${index}`,
    username: u.displayName,
    email: u.email,
    platform: u.platform,
    version: u.appVersion,
    loginTimestamp: u.lastLoginAt,
    status: u.syncState === "SYNCED" ? "SYNCED" : index < 2 ? "ACTIVE" : "IDLE",
  }));

  return {
    totalUserCount,
    loggedInCount,
    syncedCloudCount,
    offlineLocalCount,
    v100AdoptionPercent,
    recentLogins,
  };
}
