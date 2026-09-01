/**
 * Auth Error Classifier — Distinguishes transient errors from session-invalidating ones.
 * 
 * Categories:
 *   NETWORK        — no internet, DNS failure, timeout
 *   TEMPORARY      — Firebase temporary outage, quota exceeded
 *   TOKEN_REFRESH  — token refresh failed (retryable)
 *   INVALID_CRED   — credential genuinely invalid (session dead)
 *   USER_DISABLED  — account disabled by admin
 *   USER_NOT_FOUND — account deleted
 *   TOKEN_REVOKED  — refresh token revoked server-side
 *   UNKNOWN        — unclassified (preserve session)
 */

export type AuthErrorCategory =
  | 'NETWORK_ERROR'
  | 'TEMPORARY_FIREBASE_ERROR'
  | 'TOKEN_REFRESH_ERROR'
  | 'INVALID_CREDENTIAL'
  | 'USER_DISABLED'
  | 'USER_NOT_FOUND'
  | 'TOKEN_REVOKED'
  | 'UNKNOWN_ERROR';

/** Errors that MUST terminate the session */
const SESSION_KILLING_CATEGORIES: AuthErrorCategory[] = [
  'INVALID_CREDENTIAL',
  'USER_DISABLED',
  'USER_NOT_FOUND',
  'TOKEN_REVOKED',
];

/** Errors that should be retried without touching session state */
const RETRYABLE_CATEGORIES: AuthErrorCategory[] = [
  'NETWORK_ERROR',
  'TEMPORARY_FIREBASE_ERROR',
  'TOKEN_REFRESH_ERROR',
  'UNKNOWN_ERROR',
];

/**
 * Classify a Firebase auth error into a category.
 */
export function classifyAuthError(error: unknown): AuthErrorCategory {
  if (!error) return 'UNKNOWN_ERROR';

  const code = (error as any)?.code || '';
  const message = ((error as any)?.message || '').toLowerCase();

  // ── Network errors ──
  if (
    code === 'auth/network-request-failed' ||
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('err_internet_disconnected') ||
    message.includes('failed to fetch')
  ) {
    return 'NETWORK_ERROR';
  }

  // ── Session-killing errors ──
  if (code === 'auth/user-disabled') return 'USER_DISABLED';
  if (code === 'auth/user-not-found') return 'USER_NOT_FOUND';
  if (code === 'auth/user-token-expired' || code === 'auth/id-token-revoked') return 'TOKEN_REVOKED';
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/invalid-user-token' ||
    code === 'auth/requires-recent-login'
  ) {
    return 'INVALID_CREDENTIAL';
  }

  // ── Temporary Firebase errors ──
  if (
    code === 'auth/too-many-requests' ||
    code === 'auth/quota-exceeded' ||
    code === 'auth/internal-error' ||
    code === 'unavailable' ||
    message.includes('internal') ||
    message.includes('unavailable') ||
    message.includes('quota')
  ) {
    return 'TEMPORARY_FIREBASE_ERROR';
  }

  // ── Token refresh specific ──
  if (message.includes('token') && (message.includes('refresh') || message.includes('expired'))) {
    return 'TOKEN_REFRESH_ERROR';
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Returns true if this error category should terminate the user's session.
 */
export function isSessionKillingError(category: AuthErrorCategory): boolean {
  return SESSION_KILLING_CATEGORIES.includes(category);
}

/**
 * Returns true if the error is transient and should be retried.
 */
export function isRetryableError(category: AuthErrorCategory): boolean {
  return RETRYABLE_CATEGORIES.includes(category);
}
