import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { Transaction, PaymentCard, SavingsGoal } from "../store/useBudgetStore";

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

/**
 * Upload local budget state payload to Firestore user backup document.
 * Path: users/{uid}/backups/latest
 */
export async function uploadBackupToFirestore(
  uid: string,
  payload: BackupPayload
): Promise<string> {
  if (!uid) throw new Error("User ID is required for cloud backup.");

  const backupDocRef = doc(db, "users", uid, "backups", "latest");
  const nowIso = new Date().toISOString();

  await setDoc(
    backupDocRef,
    {
      dailyBudget: payload.dailyBudget,
      transactions: payload.transactions,
      cards: payload.cards,
      goals: payload.goals,
      updatedAt: serverTimestamp(),
      updatedAtFormatted: nowIso,
    },
    { merge: true }
  );

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
  const snapshot = await getDoc(backupDocRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    dailyBudget: typeof data.dailyBudget === "number" ? data.dailyBudget : 2000,
    transactions: Array.isArray(data.transactions) ? data.transactions : [],
    cards: Array.isArray(data.cards) ? data.cards : [],
    goals: Array.isArray(data.goals) ? data.goals : [],
    updatedAtFormatted: data.updatedAtFormatted || null,
  };
}
