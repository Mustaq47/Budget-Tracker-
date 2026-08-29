import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useBudgetStore, currencySymbols, CurrencyCode } from "../../../store/useBudgetStore";
import { useGoalsStore } from "../../../store/useGoalsStore";
import {
  User,
  Phone,
  Calendar,
  Users,
  Target,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { useEffect } from "react";
import { signInWithGoogle, handleGoogleRedirectResult } from "../../../services/firebase";
import { NotificationEngine } from "../../../services/notificationEngine";
import { useTranslation } from "../../../utils/translations";
import { SafeAvatar } from "../SafeAvatar";
import { logger } from "../../../utils/logger";

/* ── color tokens (reference-matched) ── */
const C = {
  bg: "#F7FBFF",
  bgSubtle: "#EEF7FF",
  primary: "#1DA1F2",
  bright: "#38BDF8",
  dark: "#14213D",
  secondary: "#6F8098",
  border: "#D9EAF8",
  inputBg: "#FFFFFF",
  progressOff: "#DCE6EF",
  progressOn: "#28A9F3",
  btn: "#159FEF",
  btnHover: "#0D8FE0",
  placeholder: "#9AAEC3",
  white: "#FFFFFF",
} as const;

const spring = { type: "spring" as const, damping: 28, stiffness: 220 };

/* ── decorative background ── */
function OnboardingBg() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      style={{
        backgroundImage: 'url(/onboarding-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      aria-hidden="true"
    />
  );
}

/* ── icon container ── */
function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="shrink-0 w-[40px] h-[40px] rounded-[12px] flex items-center justify-center"
      style={{ backgroundColor: C.bgSubtle }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════ */
export function Onboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    user,
    updateUserProfile,
    setDailyBudget,
    setCurrency,
    setHasCompletedOnboarding,
    setHasCompletedProfileSetup,
    currency,
  } = useBudgetStore();
  const { addGoal } = useGoalsStore();

  const [step, setStep] = useState(1);

  /* Stage 1 */
  const [name, setName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [age, setAge] = useState(user?.age ? user.age.toString() : "");
  const [gender, setGender] = useState(user?.gender || "");
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    handleGoogleRedirectResult().then((res) => {
      if (res?.user) {
        useBudgetStore.getState().setUser({
          uid: res.user.uid,
          email: res.user.email,
          photoURL: res.user.photoURL || user?.photoURL,
          displayName: res.user.displayName || user?.displayName,
          phoneNumber: res.user.phoneNumber || user?.phoneNumber,
        });
        setHasCompletedProfileSetup(true);
        setHasCompletedOnboarding(true);
        useBudgetStore.getState().setLastBudgetSetMonth(new Date().toISOString().substring(0, 7));
        navigate("/");
      }
    }).catch(err => logger.warn("Redirect result error:", err));
  }, [navigate, user]);

  /* Stage 2 */
  const [budget, setBudget] = useState(60000);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currency || "INR");
  const [enableGoal, setEnableGoal] = useState(false);
  const [goalName, setGoalName] = useState("Emergency Fund");
  const [goalAmount, setGoalAmount] = useState<number | string>(10000);

  const activeUser = useBudgetStore((s) => s.user);

  /* ── handlers (unchanged logic) ── */
  const handleStage1Submit = () => {
    if (!name.trim()) {
      setProfileError("Full Name is required");
      return;
    }
    const phoneClean = phone.replace(/[^0-9]/g, "");
    if (!phoneClean || phoneClean.length !== 10) {
      setProfileError("Mobile Number must be exactly 10 digits");
      return;
    }
    setProfileError("");
    updateUserProfile({
      displayName: name.trim(),
      phoneNumber: phoneClean,
      age: age ? parseInt(age, 10) : null,
      gender: gender || null,
    });
    setStep(2);
  };

  const handleStage2Submit = () => {
    setCurrency(selectedCurrency);
    setDailyBudget(budget);
    if (enableGoal && goalName.trim() && Number(goalAmount) > 0) {
      addGoal({ title: goalName.trim(), targetAmount: Number(goalAmount), category: "Savings", glow: "gold" });
    }
    setStep(3);
  };

  const handleCompleteGuest = async () => {
    // Setting a guest profile gives them a UID so `isAuthenticated` becomes true.
    useBudgetStore.getState().setUser({
      uid: "trial_" + Date.now().toString(36),
      displayName: name.trim() || "Trial",
      age: age ? parseInt(age) : null,
      gender: gender || null,
      trialStartedAt: Date.now(),
    });
    setHasCompletedProfileSetup(true);
    setHasCompletedOnboarding(true);
    useBudgetStore.getState().setLastBudgetSetMonth(new Date().toISOString().substring(0, 7));
    try { await NotificationEngine.requestPermissions(); } catch (_) { }
    navigate("/");
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await signInWithGoogle(false, true); // Allow any user, no restriction
      if (res?.user) {
        useBudgetStore.getState().setUser({
          uid: res.user.uid,
          email: res.user.email,
          photoURL: res.user.photoURL || user?.photoURL,
          displayName: name.trim() || res.user.displayName || user?.displayName,
          phoneNumber: phone.trim() || res.user.phoneNumber || user?.phoneNumber,
          age: age ? parseInt(age) : user?.age,
          gender: gender || user?.gender,
        });
        
        // Mark onboarding complete and go to root
        setHasCompletedProfileSetup(true);
        setHasCompletedOnboarding(true);
        useBudgetStore.getState().setLastBudgetSetMonth(new Date().toISOString().substring(0, 7));
        try { await NotificationEngine.requestPermissions(); } catch (_) { }
        
        // Let the unified auth lifecycle handle the redirect to /, 
        // but explicitly navigate there so we get out of onboarding.
        navigate("/");
      }
    } catch (err) {
      logger.warn("Google sign-in skipped:", err);
    }
  };

  /* ── step titles ── */
  const titles: Record<number, string> = {
    1: "Your Profile",
    2: "Budget Plan",
    3: "Review Setup",
    4: "Sign In",
  };

  /* ── shared input style ── */
  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 52,
    padding: "0 16px 0 52px",
    borderRadius: 16,
    border: `1.5px solid ${C.border}`,
    backgroundColor: C.inputBg,
    color: C.dark,
    fontSize: 15,
    fontWeight: 500,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  };
  const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = C.primary;
    e.target.style.boxShadow = `0 0 0 3px ${C.primary}14`;
  };
  const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = C.border;
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden flex flex-col"
      style={{
        backgroundColor: '#F7FBFF',
        fontFamily: "'Poppins', 'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <OnboardingBg />

      {/* ════════ HEADER ════════ */}
      <div className="relative z-10 w-full max-w-[480px] mx-auto px-6 pt-6 pb-1">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-4"
        >
          <img src="/cozify-logo-light.png" alt="coZify logo" className="h-8 object-contain" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: C.primary,
            marginBottom: 6,
          }}
        >
          Step {step} of 4
        </motion.p>

        <motion.h1
          key={`title-${step}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: C.dark,
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
            margin: 0,
          }}
        >
          {titles[step]}
        </motion.h1>

        {/* ── progress segments ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex gap-2.5 mt-4"
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-colors duration-300"
              style={{
                height: 6,
                backgroundColor: step >= i ? C.progressOn : C.progressOff,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* ════════ CONTENT ════════ */}
      <div className="relative z-10 w-full max-w-[480px] mx-auto flex-1 flex flex-col justify-center px-6 py-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          .overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <AnimatePresence mode="wait">

          {/* ═══ STEP 1 — Profile ═══ */}
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              <div
                style={{
                  backgroundColor: C.white,
                  borderRadius: 30,
                  padding: "24px 24px 24px",
                  boxShadow: "0 20px 50px rgba(60, 140, 200, 0.08)",
                }}
              >
                {/* Full Name */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" as const, color: C.dark, display: "block", marginBottom: 8 }}>
                    Full Name <span style={{ color: C.primary }}>*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-[8px] top-1/2 -translate-y-1/2 z-[1]">
                      <FieldIcon><User size={20} color={C.primary} strokeWidth={1.8} /></FieldIcon>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      style={{ ...inputStyle }}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" as const, color: C.dark, display: "block", marginBottom: 8 }}>
                    Mobile Number <span style={{ color: C.primary }}>*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-[8px] top-1/2 -translate-y-1/2 z-[1]">
                      <FieldIcon><Phone size={20} color={C.primary} strokeWidth={1.8} /></FieldIcon>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="+91 98765 43210"
                      maxLength={10}
                      style={{ ...inputStyle }}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                    />
                  </div>
                </div>

                {/* Age + Gender row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Age */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" as const, color: C.dark, display: "block", marginBottom: 8 }}>
                      Age
                    </label>
                    <div className="relative">
                      <div className="absolute left-[8px] top-1/2 -translate-y-1/2 z-[1]">
                        <FieldIcon><Calendar size={20} color={C.primary} strokeWidth={1.8} /></FieldIcon>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={age}
                        onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="25"
                        maxLength={3}
                        style={{ ...inputStyle }}
                        onFocus={inputFocusHandler}
                        onBlur={inputBlurHandler}
                      />
                    </div>
                  </div>

                  {/* Gender dropdown */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" as const, color: C.dark, display: "block", marginBottom: 8 }}>
                      Gender
                    </label>
                    <div className="relative">
                      <div className="absolute left-[8px] top-1/2 -translate-y-1/2 z-[1] pointer-events-none">
                        <FieldIcon><Users size={20} color={C.primary} strokeWidth={1.8} /></FieldIcon>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                        className="cursor-pointer text-left"
                        style={{
                          ...inputStyle,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingRight: 16,
                          color: gender ? C.dark : C.placeholder,
                          background: C.inputBg,
                        }}
                      >
                        <span>{gender || "Select"}</span>
                        <ChevronDown
                          size={18}
                          color={C.secondary}
                          style={{
                            transition: "transform 0.2s",
                            transform: showGenderDropdown ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        />
                      </button>

                      <AnimatePresence>
                        {showGenderDropdown && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowGenderDropdown(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: -6, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.96 }}
                              transition={{ duration: 0.15 }}
                              className="absolute z-20 left-0 right-0 mt-2 overflow-hidden"
                              style={{
                                backgroundColor: C.white,
                                border: `1.5px solid ${C.border}`,
                                borderRadius: 16,
                                boxShadow: "0 12px 32px rgba(60, 140, 200, 0.12)",
                              }}
                            >
                              {["Male", "Female", "Other"].map((g) => (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => { setGender(g); setShowGenderDropdown(false); }}
                                  className="cursor-pointer"
                                  style={{
                                    width: "100%",
                                    padding: "13px 16px",
                                    textAlign: "left",
                                    fontSize: 14,
                                    fontWeight: gender === g ? 600 : 500,
                                    color: gender === g ? C.primary : C.dark,
                                    backgroundColor: gender === g ? `${C.bgSubtle}` : "transparent",
                                    border: "none",
                                    borderBottom: `1px solid ${C.border}30`,
                                    transition: "background-color 0.15s",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    fontFamily: "inherit",
                                  }}
                                  onMouseEnter={(e) => { if (gender !== g) (e.target as HTMLElement).style.backgroundColor = "#F7FBFF"; }}
                                  onMouseLeave={(e) => { if (gender !== g) (e.target as HTMLElement).style.backgroundColor = "transparent"; }}
                                >
                                  {g}
                                  {gender === g && <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.primary }} />}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {profileError && (
                  <p style={{ color: "#E53E3E", fontSize: 12, fontWeight: 600, textAlign: "center", marginTop: 16 }}>
                    {profileError}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 2 — Budget ═══ */}
          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              <div style={{ backgroundColor: C.white, borderRadius: 30, padding: "20px 20px 24px", boxShadow: "0 20px 50px rgba(60, 140, 200, 0.08)" }}>

                {/* Currency */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" as const, color: C.dark, display: "block", marginBottom: 8 }}>Currency</label>
                  <div className="flex gap-2">
                    {(["INR", "USD", "EUR", "GBP", "JPY"] as CurrencyCode[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedCurrency(c)}
                        className="flex-1 cursor-pointer"
                        style={{
                          padding: "10px 0",
                          borderRadius: 12,
                          fontSize: 13,
                          fontWeight: 700,
                          border: "none",
                          transition: "all 0.2s",
                          fontFamily: "inherit",
                          backgroundColor: selectedCurrency === c ? C.btn : "#F0F5FA",
                          color: selectedCurrency === c ? C.white : C.secondary,
                          boxShadow: selectedCurrency === c ? `0 4px 16px ${C.btn}40` : "none",
                        }}
                      >
                        {currencySymbols[c]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget slider */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: C.secondary, marginBottom: 4 }}>Monthly Budget</p>
                  
                  <div className="flex justify-center items-center">
                    <span style={{ fontSize: 36, fontWeight: 700, color: C.dark, letterSpacing: "-1px" }}>{currencySymbols[selectedCurrency]}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={budget ? budget.toLocaleString() : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        setBudget(Number(raw));
                      }}
                      onBlur={(e) => {
                        e.target.style.borderBottom = `2px dashed ${C.placeholder}40`;
                        if (!budget || budget < 500) setBudget(500);
                        if (budget > 10000000) setBudget(10000000);
                      }}
                      onFocus={(e) => {
                        e.target.style.borderBottom = `2px solid ${C.primary}`;
                      }}
                      style={{
                        fontSize: 36,
                        fontWeight: 700,
                        color: C.dark,
                        letterSpacing: "-1px",
                        margin: 0,
                        padding: "0 4px",
                        background: "transparent",
                        border: "none",
                        borderBottom: `2px dashed ${C.placeholder}40`,
                        outline: "none",
                        width: budget ? `${Math.max(2, budget.toLocaleString().length + 0.5)}ch` : "3ch",
                        textAlign: "center",
                        transition: "border-color 0.2s"
                      }}
                    />
                  </div>

                  <input
                    type="range" min="5000" max="500000" step="5000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full mt-4 cursor-pointer"
                    style={{
                      height: 6,
                      borderRadius: 3,
                      appearance: "none",
                      WebkitAppearance: "none",
                      background: `linear-gradient(to right, ${C.progressOn} ${Math.min(100, Math.max(0, ((budget - 5000) / 495000) * 100))}%, ${C.progressOff} 0%)`,
                      accentColor: C.btn,
                    }}
                  />
                  <div className="flex justify-between" style={{ fontSize: 10, color: C.secondary, fontWeight: 600, marginTop: 4 }}>
                    <span>{currencySymbols[selectedCurrency]}5K</span>
                    <span>{currencySymbols[selectedCurrency]}5L</span>
                  </div>
                </div>

                {/* Optional Goal toggle */}
                <div style={{ borderTop: `1px solid ${C.border}40`, paddingTop: 16 }}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setEnableGoal(!enableGoal)}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.dark, display: "flex", alignItems: "center", gap: 6 }}>
                      <Target size={15} color="#F59E0B" />
                      Savings Goal
                      <span style={{ fontWeight: 400, color: C.secondary }}>(optional)</span>
                    </span>
                    <div style={{
                      width: 40, height: 22, borderRadius: 11, padding: 2,
                      backgroundColor: enableGoal ? C.btn : C.progressOff,
                      display: "flex", alignItems: "center",
                      transition: "background-color 0.2s",
                    }}>
                      <motion.div
                        layout
                        style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: C.white, boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}
                        animate={{ x: enableGoal ? 18 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {enableGoal && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden" style={{ marginTop: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <input type="text" value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="Goal name"
                            style={{ ...inputStyle, paddingLeft: 16, height: 48 }} onFocus={inputFocusHandler} onBlur={inputBlurHandler} />
                          <input type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} placeholder="Target amount"
                            style={{ ...inputStyle, paddingLeft: 16, height: 48 }} onFocus={inputFocusHandler} onBlur={inputBlurHandler} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 3 — Review ═══ */}
          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              <div style={{ backgroundColor: C.white, borderRadius: 30, padding: "20px 20px 24px", boxShadow: "0 20px 50px rgba(60, 140, 200, 0.08)" }}>
                {/* User identity */}
                <div className="flex items-center gap-4" style={{ paddingBottom: 16, borderBottom: `1px solid ${C.border}40`, marginBottom: 16 }}>
                  <SafeAvatar src={activeUser?.photoURL} name={activeUser?.displayName || name} size="xl" className="shadow-md" style={{ border: `2px solid ${C.border}` }} />
                  <div className="min-w-0">
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: C.dark, margin: 0 }} className="truncate">{activeUser?.displayName || name}</h3>
                    {(activeUser?.phoneNumber || phone) && (
                      <p style={{ fontSize: 12, color: C.secondary, margin: "2px 0 0" }} className="truncate">{activeUser?.phoneNumber || phone}</p>
                    )}
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {(activeUser?.age || age) && (
                        <span style={{ padding: "2px 8px", borderRadius: 20, backgroundColor: C.bgSubtle, color: C.primary, fontSize: 10, fontWeight: 600, border: `1px solid ${C.border}` }}>
                          {activeUser?.age || age} yrs
                        </span>
                      )}
                      {(activeUser?.gender || gender) && (
                        <span style={{ padding: "2px 8px", borderRadius: 20, backgroundColor: C.bgSubtle, color: C.primary, fontSize: 10, fontWeight: 600, border: `1px solid ${C.border}` }}>
                          {activeUser?.gender || gender}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Budget details */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Row label="Monthly Budget" value={`${currencySymbols[selectedCurrency]}${budget.toLocaleString()}`} accent />
                  <Row label="Daily Safe Spend" value={`${currencySymbols[selectedCurrency]}${Math.round(budget / 30).toLocaleString()}/day`} />
                  <Row label="Currency" value={selectedCurrency} />
                  {enableGoal && goalName && (
                    <Row label="Savings Goal" value={`${goalName} · ${currencySymbols[selectedCurrency]}${Number(goalAmount).toLocaleString()}`} />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 4 — Sign In ═══ */}
          {step === 4 && (
            <motion.div
              key="s4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              <div style={{ backgroundColor: C.white, borderRadius: 30, padding: "20px 20px 24px", boxShadow: "0 20px 50px rgba(60, 140, 200, 0.08)" }}>
                <p style={{ textAlign: "center", color: C.secondary, fontSize: 13, fontWeight: 500, lineHeight: 1.6, marginBottom: 16 }}>
                  Sign in to sync your budget data across devices, or continue offline as a trial user.
                </p>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="cursor-pointer"
                  style={{
                    width: "100%",
                    padding: "14px 0",
                    borderRadius: 16,
                    backgroundColor: C.white,
                    border: `1.5px solid ${C.border}`,
                    color: C.dark,
                    fontWeight: 600,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center" style={{ padding: "16px 0" }}>
                  <div style={{ flex: 1, height: 1, backgroundColor: C.border }} />
                  <span style={{ padding: "0 16px", fontSize: 10, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: C.placeholder }}>or</span>
                  <div style={{ flex: 1, height: 1, backgroundColor: C.border }} />
                </div>

                <button
                  type="button"
                  onClick={handleCompleteGuest}
                  className="cursor-pointer"
                  style={{
                    width: "100%",
                    padding: "13px 0",
                    borderRadius: 16,
                    backgroundColor: "#F5F9FD",
                    border: `1.5px solid ${C.border}`,
                    color: C.secondary,
                    fontWeight: 600,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                >
                  Continue as Trial <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ════════ BOTTOM NAV ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="relative z-10 w-full max-w-[480px] mx-auto px-6 pb-6 pt-0 flex items-center justify-between shrink-0"
      >
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="cursor-pointer"
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: C.white,
              border: `1.5px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.secondary,
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <ChevronLeft size={20} />
          </button>
        ) : <div />}

        {step < 4 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={step === 1 ? handleStage1Submit : step === 2 ? handleStage2Submit : () => setStep(4)}
            className="cursor-pointer"
            style={{
              padding: "0 32px",
              height: 48,
              borderRadius: 16,
              backgroundColor: C.btn,
              border: "none",
              color: C.white,
              fontWeight: 600,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: `0 8px 24px ${C.btn}40`,
              transition: "background-color 0.2s, box-shadow 0.2s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = C.btnHover; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = C.btn; }}
          >
            {step === 3 ? "Looks Good" : "Continue"}
            <ChevronRight size={18} strokeWidth={2.5} />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

/* ── review row helper ── */
function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between" style={{ fontSize: 13 }}>
      <span style={{ color: C.secondary, fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 600, color: accent ? C.primary : C.dark, fontSize: accent ? 15 : 13 }}>{value}</span>
    </div>
  );
}
