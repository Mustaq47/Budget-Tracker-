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
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

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
  const safeMessage = AUTH_ERROR_MAP[code] || 'An unexpected error occurred. Please try again.';
  // In development, log the real error for debugging
  if (import.meta.env.DEV) {
    console.warn('[Auth Debug]', code, error?.message);
  }
  return new Error(safeMessage);
}

// ─── Auth Helpers (all throw sanitized errors) ───

export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    throw safeAuthError(error);
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
