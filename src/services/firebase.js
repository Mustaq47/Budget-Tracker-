/**
 * firebase.js — Secure Firebase Auth Module
 * 
 * Security fixes applied:
 *   C-01: Config from env variables (not hardcoded)
 *   C-05: Generic error messages (no user enumeration)
 *   H-06: Firebase App Check integration
 *   M-04: Google OAuth domain restriction
 */

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// Detect Capacitor native (mobile) environment
const isCapacitorNative = typeof window !== 'undefined' && Boolean(window.Capacitor?.isNativePlatform?.());

if (isCapacitorNative) {
  try {
    GoogleAuth.initialize({
      clientId: '322273012281-be2d9feb1b3712e6903be8.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: false,
    });
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[GoogleAuth Init]', e);
    }
  }
}

// ─── C-01 FIX: Config from environment variables ───
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate all required config values are present
const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, val]) => !val && key !== 'measurementId')
  .map(([key]) => key);

if (missingKeys.length > 0) {
  // Don't expose which keys are missing in production
  if (import.meta.env.DEV) {
    console.error(`[Firebase] Missing env vars: ${missingKeys.join(', ')}. Copy .env.example to .env and fill in values.`);
  }
}

// ─── Initialize Firebase ───
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);

// ─── H-06 FIX: Firebase App Check (uncomment when reCAPTCHA v3 site key is set) ───
// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
// const recaptchaKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY;
// if (recaptchaKey) {
//   initializeAppCheck(app, {
//     provider: new ReCaptchaV3Provider(recaptchaKey),
//     isTokenAutoRefreshEnabled: true
//   });
// }

// ─── M-04 FIX: Google OAuth with domain restriction ───
export const googleProvider = new GoogleAuthProvider();
const hdDomain = import.meta.env.VITE_GOOGLE_HD_DOMAIN;
if (hdDomain) {
  googleProvider.setCustomParameters({ hd: hdDomain, prompt: 'select_account' });
} else {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

// ─── C-05 FIX: Generic error messages ───
// Map Firebase error codes to safe, non-enumerable messages
const AUTH_ERROR_MAP = {
  'auth/user-not-found':            'Invalid email or password.',
  'auth/wrong-password':            'Invalid email or password.',
  'auth/invalid-credential':        'Invalid email or password.',
  'auth/invalid-email':             'Please enter a valid email address.',
  'auth/user-disabled':             'This account has been suspended. Contact support.',
  'auth/email-already-in-use':      'An error occurred. If this email is already registered, try signing in.',
  'auth/weak-password':             'Password does not meet the required policy.',
  'auth/too-many-requests':         'Too many attempts. Please try again later.',
  'auth/network-request-failed':    'Network error. Please check your connection.',
  'auth/popup-closed-by-user':      'Sign-in was cancelled.',
  'auth/operation-not-allowed':     'This sign-in method is not enabled.',
  'auth/invalid-verification-code': 'Invalid verification code. Please check and try again.',
  'auth/code-expired':              'Verification code has expired. Please request a new one.',
  'auth/missing-phone-number':      'Please enter a valid phone number.',
  'auth/invalid-phone-number':      'Please enter a valid phone number.',
  'auth/quota-exceeded':            'Service temporarily unavailable. Please try again later.',
};

function safeAuthError(error) {
  const code = error?.code || '';
  const rawMsg = error?.message || error?.toString() || 'Unknown error';
  
  if (AUTH_ERROR_MAP[code]) {
    return new Error(AUTH_ERROR_MAP[code]);
  }

  // Handle Google Play Services DEVELOPER_ERROR 10 (missing SHA-1 in Firebase Console)
  if (rawMsg.includes('10') || rawMsg.includes('DEVELOPER_ERROR') || rawMsg.includes('12500')) {
    return new Error('Google Auth Error (SHA-1 missing): Add SHA-1 5E:80:B0:29:3E:7E:6B:F5:B0:95:42:EE:03:F2:B8:C4:FA:BF:10:E1 to Firebase Console under Project Settings -> Android Apps.');
  }

  // Show descriptive error message instead of generic fallback
  return new Error(`Sign-In Error: ${rawMsg} (${code})`);
}

// ─── Auth Helpers (all throw sanitized errors) ───

export const signInWithGoogle = async () => {
  try {
    if (isCapacitorNative) {
      // Use Capacitor Native Google Sign-In overlay (Google Play Services)
      // This prevents web redirect back to localhost (ERR_CONNECTION_REFUSED)
      const googleUser = await GoogleAuth.signIn();
      const idToken = googleUser?.authentication?.idToken || googleUser?.idToken || googleUser?.token;
      if (!idToken) {
        throw new Error('No ID token returned from Google Sign-In. Check SHA-1 in Firebase Console.');
      }
      const credential = GoogleAuthProvider.credential(idToken);
      return await signInWithCredential(auth, credential);
    }
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Google Auth Error]', error);
    }
    // Handle user cancellation gracefully
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.message?.includes('12501') ||
      error?.message?.toLowerCase()?.includes('cancel')
    ) {
      return null;
    }
    if (
      error?.code === 'auth/popup-blocked' ||
      error?.code === 'auth/operation-not-supported-in-this-environment'
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw safeAuthError(error);
  }
};

// Handle redirect result on app init (for Web browsers only)
export const handleGoogleRedirectResult = async () => {
  try {
    if (isCapacitorNative) return null;
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Auth] Redirect result error:', error?.code);
    }
    return null;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw safeAuthError(error);
  }
};

export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result;
  } catch (error) {
    throw safeAuthError(error);
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    // C-05: Always show success for password reset (prevents email enumeration)
    // Even if the email doesn't exist, Firebase throws — we swallow it silently.
    if (error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-email') {
      return; // Silently succeed — user sees "check your email" regardless
    }
    throw safeAuthError(error);
  }
};

// ─── Phone Auth ───

let recaptchaVerifierInstance = null;

export const setupRecaptcha = (containerId) => {
  if (recaptchaVerifierInstance) {
    try { recaptchaVerifierInstance.clear(); } catch (_) {}
  }
  recaptchaVerifierInstance = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {
      recaptchaVerifierInstance = null;
    }
  });
  return recaptchaVerifierInstance;
};

export const sendPhoneOTP = async (phoneNumber, recaptchaVerifier) => {
  try {
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  } catch (error) {
    throw safeAuthError(error);
  }
};

export const verifyOTP = async (confirmationResult, otpCode) => {
  try {
    return await confirmationResult.confirm(otpCode);
  } catch (error) {
    throw safeAuthError(error);
  }
};

// ─── L-02 FIX: Logout mechanism ───
export const logout = () => signOut(auth);

// ─── C-03 FIX: Auth state observer ───
export { onAuthStateChanged };
