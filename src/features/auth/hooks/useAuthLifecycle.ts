import { useEffect } from "react";
import { onAuthStateChanged, auth, logout } from "../../../services/firebase";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { secureLogout } from "../utils/secureLogout";

const TOKEN_REFRESH_INTERVAL_MS = 45 * 60 * 1000; // 45 minutes
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Global Authentication Lifecycle Hook (Phase 1 Login Security).
 * 
 * Enforces:
 * 1. Single global onAuthStateChanged listener to eliminate duplicate subscriptions
 * 2. Automatic ID Token refresh before 1-hour Firebase expiry
 * 3. 30-minute idle inactivity timeout with secure session wipe
 * 4. Graceful session recovery without race conditions
 */
export function useAuthLifecycle() {
  const { setUser, setAuthLoading, logoutUser } = useBudgetStore();

  // 1. Auth State Observer & Token Refresh
  useEffect(() => {
    let tokenRefreshTimer: NodeJS.Timeout | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (tokenRefreshTimer) {
        clearInterval(tokenRefreshTimer);
        tokenRefreshTimer = null;
      }

      if (firebaseUser) {
        // Hydrate store cleanly
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber,
        });

        // Set up proactive ID Token refresh before 1-hour expiration
        tokenRefreshTimer = setInterval(async () => {
          try {
            await firebaseUser.getIdToken(true);
            if (import.meta.env.DEV) {
              console.info("[useAuthLifecycle] Proactively refreshed Firebase ID Token");
            }
          } catch (error) {
            if (import.meta.env.DEV) {
              console.warn("[useAuthLifecycle] Failed to refresh ID Token, terminating session:", error);
            }
            await secureLogout(logoutUser);
          }
        }, TOKEN_REFRESH_INTERVAL_MS);
      } else {
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (tokenRefreshTimer) {
        clearInterval(tokenRefreshTimer);
      }
    };
  }, [setUser, setAuthLoading, logoutUser]);

  // 2. Idle Timeout Guard (30 min inactivity -> secure logout)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        if (auth.currentUser) {
          if (import.meta.env.DEV) {
            console.warn("[useAuthLifecycle] Idle timeout reached (>30 min). Logging out securely.");
          }
          await secureLogout(logoutUser);
        }
      }, IDLE_TIMEOUT_MS);
    };

    const activityEvents = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((event) => {
      document.addEventListener(event, resetIdleTimer, { passive: true });
    });
    resetIdleTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        document.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [logoutUser]);
}
