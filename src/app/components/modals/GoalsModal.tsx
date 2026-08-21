import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "motion/react";
import { X, Zap, Plus, Coins, Target, Trash2, Edit3, Trophy } from "lucide-react";
import { useBudgetStore, SavingsGoal, currencySymbols } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { GlassIcon } from "../GlassIcon";
import confetti from "canvas-confetti";

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const glowThemes: Array<"gold" | "blue" | "purple" | "pink"> = ["gold", "blue", "purple", "pink"];
const goalCategories = ["Vacation", "Emergency Fund", "Electronics", "Vehicle", "Home", "Investment", "Other"];

function GoalCard({
  goal,
  isLight,
  textColor,
  subtextColor,
  currency,
  onContribute,
  onEdit,
  onDelete
}: {
  goal: SavingsGoal;
  isLight: boolean;
  textColor: string;
  subtextColor: string;
  currency: string;
  onContribute: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const controls = useAnimation();
  
  const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const isCompleted = pct >= 100;

  const handlePointerDown = () => {
    pressTimer.current = setTimeout(() => {
      setShowMenu(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(50); // Haptic feedback on long press
      }
    }, 500); // 500ms long press
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const offset = info.offset.x;
    if (offset < -80 || offset > 80) {
      // Swiped far enough
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }
      onDelete();
    } else {
      // Snap back
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  // Thematically sync the progress bar to the selected glow or active theme
  const barGradient = isCompleted 
    ? "bg-gradient-to-r from-emerald-400 to-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.6)]"
    : goal.glow === "blue" ? "bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] shadow-[0_0_12px_rgba(0,229,255,0.5)]"
    : goal.glow === "purple" ? "bg-gradient-to-r from-[#7B61FF] to-[#A855F7] shadow-[0_0_12px_rgba(123,97,255,0.5)]"
    : goal.glow === "pink" ? "bg-gradient-to-r from-[#FF4D8D] to-[#F43F5E] shadow-[0_0_12px_rgba(255,77,141,0.5)]"
    : "bg-gradient-to-r from-[#FFD166] via-[#FF4D8D] to-[#7B61FF] shadow-[0_0_12px_rgba(255,209,102,0.5)]";

  return (
    <div className="relative w-full rounded-[24px] mb-4">
      {/* Background Delete Indicator (Revealed on Swipe) */}
      <div className={`absolute inset-0 flex items-center justify-between px-6 z-0 rounded-[24px] bg-rose-500 transition-opacity duration-300 ${isDragging ? "opacity-100" : "opacity-0"}`}>
        <Trash2 className="text-white w-6 h-6 opacity-80" />
        <Trash2 className="text-white w-6 h-6 opacity-80" />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={controls}
        onPointerDown={handlePointerDown}
        onPointerUp={cancelPress}
        onPointerMove={cancelPress}
        onPointerCancel={cancelPress}
        onContextMenu={(e) => {
          e.preventDefault(); // Prevent default browser context menu
          setShowMenu(true);
        }}
        className={`relative w-full p-5 rounded-[24px] border backdrop-blur-xl transition-all cursor-grab active:cursor-grabbing overflow-hidden z-10 ${
          isLight ? "bg-white border-slate-200" : "bg-white/5 hover:bg-white/10 border-white/10"
        }`}
      >
        <div className="flex justify-between items-start mb-4 pointer-events-none">
          <div>
            <div className={`${textColor} font-extrabold text-base tracking-tight flex items-center gap-2`}>
              {goal.title}
              {isCompleted && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  🎉 Achieved
                </span>
              )}
            </div>
            <div className={`${subtextColor} text-xs tracking-tight capitalize mt-0.5`}>{goal.category}</div>
          </div>
          
          <div className="text-right pointer-events-none">
            <div className={`${textColor} font-black text-sm tracking-tight`}>{pct}%</div>
            <div className={`${subtextColor} text-[10px] tracking-tight mt-0.5`}>
              {currencySymbols[currency as keyof typeof currencySymbols]}{goal.currentAmount.toLocaleString()} / {currencySymbols[currency as keyof typeof currencySymbols]}{goal.targetAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Apple Style Sleek Progress Bar */}
        <div className={`w-full h-2 rounded-full overflow-hidden pointer-events-none ${isLight ? "bg-slate-200" : "bg-black/40"}`}>
          <motion.div
            className={`h-full rounded-full ${barGradient}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {/* Hold-to-open Context Menu Overlay */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-[24px]"
              onPointerDown={(e) => e.stopPropagation()} // Stop drag when interacting with menu
            >
              <motion.div 
                initial={{ scale: 0.95, y: 5 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`flex items-center gap-1 p-1.5 rounded-full backdrop-blur-3xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border ${isLight ? "bg-white/80 border-white/50" : "bg-black/60 border-white/10"}`}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onContribute(); }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer ${isLight ? "text-slate-700 hover:bg-black/5" : "text-white/90 hover:bg-white/10"}`}
                >
                  <Coins size={20} strokeWidth={1.5} />
                </button>
                
                <div className={`w-[1px] h-6 ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
                
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(); }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer ${isLight ? "text-slate-700 hover:bg-black/5" : "text-white/90 hover:bg-white/10"}`}
                >
                  <Edit3 size={19} strokeWidth={1.5} />
                </button>
                
                <div className={`w-[1px] h-6 ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
                
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(); }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer ${isLight ? "text-rose-500 hover:bg-rose-500/10" : "text-rose-400 hover:bg-rose-500/20"}`}
                >
                  <Trash2 size={19} strokeWidth={1.5} />
                </button>
              </motion.div>

              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
                className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${isLight ? "bg-white/80 text-slate-500 hover:text-slate-900" : "bg-white/10 text-white/50 hover:text-white"}`}
              >
                <X size={14} strokeWidth={2} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export function GoalsModal({ isOpen, onClose }: GoalsModalProps) {
  const { goals, addGoal, contributeToGoal, deleteGoal, editGoal, currency, theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const accentColor = activeTheme.primary;

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<string | null>(null);
  
  // Edit State
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState<SavingsGoal | null>(null);

  // Form States (Used for both Add and Edit)
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialAmount, setInitialAmount] = useState(""); // Only used for Add
  const [category, setCategory] = useState("Savings");
  const [selectedGlow, setSelectedGlow] = useState<"gold" | "blue" | "purple" | "pink">("gold");

  const [contributionAmount, setContributionAmount] = useState("");

  const resetForm = () => {
    setTitle("");
    setTargetAmount("");
    setInitialAmount("");
    setCategory("Savings");
    setSelectedGlow("gold");
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (!title.trim() || isNaN(target) || target <= 0) return;

    addGoal({
      title: title.trim(),
      targetAmount: target,
      category,
      glow: selectedGlow,
    });

    const initial = parseFloat(initialAmount);
    if (!isNaN(initial) && initial > 0) {
      const newlyAdded = goals[goals.length - 1];
      if (newlyAdded) {
        contributeToGoal(newlyAdded.id, initial);
      }
    }

    resetForm();
    setShowAddGoal(false);
  };

  const handleEditGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForEdit) return;
    
    const target = parseFloat(targetAmount);
    if (!title.trim() || isNaN(target) || target <= 0) return;

    editGoal(selectedGoalForEdit.id, {
      title: title.trim(),
      targetAmount: target,
      category,
      glow: selectedGlow,
    });

    resetForm();
    setSelectedGoalForEdit(null);
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForContribution) return;
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) return;

    const goal = goals.find(g => g.id === selectedGoalForContribution);
    contributeToGoal(selectedGoalForContribution, amount);
    
    if (goal && (goal.currentAmount + amount) >= goal.targetAmount && goal.currentAmount < goal.targetAmount) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setContributionAmount("");
    setSelectedGoalForContribution(null);
  };

  const openEditModal = (goal: SavingsGoal) => {
    setSelectedGoalForEdit(goal);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount.toString());
    setCategory(goal.category);
    setSelectedGlow(goal.glow as any);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[110] max-w-md mx-auto pointer-events-auto"
          >
            <div
              className={`backdrop-blur-3xl border-t rounded-t-[40px] p-6 pt-3 max-h-[85vh] overflow-y-auto pb-12 relative transition-colors ${
                isLight
                  ? "bg-white/95 border-slate-200 text-slate-900 shadow-[0_-12px_50px_rgba(0,0,0,0.1)]"
                  : "bg-gradient-to-b from-[#181530]/98 via-[#0F0D24]/98 to-[#090816] border-white/10 text-white shadow-[0_-20px_60px_rgba(123,97,255,0.25)]"
              }`}
            >
              {/* Drag Handle */}
              <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 ${isLight ? "bg-slate-300" : "bg-white/20"}`} />

              <button
                onClick={onClose}
                className={`absolute top-5 right-6 w-9 h-9 rounded-full backdrop-blur-xl flex items-center justify-center border cursor-pointer transition-colors z-10 ${
                  isLight
                    ? "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                    : "bg-white/10 border-white/15 hover:bg-white/20 text-white/80"
                }`}
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <GlassIcon icon={Zap} size="md" glow="blue" asChild />
                  <div>
                    <h2 className={`${textColor} text-2xl font-black tracking-tight`}>
                      Savings Goals
                    </h2>
                    <div className={`${subtextColor} text-sm tracking-tight mt-0.5`}>
                      {goals.length === 0 ? "No active goals" : `${goals.length} Financial Milestone${goals.length > 1 ? "s" : ""}`}
                    </div>
                  </div>
                </div>
                
                {goals.length > 0 && !showAddGoal && !selectedGoalForEdit && (
                  <button
                    onClick={() => setShowAddGoal(true)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                      isLight ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>

              {/* Goals List or Empty State */}
              {goals.length === 0 && !showAddGoal && !selectedGoalForEdit ? (
                <div
                  className={`p-8 rounded-[28px] border text-center mb-6 backdrop-blur-xl ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-4 ${isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/10"}`}>
                    <Zap size={32} color={accentColor} />
                  </div>
                  <h3 className={`${textColor} font-bold text-lg mb-2`}>No Savings Goals Set</h3>
                  <p className={`${subtextColor} text-sm mb-6 max-w-[240px] mx-auto leading-relaxed`}>
                    Set up custom target goals for vacations, emergency funds, or tech upgrades and track your progress.
                  </p>
                  <button
                    onClick={() => setShowAddGoal(true)}
                    style={{ backgroundColor: accentColor, color: isLight ? "#fff" : "#000" }}
                    className="px-6 py-3.5 rounded-full font-bold text-sm hover:scale-105 transition-transform cursor-pointer flex items-center justify-center gap-2 mx-auto w-full max-w-[220px]"
                  >
                    <Plus size={18} /> Create Goal
                  </button>
                </div>
              ) : (
                <div className="mb-6">
                  {goals.map((goal: SavingsGoal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      isLight={isLight}
                      textColor={textColor}
                      subtextColor={subtextColor}
                      currency={currency}
                      onContribute={() => setSelectedGoalForContribution(goal.id)}
                      onEdit={() => openEditModal(goal)}
                      onDelete={() => deleteGoal(goal.id)}
                    />
                  ))}
                </div>
              )}

              {/* Contribute Sub-Modal / Form */}
              <AnimatePresence>
                {selectedGoalForContribution && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleContribute}
                    className={`p-5 rounded-[24px] border mb-6 space-y-3 shadow-lg overflow-hidden ${
                      isLight ? "bg-slate-50 border-emerald-300" : "bg-gradient-to-br from-[#121020] to-[#0A0915] border-emerald-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className={`${textColor} flex items-center gap-1.5 text-sm`}>
                        <Coins size={16} className="text-emerald-500" /> Deposit Funds
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedGoalForContribution(null)}
                        className={`${subtextColor} hover:text-current`}
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`${textColor} text-lg font-black`}>{currencySymbols[currency as keyof typeof currencySymbols]}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoFocus
                        placeholder="Amount"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                        className={`w-full bg-transparent border-none text-2xl font-black outline-none ${textColor} placeholder:${subtextColor}`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!contributionAmount}
                      className="w-full py-3.5 rounded-full bg-emerald-500 text-white font-bold text-sm disabled:opacity-50 transition-all hover:bg-emerald-600 shadow-[0_4px_14px_rgba(16,185,129,0.3)] mt-2"
                    >
                      Add Funds
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Add/Edit Goal Form */}
              <AnimatePresence>
                {(showAddGoal || selectedGoalForEdit) && (
                  <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    onSubmit={selectedGoalForEdit ? handleEditGoal : handleCreateGoal}
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddGoal(false);
                          setSelectedGoalForEdit(null);
                          resetForm();
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                          isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-200" : "bg-white/10 hover:bg-white/20 border-white/15 text-white"
                        }`}
                      >
                        <X size={14} />
                      </button>
                      <h3 className={`${textColor} font-bold text-lg`}>
                        {selectedGoalForEdit ? "Edit Goal" : "Create New Goal"}
                      </h3>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-bold mb-1.5 ${isLight ? "text-slate-600" : "text-white/60"}`}>
                        Goal Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dream Trip to Japan"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full border rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none transition-all ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400"
                            : "bg-black/40 border-white/15 text-white placeholder:text-white/30 focus:border-white/40"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-[11px] font-bold mb-1.5 ${isLight ? "text-slate-600" : "text-white/60"}`}>
                          Target Amount ({currencySymbols[currency as keyof typeof currencySymbols]})
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          placeholder="50000"
                          value={targetAmount}
                          onChange={(e) => setTargetAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                          className={`w-full border rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none transition-all ${
                            isLight
                              ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400"
                              : "bg-black/40 border-white/15 text-white placeholder:text-white/30 focus:border-white/40"
                          }`}
                        />
                      </div>
                      
                      {!selectedGoalForEdit && (
                        <div>
                          <label className={`block text-[11px] font-bold mb-1.5 ${isLight ? "text-slate-600" : "text-white/60"}`}>
                            Initial Deposit (Optional)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={initialAmount}
                            onChange={(e) => setInitialAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                            className={`w-full border rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none transition-all ${
                              isLight
                                ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400"
                                : "bg-black/40 border-white/15 text-white placeholder:text-white/30 focus:border-white/40"
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={`block text-[11px] font-bold mb-2 ${isLight ? "text-slate-600" : "text-white/60"}`}>
                        Theme Color
                      </label>
                      <div className="flex items-center gap-3">
                        {glowThemes.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setSelectedGlow(g)}
                            className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                              selectedGlow === g ? (isLight ? "border-slate-800 scale-110" : "border-white scale-110") : "border-transparent"
                            } ${
                              g === "gold" ? "bg-amber-400" :
                              g === "blue" ? "bg-blue-400" :
                              g === "purple" ? "bg-purple-400" : "bg-pink-400"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{ backgroundColor: accentColor, color: isLight ? "#fff" : "#000" }}
                      className="w-full mt-4 py-4 rounded-full font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg"
                    >
                      {selectedGoalForEdit ? "Save Changes" : "Create Goal"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
