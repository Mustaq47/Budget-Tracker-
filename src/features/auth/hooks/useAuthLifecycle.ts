import { useEffect, useRef } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { onAuthStateChanged, auth, isOAuthValidating } from "../../../services/firebase";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { secureLogout } from "../utils/secureLogout";
import { syncUserProfileToFirestore } from "../../../services/adminMonitoringService";
import { classifyAuthError, isSessionKillingError } from "../utils/authErrorClassifier";
import { logAuthEvent } from "../utils/authDiagnostics";

const TOKEN_REFRESH_INTERVAL_MS = 45 * 60 * 1000; // 45 minutes

/** Bounded exponential backoff delays (ms) for token refresh & session recovery */
const RETRY_DELAYS = [2000, 4000, 8000]; // 3 attempts max

/**
 * Global Authentication Lifecycle Hook — Auth Stability V3.
 *
 * Key behaviors:
 * 1. ZERO random logouts on background/resume/network switch.
 * 2. Unexpected null callbacks transition to `AUTH_CHECKING` state, preserving session and local financial data.
 * 3. Controlled verification with bounded exponential backoff retries against `auth.currentUser`.
 * 4. Only explicit user intent (`logoutIntent === true`) or confirmed session revokes trigger `logoutUser()`.
 * 5. Capacitor `@capacitor/app` `appStateChange` integration for native mobile background/resume handling.
 */
