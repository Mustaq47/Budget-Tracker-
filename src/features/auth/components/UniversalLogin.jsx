import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * UniversalLogin — Security-Hardened Authentication Component
 * 
 * Security fixes applied:
 *   C-02: Password policy enforcement
 *   C-04: Rate limiting / brute-force protection (client-side)
 *   H-03: Password reset cooldown (60s)
 *   H-04: OTP attempt limit (max 5)
 *   H-05: Resend OTP throttle (60s)
 *   H-07: Clear sensitive state after auth
 *   M-01: Email normalization (trim, lowercase, NFC)
 *   M-02: Phone E.164 validation
 *   M-03: autocomplete attributes
 *   M-08: Toast notifications instead of alert()
 *   L-01: rel="noopener noreferrer" on links
 *   L-04: aria-live on error messages
 *   L-05: Password auto-revert to masked
 */

// ─── C-02: Password Policy ───
const PASSWORD_POLICY = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

function validatePassword(pw) {
  const errors = [];
  if (pw.length < PASSWORD_POLICY.minLength) errors.push(`At least ${PASSWORD_POLICY.minLength} characters`);
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(pw)) errors.push('One uppercase letter');
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(pw)) errors.push('One lowercase letter');
  if (PASSWORD_POLICY.requireNumber && !/\d/.test(pw)) errors.push('One number');
  if (PASSWORD_POLICY.requireSpecial && !/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(pw)) errors.push('One special character');
  return errors;
}

// ─── M-01: Email normalization ───
function normalizeEmail(val) {
  return val.trim().toLowerCase().normalize('NFC');
}

// ─── M-02: Phone E.164 validation ───
function isValidPhone(countryCode, phone) {
  const digits = phone.replace(/\D/g, '');
  const full = `${countryCode}${digits}`;
  return /^\+[1-9]\d{6,14}$/.test(full) && digits.length >= 4;
}

// ─── C-04: Brute-force rate limiter ───
function useRateLimiter(maxAttempts = 5, lockoutMs = 30000) {
  const attemptsRef = useRef(0);
  const lockoutUntilRef = useRef(0);

  const isLocked = useCallback(() => {
    return Date.now() < lockoutUntilRef.current;
  }, []);

  const getRemainingLockout = useCallback(() => {
    const remaining = lockoutUntilRef.current - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }, []);

  const recordAttempt = useCallback(() => {
    attemptsRef.current += 1;
    if (attemptsRef.current >= maxAttempts) {
      lockoutUntilRef.current = Date.now() + lockoutMs;
      attemptsRef.current = 0;
    }
  }, [maxAttempts, lockoutMs]);

  const reset = useCallback(() => {
    attemptsRef.current = 0;
    lockoutUntilRef.current = 0;
  }, []);

  return { isLocked, getRemainingLockout, recordAttempt, reset };
}

