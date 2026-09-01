/**
 * Auth Diagnostics — Dev-only ring buffer for auth lifecycle events.
 * 
 * Records auth state transitions, token refresh attempts, route decisions,
 * and logout reasons. NEVER logs tokens, passwords, or credentials.
 */

export interface AuthDiagnosticEvent {
  timestamp: string;
  event: string;
  previousAuthState?: string;
  nextAuthState?: string;
  authState?: string;
  uidPresent?: boolean;
  firebaseUserPresent?: boolean;
  currentUserPresent?: boolean;
  appState?: 'active' | 'background' | 'inactive';
  networkOnline?: boolean;
  explicitLogoutIntent?: boolean;
  recoveryAttempt?: number;
  recoveryResult?: string;
  detail?: string;
}

const MAX_EVENTS = 100;
const eventBuffer: AuthDiagnosticEvent[] = [];

/**
 * Record an auth diagnostic event (dev only — no-op in production).
 */
export function logAuthEvent(
  event: string,
  detail?: string,
  extra?: Partial<Omit<AuthDiagnosticEvent, 'timestamp' | 'event' | 'detail'>>
): void {
  if (!import.meta.env.DEV) return;

  const entry: AuthDiagnosticEvent = {
    timestamp: new Date().toISOString(),
    event,
    networkOnline: typeof navigator !== 'undefined' ? navigator.onLine : undefined,
    ...extra,
    ...(detail ? { detail } : {}),
  };

  eventBuffer.push(entry);
  if (eventBuffer.length > MAX_EVENTS) {
    eventBuffer.shift();
  }

  console.info(`[AuthDiag] ${event}${detail ? ` — ${detail}` : ''}`, extra || '');

  // Log stack trace for critical logout or null events in DEV
  if (event.includes('LOGOUT') || event.includes('NULL') || event.includes('SESSION_KILLED')) {
    console.trace(`[AuthDiag StackTrace] ${event}`);
  }
}

/**
 * Get the full diagnostic buffer (dev only).
 */
export function getAuthDiagnostics(): AuthDiagnosticEvent[] {
  return [...eventBuffer];
}

/**
 * Clear diagnostics buffer.
 */
export function clearAuthDiagnostics(): void {
  eventBuffer.length = 0;
}
