import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { useTripsStore } from "../../../store/useTripsStore";
import { useGoalsStore } from "../../../store/useGoalsStore";
import { X, Check, Zap, Plane, Wallet } from "lucide-react";
import { useState } from "react";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import confetti from "canvas-confetti";
import { BottomSheet } from "../BottomSheet";


interface QuickEntrySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_AMOUNTS = [100, 500, 1000, 2000];
const GENERAL_CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Bills"];
const TRIP_CATEGORIES = ["Flight", "Hotel", "Dining", "Excursion", "Transport"];
const GOAL_CATEGORIES = ["Deposit", "Salary Bonus", "Transfer", "Gift"];

type EntryMode = "general" | "trip" | "goal";

export function QuickEntrySheet({ isOpen, onClose }: QuickEntrySheetProps) {
  const { addTransaction, theme, colorMode, currency } = useBudgetStore();
  const { trips, updateTripSpent } = useTripsStore();
  const { goals, contributeToGoal } = useGoalsStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const primaryColor = activeTheme.primaryColor;
  const isLight = !activeTheme.isDark;

  const [entryMode, setEntryMode] = useState<EntryMode>("general");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState<string>("Food");
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const dragControls = useDragControls();

  // Sync default categories when switching modes
  const handleModeSwitch = (mode: EntryMode) => {
    setEntryMode(mode);
    setAmount("");
    if (mode === "general") setCategory(GENERAL_CATEGORIES[0]);
    if (mode === "trip") setCategory(TRIP_CATEGORIES[0]);
    if (mode === "goal") setCategory(GOAL_CATEGORIES[0]);
  };

  const handleQuickAdd = () => {
    if (!amount || Number(amount) <= 0) return;
    
    if (entryMode === "goal" && selectedGoalId) {
      const amountVal = Number(amount);
      const goal = goals.find(g => g.id === selectedGoalId);
      contributeToGoal(selectedGoalId, amountVal);
      if (goal && (goal.currentAmount + amountVal) >= goal.targetAmount && goal.currentAmount < goal.targetAmount) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else if (entryMode === "trip" && selectedTripId) {
      updateTripSpent(selectedTripId, Number(amount));
    } else if (entryMode === "general") {
      addTransaction({
        title: category,
        amount: Number(amount),
        category: category,
        type: "expense",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
    
    setAmount("");
    setSelectedTripId(null);
    setSelectedGoalId(null);
    onClose();
  };

  const getActiveCategories = () => {
    if (entryMode === "trip") return TRIP_CATEGORIES;
    if (entryMode === "goal") return GOAL_CATEGORIES;
    return GENERAL_CATEGORIES;
  };

  const isSubmitDisabled = 
    !amount || 
    Number(amount) <= 0 || 
    (entryMode === "trip" && !selectedTripId) || 
    (entryMode === "goal" && !selectedGoalId);

  // UI Colors derived from theme
  const segmentBg = isLight ? "bg-slate-100" : "bg-black/30";
  const activeSegmentBg = isLight ? "bg-white shadow-sm" : "bg-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.3)]";
  const borderColor = isLight ? "border-slate-200" : "border-white/10";
  
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} isLight={isLight} className="!p-0 !pt-0">
      <div className="pt-1 pb-4 px-6 flex justify-between items-center shrink-0">
        <h3 className={`${textColor} text-2xl font-black tracking-tight`}>Add Entry</h3>
        <button 
          onClick={onClose} 
          className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors z-10 ${isLight ? "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700" : "bg-white/10 border-white/15 hover:bg-white/20 text-white/80"}`}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 pb-2">
        {/* iOS Style Segmented Control */}
            <div className={`flex p-1 rounded-2xl mb-8 ${segmentBg}`}>
              <button
                onClick={() => handleModeSwitch("general")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  entryMode === "general" ? `${activeSegmentBg} ${textColor}` : `${subtextColor} hover:${textColor}`
                }`}
              >
                <Wallet size={16} /> General
              </button>
              {(trips && trips.length > 0) && (
                <button
                  onClick={() => handleModeSwitch("trip")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    entryMode === "trip" ? `${activeSegmentBg} text-amber-500` : `${subtextColor} hover:${textColor}`
                  }`}
                >
                  <Plane size={16} /> Trip
                </button>
              )}
              {(goals && goals.length > 0) && (
                <button
                  onClick={() => handleModeSwitch("goal")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    entryMode === "goal" ? `${activeSegmentBg} text-blue-500` : `${subtextColor} hover:${textColor}`
                  }`}
                >
                  <Zap size={16} /> Goal
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={entryMode}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="mb-6 space-y-8"
              >
                {/* Amount Input */}
                <div className="flex justify-center items-center">
                  <span className={`${entryMode === "general" ? "text-emerald-500" : entryMode === "trip" ? "text-amber-500" : "text-blue-500"} text-5xl font-black tracking-tighter`}>{currencySymbols[currency]}</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || "")}
                    autoFocus
                    className={`w-40 text-6xl font-black bg-transparent border-none outline-none text-center ${textColor} placeholder:${subtextColor} opacity-100 placeholder-opacity-30`}
                  />
                </div>

                {/* Quick Amounts */}
                <div className="flex gap-2 justify-center flex-wrap">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`px-5 py-2.5 rounded-full font-bold text-sm transition-transform active:scale-95 border ${
                        amount === amt 
                          ? entryMode === "general" ? `bg-emerald-500 text-white border-transparent shadow-lg shadow-emerald-500/30` :
                            entryMode === "trip" ? "bg-amber-500 text-white border-transparent shadow-lg shadow-amber-500/30" :
                            "bg-blue-500 text-white border-transparent shadow-lg shadow-blue-500/30"
                          : isLight ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>

                {/* Dynamic Selection List (Trip/Goal) */}
                {entryMode === "trip" && trips && (
                  <div className="space-y-3">
                    <div className={`text-[11px] font-bold uppercase tracking-wider px-1 ${subtextColor}`}>
                      Select Destination
                    </div>
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-1">
                      {trips.map(trip => (
                        <button
                          key={trip.id}
                          type="button"
                          onClick={() => setSelectedTripId(trip.id)}
                          className={`shrink-0 w-36 p-4 rounded-3xl text-left border relative transition-all ${
                            selectedTripId === trip.id
                              ? "ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-[#121212] border-transparent"
                              : isLight ? "border-slate-200 opacity-70 hover:opacity-100" : "border-white/10 opacity-70 hover:opacity-100"
                          }`}
                          style={selectedTripId === trip.id ? { background: trip.gradient } : { background: isLight ? "#f8fafc" : "rgba(255,255,255,0.03)" }}
                        >
                          {selectedTripId === trip.id && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                          <div className={`font-black text-sm truncate ${selectedTripId === trip.id ? "text-white" : textColor}`}>
                            {trip.title}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {entryMode === "goal" && goals && (
                  <div className="space-y-3">
                    <div className={`text-[11px] font-bold uppercase tracking-wider px-1 ${subtextColor}`}>
                      Target Goal
                    </div>
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-1">
                      {goals.map(goal => (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => setSelectedGoalId(goal.id)}
                          className={`shrink-0 w-36 p-4 rounded-3xl text-left border relative transition-all ${
                            selectedGoalId === goal.id
                              ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-[#121212] border-transparent"
                              : isLight ? "border-slate-200 opacity-70 hover:opacity-100" : "border-white/10 opacity-70 hover:opacity-100"
                          } ${
                            selectedGoalId === goal.id 
                              ? goal.glow === "gold" ? "bg-amber-500 text-white" :
                                goal.glow === "blue" ? "bg-blue-500 text-white" :
                                goal.glow === "purple" ? "bg-purple-500 text-white" :
                                "bg-pink-500 text-white"
                              : "bg-transparent"
                          }`}
                          style={selectedGoalId !== goal.id ? { background: isLight ? "#f8fafc" : "rgba(255,255,255,0.03)" } : {}}
                        >
                          {selectedGoalId === goal.id && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                          <div className={`flex items-center gap-1.5 font-black text-sm truncate ${selectedGoalId === goal.id ? "text-white" : textColor}`}>
                            <Zap size={14} className={selectedGoalId === goal.id ? "text-white" : "opacity-60"} />
                            {goal.title}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Categories */}
                <div className="space-y-3">
                  <div className={`text-[11px] font-bold uppercase tracking-wider px-1 ${subtextColor}`}>
                    {entryMode === "general" ? "Expense Category" : entryMode === "trip" ? "Trip Category" : "Contribution Type"}
                  </div>
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 px-1">
                    {getActiveCategories().map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-transform active:scale-95 border ${
                          category === cat 
                            ? entryMode === "general" ? `border-emerald-500 text-emerald-500 bg-emerald-500/10` :
                              entryMode === "trip" ? "border-amber-500 text-amber-500 bg-amber-500/10" :
                              "border-blue-500 text-blue-500 bg-blue-500/10"
                            : isLight ? "border-slate-200 text-slate-600 bg-white" : "border-white/10 text-white/70 bg-white/5"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={handleQuickAdd}
              disabled={isSubmitDisabled}
              className={`w-full py-5 rounded-[24px] font-black flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-xl ${
                isSubmitDisabled 
                  ? `opacity-50 cursor-not-allowed ${isLight ? "bg-slate-200 text-slate-500" : "bg-white/10 text-white/40"} shadow-none` 
                  : entryMode === "trip" ? "bg-amber-500 text-white shadow-amber-500/30"
                  : entryMode === "goal" ? "bg-blue-500 text-white shadow-blue-500/30"
                  : "bg-emerald-500 text-white shadow-emerald-500/30"
              }`}
            >
              {entryMode === "goal" ? "Confirm Contribution" : entryMode === "trip" ? "Log Trip Expense" : "Add Expense"}
            </button>
      </div>
    </BottomSheet>
  );
}
