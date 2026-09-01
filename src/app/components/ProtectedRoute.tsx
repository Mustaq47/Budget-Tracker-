import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useBudgetStore } from "../../store/useBudgetStore";
import { sanitizeReturnUrl } from "../../features/auth/hooks/useAuthSecurity";

/**
 * ProtectedRoute Guard — Auth State Machine Integration.
 *
 * Uses authState instead of boolean checks:
 *   INITIALIZING    → Loading/Splash (NEVER redirects)
 *   AUTHENTICATED   → Protected content
 *   UNAUTHENTICATED → Login redirect
 *   REAUTH_REQUIRED → Reauth prompt
 *   ERROR           → Recoverable error UI
 */
export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, authState, hasCompletedOnboarding, user } = useBudgetStore();
  const location = useLocation();

  // ── Trial expiry check ──
  if (isAuthenticated && user?.uid?.startsWith("trial_") && user.trialStartedAt) {
    const TRIAL_LIMIT_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
    if (Date.now() - user.trialStartedAt > TRIAL_LIMIT_MS) {
      if (location.pathname !== "/login") {
        return <Navigate to="/login?trial_expired=true" replace />;
      }
    }
  }

  // ── INITIALIZING: Never redirect, show loading ──
  if (authState === 'INITIALIZING') {
    return (
      <div className="min-h-screen bg-[#0a0a1f] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-full border-4 border-[#7B61FF] border-t-transparent animate-spin mb-4" />
        <div className="text-white/60 text-sm tracking-tight">Authenticating...</div>
      </div>
    );
  }

  // ── AUTH_CHECKING: Temporary state uncertainty (e.g. background wake-up). NEVER redirect! ──
  if (authState === 'AUTH_CHECKING') {
    return children ? <>{children}</> : <Outlet />;
  }

  // ── REAUTH_REQUIRED: Prompt user to re-authenticate ──
  if (authState === 'REAUTH_REQUIRED') {
    return (
      <div className="min-h-screen bg-[#0a0a1f] flex flex-col items-center justify-center text-white p-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold mb-2">Session Expired</h2>
        <p className="text-white/60 text-sm text-center mb-6 max-w-xs">
          Your session needs to be refreshed. Please sign in again to continue.
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7B61FF] to-[#6C52E8] text-white text-sm font-bold shadow-lg hover:opacity-90 transition-all cursor-pointer"
        >
          Sign In Again
        </button>
      </div>
    );
  }

  // ── ERROR: Recoverable error UI ──
  if (authState === 'ERROR') {
    return (
      <div className="min-h-screen bg-[#0a0a1f] flex flex-col items-center justify-center text-white p-6">
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold mb-2">Authentication Error</h2>
        <p className="text-white/60 text-sm text-center mb-6 max-w-xs">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl bg-white/10 text-white text-sm font-bold shadow-lg hover:bg-white/15 transition-all cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Onboarding redirect ──
  if (!hasCompletedOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // ── UNAUTHENTICATED: Redirect to login ──
  if (!isAuthenticated && location.pathname !== "/login" && location.pathname !== "/onboarding") {
    // Sanitize current location path to prevent open redirect vulnerabilities
    const safeReturnPath = sanitizeReturnUrl(location.pathname);
    const returnParam = safeReturnPath !== "/" ? `?returnUrl=${encodeURIComponent(safeReturnPath)}` : "";
    return <Navigate to={`/login${returnParam}`} replace />;
  }

  if (hasCompletedOnboarding && isAuthenticated && location.pathname === "/onboarding") {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

