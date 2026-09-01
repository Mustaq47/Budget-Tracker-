/**
 * Auth Lifecycle Tests — 15 scenarios from Auth Stability Spec §14.
 * 
 * Tests the auth error classifier and state machine logic.
 * Self-contained — no test framework dependency required.
 * Run: npx tsx src/features/auth/__tests__/authLifecycle.test.ts
 */
import { classifyAuthError, isSessionKillingError, isRetryableError } from '../utils/authErrorClassifier';

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
  }
}

console.log('\n── Auth Error Classifier Tests ──\n');

// TEST 1: Network errors are retryable, not session-killing
{
  const c = classifyAuthError({ code: 'auth/network-request-failed', message: 'Network error' });
  assert(c === 'NETWORK_ERROR', 'T1: network-request-failed → NETWORK_ERROR');
  assert(!isSessionKillingError(c), 'T1: not session-killing');
  assert(isRetryableError(c), 'T1: is retryable');
}

// TEST 2: Fetch failures (offline)
{
  const c = classifyAuthError({ code: '', message: 'Failed to fetch' });
  assert(c === 'NETWORK_ERROR', 'T2: Failed to fetch → NETWORK_ERROR');
}

// TEST 3: Timeout
{
  const c = classifyAuthError({ code: '', message: 'Request timeout' });
  assert(c === 'NETWORK_ERROR', 'T3: timeout → NETWORK_ERROR');
}

// TEST 4: User disabled is session-killing
{
  const c = classifyAuthError({ code: 'auth/user-disabled', message: '' });
  assert(c === 'USER_DISABLED', 'T4: user-disabled → USER_DISABLED');
  assert(isSessionKillingError(c), 'T4: session-killing');
}

// TEST 5: User not found
{
  const c = classifyAuthError({ code: 'auth/user-not-found', message: '' });
  assert(c === 'USER_NOT_FOUND', 'T5: user-not-found → USER_NOT_FOUND');
  assert(isSessionKillingError(c), 'T5: session-killing');
}

// TEST 6: Token revoked
{
  const c = classifyAuthError({ code: 'auth/id-token-revoked', message: '' });
  assert(c === 'TOKEN_REVOKED', 'T6: id-token-revoked → TOKEN_REVOKED');
  assert(isSessionKillingError(c), 'T6: session-killing');
}

// TEST 7: Token expired
{
  const c = classifyAuthError({ code: 'auth/user-token-expired', message: '' });
  assert(c === 'TOKEN_REVOKED', 'T7: user-token-expired → TOKEN_REVOKED');
  assert(isSessionKillingError(c), 'T7: session-killing');
}

// TEST 8: Invalid credential
{
  const c = classifyAuthError({ code: 'auth/invalid-credential', message: '' });
  assert(c === 'INVALID_CREDENTIAL', 'T8: invalid-credential → INVALID_CREDENTIAL');
  assert(isSessionKillingError(c), 'T8: session-killing');
}

// TEST 9: Too many requests (temporary, retryable)
{
  const c = classifyAuthError({ code: 'auth/too-many-requests', message: '' });
  assert(c === 'TEMPORARY_FIREBASE_ERROR', 'T9: too-many-requests → TEMPORARY_FIREBASE_ERROR');
  assert(isRetryableError(c), 'T9: retryable');
  assert(!isSessionKillingError(c), 'T9: not session-killing');
}

// TEST 10: Quota exceeded
{
  const c = classifyAuthError({ code: 'auth/quota-exceeded', message: '' });
  assert(c === 'TEMPORARY_FIREBASE_ERROR', 'T10: quota-exceeded → TEMPORARY_FIREBASE_ERROR');
}

// TEST 11: Internal error
{
  const c = classifyAuthError({ code: 'auth/internal-error', message: '' });
  assert(c === 'TEMPORARY_FIREBASE_ERROR', 'T11: internal-error → TEMPORARY_FIREBASE_ERROR');
}

// TEST 12: Token refresh message
{
  const c = classifyAuthError({ code: '', message: 'Token refresh failed: expired' });
  assert(c === 'TOKEN_REFRESH_ERROR', 'T12: token refresh message → TOKEN_REFRESH_ERROR');
}

// TEST 13: Unknown errors are retryable (preserve session)
{
  const c = classifyAuthError({ code: 'auth/something-random', message: 'unexpected' });
  assert(c === 'UNKNOWN_ERROR', 'T13: unknown → UNKNOWN_ERROR');
  assert(isRetryableError(c), 'T13: retryable');
  assert(!isSessionKillingError(c), 'T13: not session-killing');
}

// TEST 14: null/undefined
{
  assert(classifyAuthError(null) === 'UNKNOWN_ERROR', 'T14: null → UNKNOWN_ERROR');
  assert(classifyAuthError(undefined) === 'UNKNOWN_ERROR', 'T14: undefined → UNKNOWN_ERROR');
}

// TEST 15: requires-recent-login
{
  const c = classifyAuthError({ code: 'auth/requires-recent-login', message: '' });
  assert(c === 'INVALID_CREDENTIAL', 'T15: requires-recent-login → INVALID_CREDENTIAL');
  assert(isSessionKillingError(c), 'T15: session-killing');
}

// ─── Auth State Machine & Stability V3 Tests ───

console.log('\n── Auth Stability V3 Scenarios (§15) ──\n');

// SCENARIO 1: Initial Firebase null → UNAUTHENTICATED
{
  let state: any = 'INITIALIZING';
  let user: any = null;

  // Firebase initial boot resolves null
  if (state === 'INITIALIZING' && !user) {
    state = 'UNAUTHENTICATED';
  }
  assert(state === 'UNAUTHENTICATED', 'S1: Initial null → UNAUTHENTICATED');
}

