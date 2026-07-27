import { useEffect } from "react";
import { useNavigate } from "react-router";
import UniversalLogin from "../../../features/auth/components/UniversalLogin";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  sendPhoneOTP,
  verifyOTP,
  setupRecaptcha,
  handleGoogleRedirectResult,
  onAuthStateChanged,
  auth,
} from "../../../services/firebase";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";

export function LoginScreen() {
  const navigate = useNavigate();
  const { setUser, isAuthenticated, theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);

  // Listen for auth state changes (handles redirect result automatically)
  useEffect(() => {
    // Check for pending Google redirect result on mount
    handleGoogleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber,
        });
      }
    });
    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleAuthSuccess = (userPayload: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    phoneNumber?: string | null;
  }) => {
    setUser(userPayload);
    navigate("/", { replace: true });
  };

  const handleEmailSignIn = async ({ email, password }: { email: string; password: string }) => {
    const res = await signInWithEmail(email, password);
    if (res?.user) {
      handleAuthSuccess({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || email.split("@")[0],
        photoURL: res.user.photoURL,
      });
    }
  };

  const handleEmailSignUp = async ({ email, password, name }: { email: string; password: string; name?: string }) => {
    const res = await signUpWithEmail(email, password, name);
    if (res?.user) {
      handleAuthSuccess({
        uid: res.user.uid,
        email: res.user.email,
        displayName: name || res.user.displayName || email.split("@")[0],
        photoURL: res.user.photoURL,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const res = await signInWithGoogle();
    if (res?.user) {
      handleAuthSuccess({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName,
        photoURL: res.user.photoURL,
      });
    }
  };

  const handlePhoneAuth = async ({ countryCode, phone }: { countryCode: string; phone: string }) => {
    try {
      const recaptcha = setupRecaptcha("recaptcha-container");
      await sendPhoneOTP(`${countryCode}${phone}`, recaptcha);
    } catch (err) {
      console.warn("Phone OTP Error:", err);
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
          companyName="ZENTRO Finance"
          onEmailSignIn={handleEmailSignIn}
          onEmailSignUp={handleEmailSignUp}
          onGoogleSignIn={handleGoogleSignIn}
          onPhoneAuth={handlePhoneAuth}
          onVerifyOTP={handleVerifyOTP}
          onPasswordReset={handlePasswordReset}
          onAuthSuccess={() => navigate("/")}
        />
      </div>
    </div>
  );
}
