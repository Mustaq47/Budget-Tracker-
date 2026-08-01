import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { Transaction, PaymentCard, SavingsGoal } from "../store/useBudgetStore";
import { retryWithBackoff } from "../utils/asyncHandler";

export interface BackupPayload {
  dailyBudget: number;
  transactions: Transaction[];
  cards: PaymentCard[];
  goals: SavingsGoal[];
}

export interface CloudBackupData extends BackupPayload {
  updatedAt?: any;
  updatedAtFormatted?: string;
}

const lastUploadedHashes: Record<string, { hash: string; timestampFormatted: string }> = {};

/**
 * Generates a fast, deterministic fingerprint of the budget state payload
 * to prevent duplicate Firestore writes.
 */
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
      cards: (payload.cards || []).map((c) => ({
        id: c.id,
        cardNumber: c.cardNumber,
      })),
      goals: (payload.goals || []).map((g) => ({
        id: g.id,
        currentAmount: g.currentAmount,
        targetAmount: g.targetAmount,
      })),
    };
    const str = JSON.stringify(normalized);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `hash_${Math.abs(hash).toString(36)}_${str.length}`;
  } catch {
    return `hash_${Date.now()}`;
  }
}

/**
 * Wraps Firestore asynchronous calls with a configurable timeout
 * to prevent hanging during offline transitions.
 */
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

/**
 * Upload local budget state payload to Firestore user backup document.
 * Path: users/{uid}/backups/latest
 * 
 * Features:
 *  - Payload fingerprinting to prevent redundant Firestore writes
 *  - Timeout protection against network hangs
 */
export async function uploadBackupToFirestore(
  uid: string,
  payload: BackupPayload
): Promise<string> {
  if (!uid) throw new Error("User ID is required for cloud backup.");

  const currentHash = computePayloadHash(payload);
  const cached = lastUploadedHashes[uid];
  const nowIso = new Date().toISOString();

  // Short-circuit if payload hasn't changed to avoid redundant Firestore write billing
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
          cards: payload.cards,
          goals: payload.goals,
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

  return nowIso;
}

/**
 * Download the latest cloud backup payload from Firestore.
 * Path: users/{uid}/backups/latest
 */
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
    cards: Array.isArray(data.cards) ? data.cards : [],
    goals: Array.isArray(data.goals) ? data.goals : [],
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
