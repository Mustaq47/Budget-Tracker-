import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { useBudgetStore } from "../../store/useBudgetStore";
import { onAuthStateChanged, auth } from "../../services/firebase";

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, authLoading, setUser, setAuthLoading } = useBudgetStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber,
        });
      } else {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1f] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-full border-4 border-[#7B61FF] border-t-transparent animate-spin mb-4" />
        <div className="text-white/60 text-sm tracking-tight">Authenticating...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
