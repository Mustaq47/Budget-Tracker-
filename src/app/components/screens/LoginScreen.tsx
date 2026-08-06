import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import UniversalLogin from "../../../features/auth/components/UniversalLogin";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  sendPhoneOTP,
  resetPassword,
  setupRecaptcha,
  handleGoogleRedirectResult,
} from "../../../services/firebase";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import {
  useAuthRateLimit,
  sanitizeReturnUrl,
  sanitizeEmail,
} from "../../../features/auth/hooks/useAuthSecurity";
import { logger } from "../../../utils/logger";
import { PrivacyPolicyModal } from "../modals/PrivacyPolicyModal";
import { TermsConditionsModal } from "../modals/TermsConditionsModal";
import { HelpCenterModal } from "../modals/HelpCenterModal";

export function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeModal, setActiveModal] = React.useState<"privacy" | "terms" | "help" | null>(null);
  const { setUser, setHasAcceptedTerms, isAuthenticated, theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const { checkRateLimit, recordFailedAttempt } = useAuthRateLimit();

  // Determine safe redirect path from returnUrl query parameter
  const returnUrlParam = new URLSearchParams(location.search).get("returnUrl");
  const safeRedirectPath = sanitizeReturnUrl(returnUrlParam, "/");

  // Check for pending Google redirect result on mount
  useEffect(() => {
    handleGoogleRedirectResult();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(safeRedirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, safeRedirectPath]);

  const handleAuthSuccess = (userPayload: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    phoneNumber?: string | null;
  }, isNewAccount: boolean = false) => {
    if (isNewAccount) {
      setHasAcceptedTerms(false);
    } else {
      setHasAcceptedTerms(true);
    }
    setUser(userPayload);
    navigate(safeRedirectPath, { replace: true });
  };

  const handleEmailSignIn = async ({ email, password }: { email: string; password: string }) => {
    if (!checkRateLimit()) {
      throw new Error("Too many login attempts. Please wait 30 seconds before retrying.");
    }
    try {
      const cleanEmail = sanitizeEmail(email);
      const res = await signInWithEmail(cleanEmail, password);
      if (res?.user) {
        handleAuthSuccess({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || cleanEmail.split("@")[0],
          photoURL: res.user.photoURL,
        }, false);
      }
    } catch (err) {
      recordFailedAttempt();
      throw err;
    }
  };

  const handleEmailSignUp = async ({ email, password, name }: { email: string; password: string; name?: string }) => {
    if (!checkRateLimit()) {
      throw new Error("Too many sign up attempts. Please wait 30 seconds before retrying.");
    }
    try {
      const cleanEmail = sanitizeEmail(email);
      const res = await signUpWithEmail(cleanEmail, password, name);
      if (res?.user) {
        handleAuthSuccess({
          uid: res.user.uid,
          email: res.user.email,
          displayName: name || res.user.displayName || cleanEmail.split("@")[0],
          photoURL: res.user.photoURL,
        }, true);
      }
    } catch (err) {
      recordFailedAttempt();
      throw err;
    }
  };

  const handleGoogleSignIn = async (isSignUp = false) => {
    if (!checkRateLimit()) {
      throw new Error("Too many login attempts. Please wait 30 seconds before retrying.");
    }
    try {
      const res = await signInWithGoogle(isSignUp);
      if (res?.user) {
        handleAuthSuccess({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          photoURL: res.user.photoURL,
        }, isSignUp);
      }
    } catch (err) {
      recordFailedAttempt();
      throw err;
    }
  };

  const handlePhoneAuth = async ({ countryCode, phone }: { countryCode: string; phone: string }) => {
    try {
      const recaptcha = setupRecaptcha("recaptcha-container");
      await sendPhoneOTP(`${countryCode}${phone}`, recaptcha);
    } catch (err) {
      logger.warn("Phone OTP Error:", err);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    // Requires confirmationResult from sendPhoneOTP, which is missing from state right now.
    // Throwing error for now until phone state is wired up properly.
    throw new Error("Phone auth requires full wiring. Temporarily disabled for security.");
  };

  const handlePasswordReset = async ({ email }: { email: string }) => {
    await resetPassword(email);
  };

  return (
    <div className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${activeTheme.bgClass} ${activeTheme.textColor}`}>
      {/* Ambient Radial Glow 1 — matches Root.tsx */}
      <div 
        className="absolute inset-0 opacity-40 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${activeTheme.primaryColor}25, transparent 55%)`
        }}
      />
      {/* Ambient Radial Glow 2 */}
      <div 
        className="absolute inset-0 opacity-30 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 0% 100%, ${activeTheme.secondaryColor}20, transparent 50%)`
        }}
      />

      {/* Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">
        <UniversalLogin
          companyName="coZify"
          onEmailSignIn={handleEmailSignIn}
          onEmailSignUp={handleEmailSignUp}
          onGoogleSignIn={handleGoogleSignIn}
          onPhoneAuth={handlePhoneAuth}
          onVerifyOTP={handleVerifyOTP}
          onPasswordReset={handlePasswordReset}
          onAuthSuccess={() => navigate("/")}
          onOpenPrivacyPolicy={() => setActiveModal("privacy")}
          onOpenTerms={() => setActiveModal("terms")}
          onOpenHelp={() => setActiveModal("help")}
        />
      </div>

      <PrivacyPolicyModal
        isOpen={activeModal === "privacy"}
        onClose={() => setActiveModal(null)}
      />
      <TermsConditionsModal
        isOpen={activeModal === "terms"}
        onClose={() => setActiveModal(null)}
      />
      <HelpCenterModal
        isOpen={activeModal === "help"}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
