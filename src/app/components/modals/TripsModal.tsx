import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "motion/react";
import { X, Plane, Plus, Calendar, Trash2, Edit3, Coins } from "lucide-react";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { GlassIcon } from "../GlassIcon";

interface TripsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetGradients = [
  "linear-gradient(135deg, #10B981 0%, #3B82F6 100%)",
  "linear-gradient(135deg, #F43F5E 0%, #F59E0B 100%)",
  "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
  "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
  "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)",
  "linear-gradient(135deg, #14B8A6 0%, #EAB308 100%)",
];

const springConfig = { type: "spring" as const, stiffness: 350, damping: 30 };

// --- TripCard Component (Matches GoalCard with Swipe & Context Menu) ---
function TripCard({ trip, isLight, currency, onContribute, onEdit, onDelete }: any) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const controls = useAnimation();
  
  const percent = Math.min(100, Math.max(0, (trip.spent / trip.budget) * 100));
  const remaining = trip.budget - trip.spent;
  const overspent = remaining < 0;

  const handlePointerDown = () => {
    pressTimer.current = setTimeout(() => {
      setShowMenu(true);
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 500);
  };

  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const offset = info.offset.x;
    if (offset < -80 || offset > 80) {
      onDelete();
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

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
          e.preventDefault();
          setShowMenu(true);
        }}
        className={`relative w-full p-5 rounded-[24px] border backdrop-blur-xl transition-all cursor-grab active:cursor-grabbing overflow-hidden z-10 ${
          isLight ? "bg-white border-slate-200" : "bg-white/5 hover:bg-white/10 border-white/10"
        }`}
      >
        {/* Subtle Gradient Background matching trip flavor */}
        <div className="absolute inset-0 opacity-[0.10] pointer-events-none" style={{ background: trip.gradient }} />
        
        <div className="relative z-10 flex justify-between items-start mb-4 pointer-events-none">
          <div>
            <h3 className={`font-extrabold text-base tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>{trip.title}</h3>
            {(trip.startDate || trip.endDate) && (
              <div className={`flex items-center gap-1 text-xs tracking-tight mt-0.5 ${isLight ? "text-slate-500" : "text-white/60"}`}>
                <Calendar size={12} />
                {trip.startDate} {trip.endDate ? `to ${trip.endDate}` : ""}
              </div>
            )}
          </div>
          
          <div className="text-right pointer-events-none">
            <div className={`font-black text-sm tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              {percent.toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="relative z-10 pointer-events-none">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isLight ? "text-slate-500" : "text-white/50"}`}>
                Spent
              </div>
              <div className={`font-black text-lg ${isLight ? "text-slate-900" : "text-white"}`}>
                {currencySymbols[currency as keyof typeof currencySymbols]}{trip.spent.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isLight ? "text-slate-500" : "text-white/50"}`}>
                {overspent ? "Overspent" : "Remaining"}
              </div>
              <div className={`font-black text-lg ${overspent ? (isLight ? "text-rose-600" : "text-rose-400") : (isLight ? "text-slate-900" : "text-white")}`}>
                {currencySymbols[currency as keyof typeof currencySymbols]}{Math.abs(remaining).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={`h-2 rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-black/30"}`}>
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${percent}%`, background: trip.gradient }}
            />
          </div>
          <div className={`text-right text-[10px] font-bold mt-1 ${isLight ? "text-slate-400" : "text-white/40"}`}>
            Total Budget: {currencySymbols[currency as keyof typeof currencySymbols]}{trip.budget.toLocaleString()}
          </div>
        </div>

        {/* Apple Style Context Menu Overlay */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-[24px]"
              onPointerDown={(e) => e.stopPropagation()}
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


export function TripsModal({ isOpen, onClose }: TripsModalProps) {
  const { trips, addTrip, removeTrip, updateTripSpent, editTrip, currency, theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const accentColor = activeTheme.primary;

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTripForEdit, setSelectedTripForEdit] = useState<any | null>(null);
  const [selectedTripForContribution, setSelectedTripForContribution] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  
  const [newTrip, setNewTrip] = useState({
    title: "",
    budget: "",
    startDate: "",
    endDate: "",
    gradient: presetGradients[0],
  });

  const resetForm = () => {
    setNewTrip({
      title: "",
      budget: "",
      startDate: "",
      endDate: "",
      gradient: presetGradients[0],
    });
  };

  const openEditModal = (trip: any) => {
    setNewTrip({
      title: trip.title,
      budget: trip.budget.toString(),
      startDate: trip.startDate || "",
      endDate: trip.endDate || "",
      gradient: trip.gradient,
    });
    setSelectedTripForEdit(trip);
    setShowAddForm(false);
  };

  const handleAddTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrip.title || !newTrip.budget) return;

    addTrip({
      title: newTrip.title,
      budget: parseFloat(newTrip.budget),
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
      gradient: newTrip.gradient,
    });

    resetForm();
    setShowAddForm(false);
  };

  const handleEditTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripForEdit || !newTrip.title || !newTrip.budget) return;

    editTrip(selectedTripForEdit.id, {
      title: newTrip.title,
      budget: parseFloat(newTrip.budget),
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
      gradient: newTrip.gradient,
    });

    resetForm();
    setSelectedTripForEdit(null);
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(contributionAmount);
    if (!isNaN(val) && val > 0 && selectedTripForContribution) {
      updateTripSpent(selectedTripForContribution, val);
      setContributionAmount("");
      setSelectedTripForContribution(null);
    }
  };

  const resetAndClose = () => {
    setShowAddForm(false);
    setSelectedTripForEdit(null);
    setSelectedTripForContribution(null);
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={springConfig}
            className="fixed bottom-0 left-0 right-0 z-[110] max-w-lg mx-auto flex flex-col justify-end"
          >
            <div
              className={`w-full max-h-[92vh] flex flex-col rounded-t-[40px] relative transition-colors ${
                isLight
                  ? "bg-white/95 border-t border-slate-200 text-slate-900 shadow-[0_-20px_50px_rgba(0,0,0,0.15)]"
                  : "bg-gradient-to-b from-[#181530]/98 via-[#0F0D24]/98 to-[#090816] border-t border-white/10 text-white shadow-[0_-20px_60px_rgba(123,97,255,0.25)]"
              } backdrop-blur-3xl`}
            >
              {/* Pill Handle */}
              <div className="shrink-0 pt-4 pb-2 flex justify-center w-full bg-transparent">
                <div className={`w-12 h-1.5 rounded-full ${isLight ? "bg-slate-300" : "bg-white/20"}`} />
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 pb-12 hide-scrollbar">
                
                {/* Header Row */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <GlassIcon icon={Plane} size="md" glow="gold" asChild />
                    <div>
                      <h2 className={`${textColor} text-2xl font-black tracking-tight`}>
                        Trips
                      </h2>
                      <div className={`${subtextColor} text-sm tracking-tight mt-0.5`}>
                        {trips.length === 0 ? "No active trips" : `${trips.length} Travel Budget${trips.length > 1 ? "s" : ""}`}
                      </div>
                    </div>
                  </div>
                  
                  {trips.length > 0 && !showAddForm && !selectedTripForEdit && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                        isLight ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>

                {/* Main Content Area */}
                <AnimatePresence mode="wait">
                  {!showAddForm && !selectedTripForEdit && !selectedTripForContribution ? (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {trips.length === 0 ? (
                        <div className={`text-center py-12 flex flex-col items-center justify-center ${subtextColor}`}>
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
                            <Plane size={32} className="opacity-20" />
                          </div>
                          <p className="text-sm font-medium mb-6">No trips planned yet.</p>
                          <button
                            onClick={() => setShowAddForm(true)}
                            style={{ backgroundColor: accentColor, color: isLight ? "#fff" : "#000" }}
                            className="px-6 py-3.5 rounded-full font-bold text-sm hover:scale-105 transition-transform cursor-pointer flex items-center justify-center gap-2 max-w-[220px]"
                          >
                            <Plus size={18} /> Plan Trip
                          </button>
                        </div>
                      ) : (
                        trips.map(trip => (
                          <TripCard
                            key={trip.id}
                            trip={trip}
                            isLight={isLight}
                            currency={currency}
                            onContribute={() => setSelectedTripForContribution(trip.id)}
                            onEdit={() => openEditModal(trip)}
                            onDelete={() => removeTrip(trip.id)}
                          />
                        ))
                      )}
                    </motion.div>
                  ) : selectedTripForContribution ? (
                    <motion.form
                      key="contribute-form"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onSubmit={handleContribute}
                      className={`p-5 rounded-[24px] border mb-6 space-y-3 shadow-lg overflow-hidden ${
                        isLight ? "bg-slate-50 border-emerald-300" : "bg-gradient-to-br from-[#121020] to-[#0A0915] border-emerald-500/40"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold mb-2">
                        <span className={`${textColor} flex items-center gap-1.5 text-sm`}>
                          <Coins size={16} className="text-emerald-500" /> Log Expense
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedTripForContribution(null)}
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
                          placeholder="Amount Spent"
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
                        Add Expense
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="trip-form"
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={selectedTripForEdit ? handleEditTrip : handleAddTrip}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center mb-2 px-2">
                        <h3 className={`${textColor} font-bold text-lg`}>
                          {selectedTripForEdit ? "Edit Trip" : "Plan Trip"}
                        </h3>
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowAddForm(false);
                            setSelectedTripForEdit(null);
                            resetForm();
                          }} 
                          className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors bg-white/10 hover:bg-white/20 border-white/15"
                        >
                          <X size={14} className={isLight ? "text-slate-800" : "text-white"} />
                        </button>
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 px-2 ${isLight ? "text-slate-500" : "text-white/50"}`}>Destination / Name</label>
                        <input
                          type="text"
                          required
                          value={newTrip.title}
                          onChange={(e) => setNewTrip({ ...newTrip, title: e.target.value })}
                          placeholder="e.g. Kyoto 2026"
                          autoFocus
                          className={`w-full p-4 rounded-[20px] font-bold text-lg outline-none transition-all ${
                            isLight ? "bg-slate-50 focus:bg-white border border-slate-200" : "bg-black/20 focus:bg-black/40 border border-white/10"
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 px-2 ${isLight ? "text-slate-500" : "text-white/50"}`}>Trip Budget</label>
                        <div className="relative">
                          <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-lg ${isLight ? "text-slate-400" : "text-white/40"}`}>
                            {currencySymbols[currency as keyof typeof currencySymbols]}
                          </span>
                          <input
                            type="text"
                            required
                            inputMode="decimal"
                            value={newTrip.budget}
                            onChange={(e) => setNewTrip({ ...newTrip, budget: e.target.value.replace(/[^0-9.]/g, "") })}
                            placeholder="5000"
                            className={`w-full pl-10 pr-4 py-4 rounded-[20px] font-bold text-lg outline-none transition-all ${
                              isLight ? "bg-slate-50 focus:bg-white border border-slate-200" : "bg-black/20 focus:bg-black/40 border border-white/10"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 px-2 ${isLight ? "text-slate-500" : "text-white/50"}`}>Start (Optional)</label>
                          <input
                            type="date"
                            value={newTrip.startDate}
                            onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                            className={`w-full p-4 rounded-[20px] font-bold text-sm outline-none transition-all ${
                              isLight ? "bg-slate-50 focus:bg-white border border-slate-200" : "bg-black/20 focus:bg-black/40 border border-white/10"
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 px-2 ${isLight ? "text-slate-500" : "text-white/50"}`}>End (Optional)</label>
                          <input
                            type="date"
                            value={newTrip.endDate}
                            onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                            className={`w-full p-4 rounded-[20px] font-bold text-sm outline-none transition-all ${
                              isLight ? "bg-slate-50 focus:bg-white border border-slate-200" : "bg-black/20 focus:bg-black/40 border border-white/10"
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 px-2 ${isLight ? "text-slate-500" : "text-white/50"}`}>Theme Color</label>
                        <div className="flex gap-2 p-2 flex-wrap">
                          {presetGradients.map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setNewTrip({ ...newTrip, gradient: g })}
                              className={`w-10 h-10 rounded-full transition-all ${newTrip.gradient === g ? "ring-2 ring-offset-2 ring-slate-800 dark:ring-white dark:ring-offset-black scale-110" : "opacity-80 hover:opacity-100"}`}
                              style={{ background: g }}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!newTrip.title || !newTrip.budget}
                        className={`w-full py-4 rounded-full font-bold text-sm disabled:opacity-50 transition-all mt-4 ${
                          isLight ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-black hover:bg-slate-200"
                        }`}
                      >
                        {selectedTripForEdit ? "Save Changes" : "Plan Trip"}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
