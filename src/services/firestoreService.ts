import { doc, setDoc, getDoc, serverTimestamp, writeBatch, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Transaction, Trip, SavingsGoal } from "../store/useBudgetStore";
import { retryWithBackoff } from "../utils/asyncHandler";

export interface BackupPayload {
  dailyBudget: number;
  transactions: Transaction[];
  customCategories: string[];
  preferences?: {
    theme?: any;
    colorMode?: any;
    currency?: any;
    language?: any;
  };
}

export interface CloudBackupData extends BackupPayload {
  updatedAt?: any;
  updatedAtFormatted?: string;
}

const lastUploadedHashes: Record<string, { hash: string; timestampFormatted: string }> = {};

export function computePayloadHash(payload: BackupPayload): string {
  try {
    const normalized = {
      dailyBudget: payload.dailyBudget || 0,
      transactions: (payload.transactions || []).map((t) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date,
      })),
    };
    const str = JSON.stringify(normalized);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `hash_${Math.abs(hash).toString(36)}_${str.length}`;
  } catch {
    return `hash_${Date.now()}`;
  }
}

async function withTimeout<T>(promise: Promise<T>, ms = 12000, actionName = "Firestore operation"): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${actionName} timed out after ${ms / 1000}s. Check your network connection.`));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

export async function uploadBackupToFirestore(
  uid: string,
  payload: BackupPayload
): Promise<string> {
  if (!uid) throw new Error("User ID is required for cloud backup.");

  const currentHash = computePayloadHash(payload);
  const cached = lastUploadedHashes[uid];
  const nowIso = new Date().toISOString();

  if (cached && cached.hash === currentHash) {
    if (import.meta.env.DEV) {
      console.info("[Firestore] Payload unchanged. Skipping redundant cloud backup write.");
    }
    return cached.timestampFormatted || nowIso;
  }

  const backupDocRef = doc(db, "users", uid, "backups", "latest");

  await retryWithBackoff(() =>
    withTimeout(
      setDoc(
        backupDocRef,
        {
          dailyBudget: payload.dailyBudget,
          transactions: payload.transactions,
          customCategories: payload.customCategories,
          preferences: payload.preferences || {},
          checksum: currentHash,
          updatedAt: serverTimestamp(),
          updatedAtFormatted: nowIso,
        },
        { merge: true }
      ),
      12000,
      "Cloud backup upload"
    )
  );

  lastUploadedHashes[uid] = {
    hash: currentHash,
    timestampFormatted: nowIso,
  };

  try {
    const userDocRef = doc(db, "users", uid);
    const txCount = Array.isArray(payload.transactions) ? payload.transactions.length : 0;
    const sizeKb = Math.round(JSON.stringify(payload).length / 1024);

    let totalExp = 0, expCount = 0;
    let totalInc = 0, incCount = 0;
    if (Array.isArray(payload.transactions)) {
      payload.transactions.forEach((tx: any) => {
        const amt = Math.abs(Number(tx.amount) || 0);
        if (tx.type === "expense") {
          totalExp += amt;
          expCount++;
        } else if (tx.type === "income") {
          totalInc += amt;
          incCount++;
        }
      });
    }

    await setDoc(
      userDocRef,
      {
        lastBackupAt: nowIso,
        updatedAt: serverTimestamp(),
        syncState: "SYNCED",
        stats: {
          transactionCount: txCount,
          localStorageSizeKb: sizeKb,
        },
        transactionCount: txCount,
        localStorageSizeKb: sizeKb,
        avgExpensePerTransaction: expCount > 0 ? Math.round(totalExp / expCount) : 0,
        avgIncomePerTransaction: incCount > 0 ? Math.round(totalInc / incCount) : 0,
        hasCustomCategories: Boolean(payload.customCategories?.length),
      },
      { merge: true }
    );
  } catch (userDocErr) {
    if (import.meta.env.DEV) {
      console.warn("[Firestore] Could not update parent user doc:", userDocErr);
    }
  }

  return nowIso;
}

export async function downloadBackupFromFirestore(
  uid: string
): Promise<CloudBackupData | null> {
  if (!uid) throw new Error("User ID is required to restore cloud backup.");

  const backupDocRef = doc(db, "users", uid, "backups", "latest");
  const snapshot = await retryWithBackoff(() =>
    withTimeout(
      getDoc(backupDocRef),
      10000,
      "Cloud backup restore"
    )
  );

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  const backupPayload: BackupPayload = {
    dailyBudget: typeof data.dailyBudget === "number" ? data.dailyBudget : 2000,
    transactions: Array.isArray(data.transactions) ? data.transactions : [],
    customCategories: Array.isArray(data.customCategories) ? data.customCategories : [],
    preferences: data.preferences || {},
  };

  lastUploadedHashes[uid] = {
    hash: computePayloadHash(backupPayload),
    timestampFormatted: data.updatedAtFormatted || new Date().toISOString(),
  };

  return {
    ...backupPayload,
    updatedAtFormatted: data.updatedAtFormatted || null,
  };
}

export async function syncTripsToFirestore(uid: string, trips: Trip[]) {
  if (!uid) return;
  const tripsRef = collection(db, "users", uid, "trips");
  const snapshot = await getDocs(tripsRef);
  
  const batch = writeBatch(db);
  
  // Delete existing ones not in the array
  const currentTripIds = new Set(trips.map(t => t.id));
  snapshot.docs.forEach(doc => {
    if (!currentTripIds.has(doc.id)) {
      batch.delete(doc.ref);
    }
  });

  // Set current ones
  trips.forEach(trip => {
    const docRef = doc(tripsRef, trip.id);
    batch.set(docRef, { ...trip, updatedAt: serverTimestamp() });
  });

  const userDocRef = doc(db, "users", uid);
  batch.set(userDocRef, { tripsCount: trips.length, updatedAt: serverTimestamp() }, { merge: true });

  await retryWithBackoff(() => withTimeout(batch.commit(), 10000, "Trips batch upload"));
}

export async function downloadTripsFromFirestore(uid: string): Promise<Trip[]> {
  if (!uid) return [];
  const tripsRef = collection(db, "users", uid, "trips");
  const snapshot = await retryWithBackoff(() => withTimeout(getDocs(tripsRef), 10000, "Trips restore"));
  return snapshot.docs.map(doc => doc.data() as Trip);
}

export async function syncGoalsToFirestore(uid: string, goals: SavingsGoal[]) {
  if (!uid) return;
  const goalsRef = collection(db, "users", uid, "goals");
  const snapshot = await getDocs(goalsRef);
  
  const batch = writeBatch(db);
  
  const currentGoalIds = new Set(goals.map(g => g.id));
  snapshot.docs.forEach(doc => {
    if (!currentGoalIds.has(doc.id)) {
      batch.delete(doc.ref);
    }
  });

  goals.forEach(goal => {
    const docRef = doc(goalsRef, goal.id);
    batch.set(docRef, { ...goal, updatedAt: serverTimestamp() });
  });

  const userDocRef = doc(db, "users", uid);
  batch.set(userDocRef, { goalsCount: goals.length, updatedAt: serverTimestamp() }, { merge: true });

  await retryWithBackoff(() => withTimeout(batch.commit(), 10000, "Goals batch upload"));
}

export async function downloadGoalsFromFirestore(uid: string): Promise<SavingsGoal[]> {
  if (!uid) return [];
  const goalsRef = collection(db, "users", uid, "goals");
  const snapshot = await retryWithBackoff(() => withTimeout(getDocs(goalsRef), 10000, "Goals restore"));
  return snapshot.docs.map(doc => doc.data() as SavingsGoal);
}
