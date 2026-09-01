import { signOut } from "firebase/auth";
import { auth, isCapacitorNative } from "../../../services/firebase";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { logAuthEvent } from "./authDiagnostics";
import { useBudgetStore } from "../../../store/useBudgetStore";

/**
 * Explicit reasons a logout may be triggered.
 * Transient network or token errors must NEVER appear here.
 */
export type LogoutReason =
  | 'USER_ACTION'
  | 'ACCOUNT_DISABLED'
  | 'SESSION_REVOKED'
  | 'ACCOUNT_DELETED'
  | 'SECURITY_POLICY';

/**
 * Secure Logout utility that signs out from both Firebase Auth and
 * native Google Play Services (on Android/iOS), preventing session fixation
 * and ensuring clean token invalidation.
 *
 * Every call MUST provide a reason. Temporary network failures must NOT
 * trigger this function.
 */
export async function secureLogout(
  logoutStoreCallback?: () => void,
  reason: LogoutReason = 'USER_ACTION'
): Promise<void> {
  // Set explicit intent in store so logoutUser() knows this is an intentional logout
  useBudgetStore.getState().setLogoutIntent(true);
  logAuthEvent('SECURE_LOGOUT', `reason=${reason}`);

  try {
    // 1. Sign out from mobile native Google Auth if running in Capacitor
    if (isCapacitorNative) {
      try {
        await GoogleAuth.signOut();
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn("[secureLogout] GoogleAuth.signOut warning:", e);
        }
      }
    }

    // 2. Sign out from Firebase Auth
    await signOut(auth);

    // 3. Clear application state callback
    if (logoutStoreCallback) {
      logoutStoreCallback();
    }

    // 4. Clear temporary session storage and stored local persistence for privacy
    //    Only on confirmed intentional logout — never on transient errors
    if (typeof window !== "undefined") {
      if (window.sessionStorage) window.sessionStorage.clear();
      if (window.localStorage) {
        try { window.localStorage.removeItem('budtrack-storage-v2'); } catch (_) {}
        try { window.localStorage.removeItem('budtrack-trips-storage'); } catch (_) {}
        try { window.localStorage.removeItem('budtrack-goals-storage'); } catch (_) {}
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[secureLogout] Error during sign out:", error);
    }
    // Ensure state is cleared even if network signout throws
    if (logoutStoreCallback) {
      logoutStoreCallback();
    }
  }
}
