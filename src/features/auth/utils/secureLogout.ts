import { signOut } from "firebase/auth";
import { auth, isCapacitorNative } from "../../../services/firebase";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";

/**
 * Secure Logout utility that signs out from both Firebase Auth and
 * native Google Play Services (on Android/iOS), preventing session fixation
 * and ensuring clean token invalidation.
 */
export async function secureLogout(logoutStoreCallback?: () => void): Promise<void> {
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

    // 4. Safely clear any temporary session storage without touching local persistence
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.clear();
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
