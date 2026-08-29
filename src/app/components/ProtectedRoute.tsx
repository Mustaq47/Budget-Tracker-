import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useBudgetStore } from "../../store/useBudgetStore";
import { sanitizeReturnUrl } from "../../features/auth/hooks/useAuthSecurity";

/**
 * Enterprise-Grade ProtectedRoute Guard (Phase 1 Login Security).
 *
 * 1. Checks unified auth loading & authentication state without duplicate subscriptions.
 * 2. Redirects unauthenticated users to /login while preserving safe returnUrl.
 * 3. Sanitizes returnUrl to prevent Open Redirect vulnerabilities.
 */
export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, authLoading, hasCompletedOnboarding } = useBudgetStore();
  const location = useLocation();

  if (authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a1f] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-full border-4 border-[#7B61FF] border-t-transparent animate-spin mb-4" />
        <div className="text-white/60 text-sm tracking-tight">Authenticating...</div>
      </div>
    );
  }

  // Allow users to perform onboarding setup flow even before signing in
  if (!hasCompletedOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

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
