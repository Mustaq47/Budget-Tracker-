import { useEffect, useRef } from "react";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { 
  uploadBackupToFirestore, 
  downloadBackupFromFirestore, 
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
    trips,
    goals,
    customCategories,
    restoreCloudState,
    setLastBackupTime,
  } = useBudgetStore();

  const isInitialMount = useRef(true);
  const lastSyncHash = useRef<string | null>(null);

  // 1. Initial Load: Download from Cloud if enabled
  useEffect(() => {
    async function initialSync() {
      if (!user?.uid) return;
      try {
        let shouldSync = isCloudBackupEnabled;
        
        // Check cloud preference if local is false (e.g. on new device or after logout)
        if (!shouldSync) {
          const { doc, getDoc } = await import("firebase/firestore");
          const { db } = await import("../../../services/firebase");
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().cloudSyncEnabled === true) {
            shouldSync = true;
            useBudgetStore.getState().setCloudBackupEnabled(true);
          }
        }

        if (!shouldSync) return;

        const backup = await downloadBackupFromFirestore(user.uid);
        if (backup) {
          restoreCloudState(backup);
          if (backup.updatedAtFormatted) {
            setLastBackupTime(backup.updatedAtFormatted);
          }
          // Set initial hash to prevent immediate re-upload
          lastSyncHash.current = computePayloadHash(backup as any);
          if (import.meta.env.DEV) {
            logger.info("[useCloudSync] Auto-restored cloud backup on login.");
          }
        }
      } catch (err) {
        logger.warn("[useCloudSync] Initial auto-restore failed:", err);
      }
    }

    if (isAuthenticated && isInitialMount.current) {
      isInitialMount.current = false;
      initialSync();
    }
  }, [isAuthenticated, user?.uid, restoreCloudState, setLastBackupTime, isCloudBackupEnabled]);

  // 2. Auto-Upload on Data Changes (Debounced)
  useEffect(() => {
    if (!isAuthenticated || !user?.uid || !isCloudBackupEnabled) return;

    // Skip the very first render if we haven't done initial sync
    if (isInitialMount.current) return;

    const { theme, colorMode, currency, language } = useBudgetStore.getState();

    const payload = {
      dailyBudget,
      transactions,
      trips,
      goals,
      customCategories,
      preferences: {
        theme,
        colorMode,
        currency,
        language
      }
    };

    const currentHash = computePayloadHash(payload as any);

    // Don't upload if nothing functionally changed
    if (currentHash === lastSyncHash.current) return;

    const timeoutId = setTimeout(async () => {
      try {
        const timeIso = await uploadBackupToFirestore(user.uid, payload);
        setLastBackupTime(timeIso);
        lastSyncHash.current = currentHash;
        if (import.meta.env.DEV) {
          logger.info("[useCloudSync] Auto-uploaded backup to cloud.");
        }
      } catch (err) {
        logger.warn("[useCloudSync] Auto-upload failed:", err);
      }
    }, 2000); // 2 second debounce to bundle rapid changes (e.g. adding transaction + goal)

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
