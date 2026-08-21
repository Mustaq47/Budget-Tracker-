import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { useGoalsStore } from "../../../store/useGoalsStore";
import { GlassCard } from "../GlassCard";
import { Coins, Target, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { NotificationEngine } from "../../../services/notificationEngine";
import { useTranslation } from "../../../utils/translations";

export function Onboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setDailyBudget, setHasCompletedOnboarding, theme, colorMode, currency } = useBudgetStore();
  const { addGoal } = useGoalsStore();
  
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState(2000);
  const [goalName, setGoalName] = useState("Emergency Fund");
  const [goalAmount, setGoalAmount] = useState<number | string>(10000);
  
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const isLight = !activeTheme.isDark;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };
  
  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    setDailyBudget(budget);
    addGoal({
      title: goalName,
      targetAmount: Number(goalAmount) || 0,
      category: "Savings",
      glow: "gold"
    });
    setHasCompletedOnboarding(true);
    const currentMonth = new Date().toISOString().substring(0, 7);
    useBudgetStore.getState().setLastBudgetSetMonth(currentMonth);
    
    // Request notification permissions for budget alerts
    await NotificationEngine.requestPermissions();
    
    navigate("/");
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className={`h-[100dvh] overflow-hidden px-6 py-8 flex flex-col ${activeTheme.bgClass}`}>
      <div className="mb-6 mt-2 flex justify-center space-x-2 shrink-0">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-2 w-12 rounded-full transition-all ${step >= i ? 'bg-[#16A34A]' : 'bg-gray-300 dark:bg-gray-700'}`} />
        ))}
      </div>
      
      <div className="flex-1 relative flex flex-col justify-center min-h-0">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full flex flex-col">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Coins className="text-emerald-500 w-8 h-8" />
                </div>
              </div>
              <h2 className={`${textColor} text-3xl font-black text-center mb-4 tracking-tighter`}>Set Your Budget</h2>
              <p className={`${subtextColor} text-center mb-8`}>How much do you want to safely spend per month?</p>
              
              <GlassCard className="p-6">
                <div className="text-center mb-4">
                  <span className={`${textColor} text-5xl font-black tracking-tighter`}>
                    {currencySymbols[currency]}{budget.toLocaleString()}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="50000" 
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </GlassCard>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full flex flex-col">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Target className="text-amber-500 w-8 h-8" />
                </div>
              </div>
              <h2 className={`${textColor} text-3xl font-black text-center mb-4 tracking-tighter`}>First Savings Goal</h2>
              <p className={`${subtextColor} text-center mb-8`}>What are you saving up for?</p>
              
              <GlassCard className="p-6 space-y-6">
                <div>
                  <label className={`${subtextColor} text-sm font-medium mb-2 block`}>Goal Name</label>
                  <input 
                    type="text" 
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className={`w-full p-4 rounded-2xl bg-transparent border ${isLight ? 'border-gray-200' : 'border-gray-700'} ${textColor} outline-none focus:border-amber-500 transition-colors`}
                  />
                </div>
                <div>
                  <label className={`${subtextColor} text-sm font-medium mb-2 block`}>Target Amount ({currencySymbols[currency]})</label>
                  <input 
                    type="number" 
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-full p-4 rounded-2xl bg-transparent border ${isLight ? 'border-gray-200' : 'border-gray-700'} ${textColor} outline-none focus:border-amber-500 transition-colors`}
                  />
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full flex flex-col">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <CheckCircle2 className="text-blue-500 w-10 h-10" />
                </div>
              </div>
              <h2 className={`${textColor} text-3xl font-black text-center mb-4 tracking-tighter`}>You're All Set!</h2>
              <p className={`${subtextColor} text-center mb-8`}>coZify is ready to help you track, manage, and grow your wealth.</p>
              
              <GlassCard className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800">
                    <span className={subtextColor}>Monthly Budget</span>
                    <span className={`${textColor} font-bold`}>{currencySymbols[currency]}{budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={subtextColor}>Primary Goal</span>
                    <span className={`${textColor} font-bold`}>{goalName}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-4 pb-4 flex justify-between relative z-10 shrink-0">
        {step > 1 ? (
          <button onClick={handlePrev} className={`p-4 rounded-full ${isLight ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-white'}`}>
            <ChevronLeft size={24} />
          </button>
        ) : <div />}
        
        {step < 3 ? (
          <button onClick={handleNext} className="px-8 py-4 bg-[#16A34A] text-white rounded-full font-bold shadow-lg shadow-green-500/30 flex items-center gap-2 transition-transform active:scale-95">
            Continue <ChevronRight size={20} />
          </button>
        ) : (
          <button onClick={handleComplete} className="px-8 py-4 bg-blue-500 text-white rounded-full font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-transform active:scale-95">
            Start Tracking <CheckCircle2 size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