export function useAuthLifecycle() {
  const { setUser, setAuthLoading, logoutUser, setAuthState, theme } = useBudgetStore();
  const isRecoveringRef = useRef(false);

  // 1. Capacitor App State Change Listener (Background / Resume handling)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      logAuthEvent('NATIVE_LIFECYCLE_INIT', 'Registering @capacitor/app appStateChange listener');
      const listenerPromise = App.addListener('appStateChange', ({ isActive }) => {
        logAuthEvent('APP_STATE_CHANGE', `isActive=${isActive}`, {
          appState: isActive ? 'active' : 'background',
          currentUserPresent: !!auth.currentUser,
          authState: useBudgetStore.getState().authState,
        });

        if (isActive) {
          // On Resume: Perform lightweight session check against auth.currentUser
          if (auth.currentUser) {
            const state = useBudgetStore.getState().authState;
            if (state === 'AUTH_CHECKING' || state === 'INITIALIZING') {
              setAuthState('AUTHENTICATED');
              logAuthEvent('APP_RESUME_AUTH_RESTORED', `uid=${auth.currentUser.uid}`);
            }
          }
        }
      });

      return () => {
        listenerPromise.then(l => l.remove()).catch(() => {});
      };
    }
  }, [setAuthState]);

  // 2. Main Auth Observer & Token Refresh Lifecycle
  useEffect(() => {
    let tokenRefreshTimer: ReturnType<typeof setInterval> | null = null;
    let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let recoveryTimeoutId: ReturnType<typeof setTimeout> | null = null;

    logAuthEvent('AUTH_LIFECYCLE_INIT', 'Setting up single global onAuthStateChanged listener');

    /**
     * Bounded Exponential Backoff Token Refresh Retry
     */
    const retryTokenRefresh = async (
      firebaseUser: import("firebase/auth").User,
      attempt = 0
    ): Promise<void> => {
      try {
        await firebaseUser.getIdToken(true);
        logAuthEvent('TOKEN_REFRESH_SUCCESS', `attempt=${attempt + 1}`);
      } catch (error) {
        const category = classifyAuthError(error);
        logAuthEvent('TOKEN_REFRESH_FAILED', `attempt=${attempt + 1} category=${category}`, {
          uidPresent: !!firebaseUser.uid,
        });

        if (isSessionKillingError(category)) {
          logAuthEvent('SESSION_KILLED', `category=${category}`);
          if (category === 'USER_DISABLED') {
            await secureLogout(logoutUser, 'ACCOUNT_DISABLED');
          } else {
            setAuthState('REAUTH_REQUIRED');
          }
          return;
        }

        if (attempt < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[attempt];
          logAuthEvent('TOKEN_REFRESH_RETRY', `scheduling retry in ${delay}ms`);
          retryTimeoutId = setTimeout(() => {
            retryTokenRefresh(firebaseUser, attempt + 1);
          }, delay);
        } else {
          // Retries exhausted — preserve session in AUTH_CHECKING / AUTHENTICATED state
          logAuthEvent('TOKEN_REFRESH_EXHAUSTED', 'All retries failed. Preserving session.');
        }
      }
    };

    /**
     * Bounded Session Recovery Verification when an unexpected null callback occurs
     */
    const attemptSessionRecovery = async (attempt = 0): Promise<void> => {
      if (isRecoveringRef.current && attempt === 0) return;
      isRecoveringRef.current = true;

      const currentFirebaseUser = auth.currentUser;
      logAuthEvent('SESSION_RECOVERY_ATTEMPT', `attempt=${attempt + 1}`, {
        currentUserPresent: !!currentFirebaseUser,
        recoveryAttempt: attempt + 1,
      });

      if (currentFirebaseUser) {
        try {
          await currentFirebaseUser.getIdToken(false);
          isRecoveringRef.current = false;
          setAuthState('AUTHENTICATED');
          logAuthEvent('SESSION_RECOVERY_SUCCESS', 'auth.currentUser verified');
          return;
        } catch (_) {
          // Token verify failed, proceed to backoff retry
        }
      }

      if (attempt < RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[attempt];
        logAuthEvent('SESSION_RECOVERY_RETRY', `scheduling recovery retry in ${delay}ms`);
        recoveryTimeoutId = setTimeout(() => {
          attemptSessionRecovery(attempt + 1);
        }, delay);
      } else {
        isRecoveringRef.current = false;
        // All recovery attempts exhausted — check if currentUser is still missing
        if (!auth.currentUser) {
          const currentStore = useBudgetStore.getState();
          if (currentStore.logoutIntent) {
            logoutUser();
            setAuthState('UNAUTHENTICATED');
          } else {
            // Transient null exhausted — set REAUTH_REQUIRED but DO NOT wipe financial storage!
            setAuthState('REAUTH_REQUIRED');
            logAuthEvent('SESSION_RECOVERY_EXHAUSTED', 'Transitioned to REAUTH_REQUIRED without wiping storage');
          }
        } else {
          setAuthState('AUTHENTICATED');
        }
      }
    };

    // Single global onAuthStateChanged listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clear pending timers
      if (tokenRefreshTimer) { clearInterval(tokenRefreshTimer); tokenRefreshTimer = null; }
      if (retryTimeoutId) { clearTimeout(retryTimeoutId); retryTimeoutId = null; }
      if (recoveryTimeoutId) { clearTimeout(recoveryTimeoutId); recoveryTimeoutId = null; }

      const currentStoreState = useBudgetStore.getState();
      const previousAuthState = currentStoreState.authState;

      if (firebaseUser) {
        if (isOAuthValidating) {
          logAuthEvent('AUTH_CALLBACK_SKIPPED', 'OAuth validation in progress');
          return;
        }

        isRecoveringRef.current = false;
        logAuthEvent('AUTH_USER_DETECTED', `uid=${firebaseUser.uid}`, {
          uidPresent: true,
          firebaseUserPresent: true,
          previousAuthState,
          nextAuthState: 'AUTHENTICATED',
        });

        const currentUser = currentStoreState.user;
        const mergedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || currentUser?.email,
          displayName: firebaseUser.displayName || currentUser?.displayName || firebaseUser.email?.split("@")[0],
          photoURL: firebaseUser.photoURL || currentUser?.photoURL,
          phoneNumber: firebaseUser.phoneNumber || currentUser?.phoneNumber,
          age: currentUser?.age,
          gender: currentUser?.gender,
        };

        setUser(mergedUser);
        setAuthState('AUTHENTICATED');

        try {
          syncUserProfileToFirestore(mergedUser, theme);
        } catch (_) {
          logAuthEvent('FIRESTORE_SYNC_FAILED', 'Profile sync failed — auth preserved');
        }

        // Proactive token refresh timer (45 min)
        tokenRefreshTimer = setInterval(() => {
          retryTokenRefresh(firebaseUser);
        }, TOKEN_REFRESH_INTERVAL_MS);

      } else {
        // Firebase emitted null
        const isExplicitLogout = currentStoreState.logoutIntent;

        logAuthEvent('AUTH_NULL_CALLBACK', `previousState=${previousAuthState} explicit=${isExplicitLogout}`, {
          firebaseUserPresent: false,
          previousAuthState,
          explicitLogoutIntent: isExplicitLogout,
        });

        if (isExplicitLogout) {
          // CASE 1: Explicit User Logout
          logoutUser();
          setAuthState('UNAUTHENTICATED');
          logAuthEvent('EXPLICIT_LOGOUT_CONFIRMED', 'User signed out explicitly');
        } else if (previousAuthState === 'INITIALIZING') {
          // CASE 2: Initial Application Boot — No persisted session found
          setAuthState('UNAUTHENTICATED');
          setAuthLoading(false);
          logAuthEvent('AUTH_BOOT_NO_SESSION', 'Initial boot completed without session');
        } else {
          // CASE 3: Transient / Unexpected null callback while previously AUTHENTICATED or AUTH_CHECKING
          // DO NOT LOGOUT! DO NOT WIPE STORE! DO NOT WIPE LOCALSTORAGE! DO NOT NAVIGATE TO LOGIN!
          setAuthState('AUTH_CHECKING');
          logAuthEvent('TRANSIENT_AUTH_NULL_DETECTED', 'Transitioned to AUTH_CHECKING — preserving session & storage');
          attemptSessionRecovery(0);
        }
      }
    });

    return () => {
      logAuthEvent('AUTH_LIFECYCLE_CLEANUP', 'Unsubscribing onAuthStateChanged listener');
      unsubscribe();
      if (tokenRefreshTimer) clearInterval(tokenRefreshTimer);
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      if (recoveryTimeoutId) clearTimeout(recoveryTimeoutId);
    };
  }, [setUser, setAuthLoading, logoutUser, setAuthState, theme]);
}


