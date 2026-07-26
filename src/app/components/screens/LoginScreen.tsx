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
} from "../../../services/firebase";
import { useBudgetStore } from "../../../store/useBudgetStore";

export function LoginScreen() {
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useBudgetStore();

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
    <div className="relative min-h-screen bg-[#0a0a1f] text-white overflow-hidden">
      {/* Background glow graphics matching app aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(123,97,255,0.2),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(255,77,141,0.15),transparent_50%)] pointer-events-none" />



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
  );
}