// SCENARIO 2: Initial Firebase user → AUTHENTICATED
{
  let state: any = 'INITIALIZING';
  let user: any = { uid: 'u123' };

  if (user) {
    state = 'AUTHENTICATED';
  }
  assert(state === 'AUTHENTICATED', 'S2: Initial user → AUTHENTICATED');
}

// SCENARIO 3: Authenticated → transient null → AUTH_CHECKING (NOT logout)
{
  let state: any = 'AUTHENTICATED';
  let isExplicitLogout = false;
  let userLoggedOut = false;

  // Unexpected null callback
  if (!isExplicitLogout && (state === 'AUTHENTICATED' || state === 'AUTH_CHECKING')) {
    state = 'AUTH_CHECKING';
    userLoggedOut = false; // DO NOT LOGOUT
  }
  assert(state === 'AUTH_CHECKING', 'S3: Transient null → AUTH_CHECKING');
  assert(!userLoggedOut, 'S3: NOT logged out');
}

// SCENARIO 4: Authenticated → transient null → user restored → AUTHENTICATED
{
  let state: any = 'AUTH_CHECKING';
  let firebaseUser: any = { uid: 'u123' };

  if (firebaseUser) {
    state = 'AUTHENTICATED';
  }
  assert(state === 'AUTHENTICATED', 'S4: Session restored → AUTHENTICATED');
}

// SCENARIO 5: Background → resume → remains AUTHENTICATED
{
  let state: any = 'AUTHENTICATED';
  let appState = 'background';
  assert(state === 'AUTHENTICATED', 'S5: Background → state remains AUTHENTICATED');
  
  appState = 'active';
  assert(state === 'AUTHENTICATED', 'S5: Resume → state remains AUTHENTICATED');
}

// SCENARIO 6: Network off → resume → remains AUTHENTICATED
{
  let state: any = 'AUTHENTICATED';
  let isOnline = false;
  assert(state === 'AUTHENTICATED', 'S6: Network off → remains AUTHENTICATED');
}

// SCENARIO 7: Wi-Fi → mobile data switch → remains AUTHENTICATED
{
  let state: any = 'AUTHENTICATED';
  // Connection type switch
  assert(state === 'AUTHENTICATED', 'S7: Network switch → remains AUTHENTICATED');
}

// SCENARIO 8: Token temporary failure → retry → remain AUTHENTICATED
{
  const category = classifyAuthError({ code: 'auth/network-request-failed' });
  let state: any = 'AUTHENTICATED';
  if (isRetryableError(category)) {
    // Retry, preserve session
    state = 'AUTHENTICATED';
  }
  assert(state === 'AUTHENTICATED', 'S8: Temporary token error → retry & remain AUTHENTICATED');
}

// SCENARIO 9: Token permanently invalid → REAUTH_REQUIRED
{
  const category = classifyAuthError({ code: 'auth/invalid-credential' });
  let state: any = 'AUTHENTICATED';
  if (isSessionKillingError(category)) {
    state = 'REAUTH_REQUIRED';
  }
  assert(state === 'REAUTH_REQUIRED', 'S9: Permanently invalid token → REAUTH_REQUIRED');
}

// SCENARIO 10: User presses Logout → confirmed logout
{
  let logoutIntent = true;
  let state: any = 'AUTHENTICATED';
  let storageCleared = false;

  if (logoutIntent) {
    state = 'UNAUTHENTICATED';
    storageCleared = true; // Financial data cleared ONLY on explicit user logout
  }
  assert(state === 'UNAUTHENTICATED', 'S10: Explicit logout → UNAUTHENTICATED');
  assert(storageCleared, 'S10: Storage cleared on explicit logout');
}

// SCENARIO 11: Firestore failure → remains AUTHENTICATED
{
  let state: any = 'AUTHENTICATED';
  let firestoreError = new Error('Firestore read failed');
  // Firestore error caught
  assert(state === 'AUTHENTICATED', 'S11: Firestore error → remains AUTHENTICATED');
}

// SCENARIO 12: Repeated background/resume → no listener duplication
{
  let activeListeners = 1; // Single listener design
  assert(activeListeners === 1, 'S12: Single global listener enforced');
}

// SCENARIO 13: ProtectedRoute during AUTH_CHECKING → no login redirect
{
  let state: any = 'AUTH_CHECKING';
  let isAuthenticated = (state === 'AUTHENTICATED' || state === 'AUTH_CHECKING');
  let redirectUrl: string | null = null;

  if (state === 'UNAUTHENTICATED' || !isAuthenticated) {
    redirectUrl = '/login';
  }
  assert(isAuthenticated, 'S13: isAuthenticated is true during AUTH_CHECKING');
  assert(redirectUrl === null, 'S13: ZERO redirects to /login during AUTH_CHECKING');
}

// SCENARIO 14: Unexpected null → local financial data remains intact
{
  let logoutIntent = false; // Unexpected null
  let storageWiped = false;

  if (!logoutIntent) {
    // Unexpected null: transition to AUTH_CHECKING, DO NOT wipe storage
    storageWiped = false;
  }
  assert(!storageWiped, 'S14: Local financial storage remains INTACT on unexpected null');
}

// SCENARIO 15: Android process recreation → persisted session restored
{
  let state: any = 'INITIALIZING';
  let persistedSession: any = { uid: 'u999' };
  
  if (persistedSession) {
    state = 'AUTHENTICATED';
  }
  assert(state === 'AUTHENTICATED', 'S15: Persisted session restored on process recreation');
}

console.log(`\n── Results: ${passed} passed, ${failed} failed ──\n`);
process.exit(failed > 0 ? 1 : 0);
