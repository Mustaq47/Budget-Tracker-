import { useEffect, useRef } from "react";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { useTripsStore } from "../../../store/useTripsStore";
import { useGoalsStore } from "../../../store/useGoalsStore";
import { 
  uploadBackupToFirestore, 
  downloadBackupFromFirestore,
  syncTripsToFirestore,
  downloadTripsFromFirestore,
  syncGoalsToFirestore,
  downloadGoalsFromFirestore,
  computePayloadHash 
} from "../../../services/firestoreService";
import { logger } from "../../../utils/logger";

export function useCloudSync() {
  const {
    user,
    isAuthenticated,
    isCloudBackupEnabled,
    dailyBudget,
    transactions,
    customCategories,
    restoreCloudState,
    setLastBackupTime,
  } = useBudgetStore();

  const { trips, setTrips } = useTripsStore();
  const { goals, setGoals } = useGoalsStore();

  const isInitialMount = useRef(true);
  const lastSyncHash = useRef<string | null>(null);
  const lastTripsHash = useRef<string | null>(null);
  const lastGoalsHash = useRef<string | null>(null);

  // 1. Initial Load: Download from Cloud if enabled
  useEffect(() => {
    async function initialSync() {
      if (!user?.uid) return;
      try {
        let shouldSync = isCloudBackupEnabled;
        
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("../../../services/firebase");
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          
          if (data.displayName || data.age || data.gender || data.photoURL) {
            useBudgetStore.getState().updateUserProfile({
              ...(data.displayName ? { displayName: data.displayName } : {}),
              ...(data.photoURL ? { photoURL: data.photoURL } : {}),
              ...(data.age ? { age: data.age } : {}),
              ...(data.gender ? { gender: data.gender } : {}),
            });
          }

          // Check cloud preference if local is false (e.g. on new device or after logout)
          if (!shouldSync && data.cloudSyncEnabled === true) {
            shouldSync = true;
            useBudgetStore.getState().setCloudBackupEnabled(true);
          }
        }

        if (!shouldSync) return;

        const backup = await downloadBackupFromFirestore(user.uid);
        if (backup) {
          // Conflict Resolution Check
          const localTransactions = useBudgetStore.getState().transactions || [];
          const latestLocalTxTime = localTransactions.length > 0 
            ? Math.max(...localTransactions.map(t => {
                const tsMatch = t.id.match(/^(\d{13})/); // tx IDs usually start with Date.now()
                return tsMatch ? parseInt(tsMatch[1], 10) : 0;
              })) 
            : 0;
          
          const backupTime = backup.updatedAtFormatted ? new Date(backup.updatedAtFormatted).getTime() : 0;
          
          if (latestLocalTxTime > backupTime && backupTime !== 0) {
            if (import.meta.env.DEV) {
              logger.warn("[useCloudSync] Aborted auto-restore: Local data has newer transactions than the cloud backup.");
            }
            return;
          }

          restoreCloudState(backup);
          if (backup.updatedAtFormatted) {
            setLastBackupTime(backup.updatedAtFormatted);
          }
          lastSyncHash.current = computePayloadHash(backup as any);
          if (import.meta.env.DEV) {
            logger.info("[useCloudSync] Auto-restored cloud backup on login.");
          }
        }

        const cloudTrips = await downloadTripsFromFirestore(user.uid);
        if (cloudTrips) {
           setTrips(cloudTrips);
           lastTripsHash.current = JSON.stringify(cloudTrips);
        }

        const cloudGoals = await downloadGoalsFromFirestore(user.uid);
        if (cloudGoals) {
           setGoals(cloudGoals);
           lastGoalsHash.current = JSON.stringify(cloudGoals);
        }

      } catch (err) {
        logger.warn("[useCloudSync] Initial auto-restore failed:", err);
      }
    }

    if (isAuthenticated && isInitialMount.current) {
      isInitialMount.current = false;
      initialSync();
    }
  }, [isAuthenticated, user?.uid, restoreCloudState, setLastBackupTime, isCloudBackupEnabled, setTrips, setGoals]);

  // 2. Auto-Upload on Data Changes (Debounced)
  useEffect(() => {
    if (!isAuthenticated || !user?.uid || !isCloudBackupEnabled) return;

    if (isInitialMount.current) return;

    const { currency, language, budgetViewMode, appVersion } = useBudgetStore.getState();

    const payload = {
      dailyBudget,
      transactions,
      customCategories,
      preferences: {
        currency,
        language,
        budgetViewMode,
        appVersion,
      },
      profile: {
        displayName: user?.displayName,
        photoURL: user?.photoURL,
        age: user?.age,
        gender: user?.gender,
      }
    };

    const currentHash = computePayloadHash(payload as any);
    const tripsHashStr = JSON.stringify(trips);
    const goalsHashStr = JSON.stringify(goals);

    const changedBackup = currentHash !== lastSyncHash.current;
    const changedTrips = tripsHashStr !== lastTripsHash.current;
    const changedGoals = goalsHashStr !== lastGoalsHash.current;

    if (!changedBackup && !changedTrips && !changedGoals) return;

    const timeoutId = setTimeout(async () => {
      try {
        if (changedBackup) {
          const timeIso = await uploadBackupToFirestore(user.uid, payload);
          setLastBackupTime(timeIso);
          lastSyncHash.current = currentHash;
        }
        if (changedTrips) {
          await syncTripsToFirestore(user.uid, trips);
          lastTripsHash.current = tripsHashStr;
        }
        if (changedGoals) {
          await syncGoalsToFirestore(user.uid, goals);
          lastGoalsHash.current = goalsHashStr;
        }
        
        if (import.meta.env.DEV) {
          logger.info("[useCloudSync] Auto-uploaded to cloud.");
        }
      } catch (err) {
        logger.warn("[useCloudSync] Auto-upload failed:", err);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [
    isAuthenticated,
    isCloudBackupEnabled,
    user?.uid,
    dailyBudget,
    transactions,
    trips,
    goals,
    customCategories,
    setLastBackupTime
  ]);
}