// ─── Cooldown timer hook ───
function useCooldown(durationSeconds = 60) {
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef(null);

  const start = useCallback(() => {
    setRemaining(durationSeconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [durationSeconds]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return { remaining, isActive: remaining > 0, start };
}

export default function UniversalLogin({
  initialView = 'login',
  companyName = "SecureAuth Inc.",
  onGoogleSignIn,
  onEmailSignIn,
  onEmailSignUp,
  onPhoneAuth,
  onPasswordReset,
  onVerifyOTP,
  onLogout = () => {},
  onAuthSuccess,
  allowPhoneAuth = true,
  countryCodes = [
    { code: "+1", label: "+1 (US)" },
    { code: "+44", label: "+44 (UK)" },
    { code: "+61", label: "+61 (AU)" },
    { code: "+91", label: "+91 (IN)" }
  ]
}) {
  const [view, setView] = useState(initialView);
  const [activeTab, setActiveTab] = useState('email');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  
  const [countryCode, setCountryCode] = useState(countryCodes[0]?.code || '+1');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0); // H-04
  const OTP_MAX_ATTEMPTS = 5;
  
  // General
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('error'); // 'error' | 'success'

  // ─── C-04: Rate limiter for login ───
  const loginLimiter = useRateLimiter(5, 30000);
  
  // ─── H-03 + H-05: Cooldown timers ───
  const resetCooldown = useCooldown(60);
  const otpResendCooldown = useCooldown(60);

  // ─── L-05: Auto-revert password visibility after 3s ───
  const passwordTimerRef = useRef(null);
  useEffect(() => {
    if (showPassword) {
      if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current);
      passwordTimerRef.current = setTimeout(() => setShowPassword(false), 3000);
    }
    return () => { if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current); };
  }, [showPassword]);

  // ─── H-07: Clear sensitive data helper ───
  const clearSensitiveState = useCallback(() => {
    setPassword('');
    setOtpCode('');
    setShowPassword(false);
  }, []);

  const setError = (msg) => { setStatusMessage(msg); setStatusType('error'); };
  const setSuccess = (msg) => { setStatusMessage(msg); setStatusType('success'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    
    // ─── C-04: Check lockout ───
    if (loginLimiter.isLocked()) {
      setError(`Too many attempts. Try again in ${loginLimiter.getRemainingLockout()} seconds.`);
      return;
    }

    // ─── M-02: Phone validation ───
    if ((view === 'login' || view === 'signup') && activeTab === 'phone') {
      if (!isValidPhone(countryCode, phone)) {
        setPhoneError('Enter a valid phone number');
        return;
      }
    }

    // ─── C-02: Password policy on signup ───
    if (view === 'signup' && activeTab === 'email') {
      const pwErrors = validatePassword(password);
      if (pwErrors.length > 0) {
        setPasswordErrors(pwErrors);
        return;
      }
    }

    setIsLoading(true);
    
    try {
      if (view === 'login') {
        if (activeTab === 'email') {
          await onEmailSignIn?.({ email: normalizeEmail(email), password });
          clearSensitiveState();
          loginLimiter.reset();
        } else {
          await onPhoneAuth?.({ countryCode, phone: phone.replace(/\D/g, ''), isSignUp: false });
          otpResendCooldown.start();
          setView('otp');
        }
      } else if (view === 'signup') {
        if (activeTab === 'email') {
          await onEmailSignUp?.({ email: normalizeEmail(email), name: fullName.trim(), password });
          clearSensitiveState();
          loginLimiter.reset();
        } else {
          await onPhoneAuth?.({ countryCode, phone: phone.replace(/\D/g, ''), isSignUp: true });
          otpResendCooldown.start();
          setView('otp');
        }
      } else if (view === 'forgot') {
        await onPasswordReset?.({ email: normalizeEmail(email) });
        resetCooldown.start();
        setView('reset-sent');
      } else if (view === 'otp') {
        // ─── H-04: OTP attempt limit ───
        if (otpAttempts >= OTP_MAX_ATTEMPTS) {
          setOtpError('Maximum attempts reached. Please request a new code.');
          return;
        }
        setOtpError('');
        try {
          await onVerifyOTP?.(otpCode);
          clearSensitiveState();
          setOtpAttempts(0);
        } catch (otpErr) {
          setOtpAttempts(prev => prev + 1);
          setOtpError(
            otpAttempts + 1 >= OTP_MAX_ATTEMPTS
              ? 'Maximum attempts reached. Please request a new code.'
              : otpErr?.message || 'Invalid code'
          );
          loginLimiter.recordAttempt();
        }
      }
    } catch (error) {
      loginLimiter.recordAttempt();
      setError(error?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── H-05: Throttled resend handler ───
  const handleResendOTP = async () => {
    if (otpResendCooldown.isActive) return;
    try {
      await onPhoneAuth?.({ countryCode, phone: phone.replace(/\D/g, ''), isSignUp: false });
      otpResendCooldown.start();
      setOtpAttempts(0);
      setOtpCode('');
      setSuccess('New code sent.');
    } catch (error) {
      setError(error?.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF9FF] text-[#051A3E] font-sans antialiased relative">

      {/* Centered Modal Overlay with Blurred Background for Account Not Found */}
      {statusMessage && (
        statusMessage.toLowerCase().includes("haven't created") ||
        statusMessage.toLowerCase().includes("sign-up to create")
      ) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051A3E]/45 backdrop-blur-md animate-fadeIn">
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 border border-[#DFE1E6] shadow-2xl text-center animate-prompt-bounce relative overflow-hidden"
          >
            {/* Ambient Background Glow inside modal */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#2563EB]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#7B61FF]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#EFF6FF] to-[#EEF2FF] border border-[#BFDBFE] flex items-center justify-center mx-auto mb-4 shadow-sm text-[#2563EB]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>

            {/* Title & Message */}
            <h3 id="modal-title" className="text-xl font-bold text-[#051A3E] mb-2">
              Account Not Found
            </h3>
            <p className="text-sm text-[#434654] leading-relaxed mb-6">
              You haven't created an account, so sign-up to create an account.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setStatusMessage('');
                  setView('signup');
                }}
                className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign Up to Create Account</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setStatusMessage('')}
                className="w-full py-2.5 px-4 bg-transparent hover:bg-gray-100 text-[#434654] font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container — Screen Optimized & Mobile Responsive */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 md:px-8 py-6 sm:py-10 md:py-12 w-full">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-white border border-[#DFE1E6] shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 relative transition-all">

          {/* L-04: Status Message with aria-live — Standard Alerts */}
          {statusMessage && !(
            statusMessage.toLowerCase().includes("haven't created") ||
            statusMessage.toLowerCase().includes("sign-up to create")
          ) && (
            <div 
              role="alert"
              aria-live="polite"
              className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-prompt-bounce ${
                statusType === 'error' 
                  ? 'bg-red-50 border border-red-200 text-red-700' 
                  : 'bg-green-50 border border-green-200 text-green-700'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {statusType === 'error' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                )}
              </svg>
              <span>{statusMessage}</span>
            </div>
          )}

          {/* ============ RESET SENT CONFIRMATION ============ */}
          {view === 'reset-sent' ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#051A3E] mb-2">Check your email</h1>
              <p className="text-sm text-[#434654] mb-6">
                If an account exists for <strong className="text-[#051A3E]">{email}</strong>, we sent a password reset link.
                Check your inbox and spam folder.
              </p>
              <button
                type="button"
                onClick={() => { setView('login'); setStatusMessage(''); }}
                className="w-full bg-[#0052CC] text-white rounded-xl py-3 text-xs font-semibold hover:bg-[#003D9B] active:scale-[0.99] transition-all shadow-md cursor-pointer"
              >
                Back to Sign In
              </button>
              <button
                type="button"
                disabled={resetCooldown.isActive}
                onClick={() => { setView('forgot'); setStatusMessage(''); }}
                className="mt-3 text-xs text-[#0052CC] font-medium hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetCooldown.isActive 
                  ? `Resend available in ${resetCooldown.remaining}s` 
                  : "Didn't receive it? Try again"
                }
              </button>
            </div>

          /* ============ OTP VERIFICATION ============ */
          ) : view === 'otp' ? (
            <div>
              <div className="text-center mb-6 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#DAE2FF] flex items-center justify-center mb-3 text-[#003D9B]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-[#051A3E] mb-2 tracking-tight">
                  Verify Phone Number
                </h1>
                <p className="text-sm text-[#434654] text-center">
                  Enter the 6-digit code sent to <strong className="text-[#051A3E]">{countryCode} ••••{phone.slice(-4)}</strong>
                </p>
              </div>

              {/* H-04: Attempt counter */}
              {otpAttempts > 0 && otpAttempts < OTP_MAX_ATTEMPTS && (
                <p className="text-xs text-amber-600 text-center mb-3" role="alert" aria-live="polite">
                  {OTP_MAX_ATTEMPTS - otpAttempts} attempt{OTP_MAX_ATTEMPTS - otpAttempts > 1 ? 's' : ''} remaining
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="otp-code" className="block text-xs font-semibold text-[#051A3E] mb-1.5">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="otp-code"
                    required
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    value={otpCode}
                    onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                    className={`w-full bg-[#FAFBFC] border rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-bold text-[#051A3E] placeholder-[#737685] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition-all ${
                      otpError ? 'border-red-400' : 'border-[#DFE1E6]'
                    }`}
                    placeholder="000000"
                    autoComplete="one-time-code"
                  />
                  {otpError && (
                    <p className="mt-1.5 text-xs text-red-600" role="alert" aria-live="polite">{otpError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6 || otpAttempts >= OTP_MAX_ATTEMPTS}
                  className="w-full bg-[#0052CC] text-white rounded-xl py-3 text-xs font-semibold hover:bg-[#003D9B] active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>

              <div className="mt-6 text-center border-t border-[#DFE1E6] pt-4 flex flex-col gap-2">
                {/* H-05: Throttled resend */}
                <button
                  type="button"
                  disabled={otpResendCooldown.isActive}
                  onClick={handleResendOTP}
                  className="text-xs font-medium text-[#0052CC] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpResendCooldown.isActive 
                    ? `Resend in ${otpResendCooldown.remaining}s` 
                    : 'Resend code'
                  }
                </button>
                <button
                  type="button"
                  onClick={() => { setView('login'); setOtpCode(''); setOtpError(''); setStatusMessage(''); setOtpAttempts(0); }}
                  className="text-xs font-semibold text-[#434654] hover:text-[#051A3E] transition-all inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Login</span>
                </button>
              </div>
            </div>

          /* ============ FORGOT PASSWORD ============ */
          ) : view === 'forgot' ? (
            <div>
              <div className="text-center mb-6 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#DAE2FF] flex items-center justify-center mb-3 text-[#003D9B]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#051A3E] mb-2 tracking-tight">
                  Forgot Password
                </h1>
                <p className="text-sm text-[#434654] text-center">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-xs font-semibold text-[#051A3E] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="reset-email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAFBFC] border border-[#DFE1E6] rounded-xl px-4 py-2.5 text-sm text-[#051A3E] placeholder-[#737685] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition-all"
                    placeholder="Enter your work email"
                    autoComplete="email"
                  />
                </div>

                {/* H-03: Reset cooldown */}
                <button
                  type="submit"
                  disabled={isLoading || resetCooldown.isActive}
                  className="w-full bg-[#0052CC] text-white rounded-xl py-3 text-xs font-semibold hover:bg-[#003D9B] active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading 
                    ? 'Sending...' 
                    : resetCooldown.isActive 
                      ? `Wait ${resetCooldown.remaining}s` 
                      : 'Reset Password'
                  }
                </button>
              </form>

              <div className="mt-6 text-center border-t border-[#DFE1E6] pt-4">
                <button
                  type="button"
                  onClick={() => { setView('login'); setStatusMessage(''); }}
                  className="text-xs font-semibold text-[#0052CC] hover:underline transition-all inline-flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Login</span>
                </button>
              </div>

              <div className="mt-4 bg-[#F1F3FF] rounded-xl p-3 flex items-center gap-3">
                <svg className="w-5 h-5 text-[#004B59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-xs text-[#434654] flex-1">
                  Secure Session Active. Your connection is encrypted.
                </p>
              </div>
            </div>

          /* ============ LOGIN & SIGNUP ============ */
          ) : (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#051A3E] mb-2 tracking-tight">
                  {view === 'login' ? 'Sign-In' : 'Create your account'}
                </h1>
                <p className="text-sm text-[#434654]">
                  {view === 'login' 
                    ? 'Welcome back. Please enter your details.' 
                    : `Join ${companyName.split(' ')[0]} for seamless access.`
                  }
                </p>
              </div>

              {/* Google */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    setStatusMessage('');
                    try {
                      await onGoogleSignIn?.(view === 'signup');
                      clearSensitiveState();
                    } catch (err) {
                      setError(err?.message || 'Google sign-in failed.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-[#DFE1E6] rounded-xl py-3 px-4 hover:bg-[#F1F3FF] active:scale-[0.99] transition-all cursor-pointer font-medium text-sm text-[#051A3E] disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-[#DFE1E6] flex-grow"></div>
                <span className="text-xs font-semibold text-[#737685] uppercase tracking-wider">or</span>
                <div className="h-px bg-[#DFE1E6] flex-grow"></div>
              </div>

              {/* Tabs */}
              {allowPhoneAuth && (
                <div className="flex p-1 bg-[#F1F3FF] rounded-xl mb-6" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'email'}
                    onClick={() => { setActiveTab('email'); setStatusMessage(''); setPhoneError(''); }}
                    className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'email'
                        ? 'bg-white text-[#003D9B] shadow-sm'
                        : 'text-[#434654] hover:text-[#051A3E]'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'phone'}
                    onClick={() => { setActiveTab('phone'); setStatusMessage(''); setPasswordErrors([]); }}
                    className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'phone'
                        ? 'bg-white text-[#003D9B] shadow-sm'
                        : 'text-[#434654] hover:text-[#051A3E]'
                    }`}
                  >
                    Phone
                  </button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {activeTab === 'email' ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-[#051A3E] mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={(e) => setEmail(normalizeEmail(e.target.value))}
                        className="w-full bg-[#FAFBFC] border border-[#DFE1E6] rounded-xl px-4 py-2.5 text-sm text-[#051A3E] placeholder-[#737685] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition-all"
                        placeholder="name@company.com"
                        autoComplete="email"
                      />
                    </div>

                    {view === 'signup' && (
                      <div>
                        <label htmlFor="full-name" className="block text-xs font-semibold text-[#051A3E] mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="full-name"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-[#FAFBFC] border border-[#DFE1E6] rounded-xl px-4 py-2.5 text-sm text-[#051A3E] placeholder-[#737685] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition-all"
                          placeholder="Jane Doe"
                          autoComplete="name"
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="password" className="block text-xs font-semibold text-[#051A3E]">
                          {view === 'login' ? 'Password' : 'Create Password'}
                        </label>
                        {view === 'login' && (
                          <button
                            type="button"
                            onClick={() => { setView('forgot'); setStatusMessage(''); }}
                            className="text-xs font-medium text-[#0052CC] hover:underline cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          required
                          value={password}
                          onChange={(e) => { 
                            setPassword(e.target.value); 
                            if (view === 'signup') setPasswordErrors(validatePassword(e.target.value));
                          }}
                          className={`w-full bg-[#FAFBFC] border rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#051A3E] placeholder-[#737685] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition-all ${
                            passwordErrors.length > 0 && view === 'signup' ? 'border-red-400' : 'border-[#DFE1E6]'
                          }`}
                          placeholder="••••••••"
                          autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                          minLength={view === 'signup' ? PASSWORD_POLICY.minLength : undefined}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737685] hover:text-[#051A3E] p-1"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {showPassword ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.962 8.962 0 013.682-.823c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.004-4.004a3 3 0 11-4.243-4.243m4.243 4.243L3 3l18 18" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            )}
                          </svg>
                        </button>
                      </div>

                      {/* C-02: Password requirements indicator on signup */}
                      {view === 'signup' && password.length > 0 && (
                        <div className="mt-2 space-y-1" role="alert" aria-live="polite">
                          {[
                            { test: password.length >= PASSWORD_POLICY.minLength, label: `${PASSWORD_POLICY.minLength}+ characters` },
                            { test: /[A-Z]/.test(password), label: 'Uppercase letter' },
                            { test: /[a-z]/.test(password), label: 'Lowercase letter' },
                            { test: /\d/.test(password), label: 'Number' },
                            { test: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password), label: 'Special character' },
                          ].map(({ test, label }) => (
                            <div key={label} className={`flex items-center gap-1.5 text-xs ${test ? 'text-green-600' : 'text-[#737685]'}`}>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {test ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                ) : (
                                  <circle cx="12" cy="12" r="5" strokeWidth="2" />
                                )}
                              </svg>
                              <span>{label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-[#051A3E] mb-1.5">
                        Phone Number
                      </label>
                      <div className={`flex bg-[#FAFBFC] border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0052CC] focus-within:border-transparent transition-all ${
                        phoneError ? 'border-red-400' : 'border-[#DFE1E6]'
                      }`}>
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="bg-transparent border-none py-2.5 pl-3 pr-2 text-xs font-semibold text-[#051A3E] border-r border-[#DFE1E6] focus:outline-none cursor-pointer"
                          aria-label="Country code"
                        >
                          {countryCodes.map((item) => (
                            <option key={item.code} value={item.code}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          id="phone"
                          required
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }}
                          className="w-full bg-transparent border-none px-4 py-2.5 text-sm text-[#051A3E] placeholder-[#737685] focus:outline-none"
                          placeholder="(555) 123-4567"
                          autoComplete="tel"
                        />
                      </div>
                      {phoneError && (
                        <p className="mt-1.5 text-xs text-red-600" role="alert" aria-live="polite">{phoneError}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isLoading || loginLimiter.isLocked()}
                    className="w-full bg-[#0052CC] text-white rounded-xl py-3 text-xs font-semibold hover:bg-[#003D9B] active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isLoading 
                      ? (activeTab === 'phone' ? 'Sending code...' : 'Please wait...') 
                      : loginLimiter.isLocked()
                        ? `Locked (${loginLimiter.getRemainingLockout()}s)`
                        : (view === 'login' ? 'Sign In' : 'Create Account')
                    }
                  </button>
                </div>
              </form>

              {/* View Switch */}
              <div className="mt-4 text-center">
                <p className="text-xs text-[#434654]">
                  {view === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => { 
                      setView(view === 'login' ? 'signup' : 'login'); 
                      setStatusMessage(''); 
                      setPasswordErrors([]);
                      clearSensitiveState();
                    }}
                    className="text-[#0052CC] font-semibold hover:underline cursor-pointer ml-1"
                  >
                    {view === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>

              {/* Security Notice */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-[#737685]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-xs font-medium">Secure 256-bit SSL encryption</span>
              </div>
            </div>
          )}

          {/* Invisible reCAPTCHA container for phone auth */}
          <div id="recaptcha-container"></div>

        </div>
      </main>

      {/* Footer — L-01: noopener noreferrer */}
      <footer className="w-full py-6 bg-transparent">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full max-w-7xl mx-auto px-4 sm:px-8 text-xs text-[#535F73]">
          <div>© {new Date().getFullYear()} {companyName}. All rights reserved.</div>
          <div className="flex gap-4 sm:gap-6">
            <a href="#privacy" rel="noopener noreferrer" className="hover:text-[#003D9B] underline transition-colors">Privacy Policy</a>
            <a href="#terms" rel="noopener noreferrer" className="hover:text-[#003D9B] underline transition-colors">Terms of Service</a>
            <a href="#help" rel="noopener noreferrer" className="hover:text-[#003D9B] underline transition-colors">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
