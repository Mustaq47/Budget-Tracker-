import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plane, PlusCircle, Calendar, Trash2 } from "lucide-react";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";

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

export function TripsModal({ isOpen, onClose }: TripsModalProps) {
  const { trips, addTrip, removeTrip, currency, theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;

  const [isAdding, setIsAdding] = useState(false);
  const [newTrip, setNewTrip] = useState({
    title: "",
    budget: "",
    startDate: "",
    endDate: "",
    gradient: presetGradients[0],
  });

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

    setNewTrip({
      title: "",
      budget: "",
      startDate: "",
      endDate: "",
      gradient: presetGradients[0],
    });
    setIsAdding(false);
  };

  const resetAndClose = () => {
    setIsAdding(false);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#EAB308] to-[#F97316] p-[1px] shadow-lg shadow-[#EAB308]/30">
                      <div className="w-full h-full rounded-[15px] bg-[#120F28] flex items-center justify-center">
                        <Plane size={20} className="text-[#EAB308]" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                        Trips
                      </h2>
                      <div className={`text-xs font-semibold tracking-wide ${isLight ? "text-slate-500" : "text-white/50"}`}>
                        Travel Budgets
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={resetAndClose}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                      isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-200" : "bg-white/5 hover:bg-white/10 border-white/10"
                    }`}
                  >
                    <X size={16} />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {!isAdding ? (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <button
                        onClick={() => setIsAdding(true)}
                        className={`w-full p-4 rounded-3xl border border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                          isLight ? "bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-700" : "bg-white/5 border-white/20 text-white/50 hover:bg-white/10 hover:text-white/80"
                        }`}
                      >
                        <PlusCircle size={24} />
                        <span className="font-bold text-sm">Plan New Trip</span>
                      </button>

                      <div className="space-y-4 mt-6">
                        {trips.length === 0 ? (
                          <div className={`text-center text-sm font-medium py-8 ${isLight ? "text-slate-400" : "text-white/30"}`}>
                            No trips planned yet.
                          </div>
                        ) : (
                          trips.map(trip => {
                            const percent = Math.min(100, Math.max(0, (trip.spent / trip.budget) * 100));
                            const remaining = trip.budget - trip.spent;
                            const overspent = remaining < 0;

                            return (
                              <div key={trip.id} className="relative rounded-[24px] p-5 overflow-hidden group shadow-lg">
                                {/* Gradient Background */}
                                <div className="absolute inset-0 opacity-[0.15]" style={{ background: trip.gradient }} />
                                
                                <div className="relative z-10 flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="font-bold text-lg">{trip.title}</h3>
                                    {(trip.startDate || trip.endDate) && (
                                      <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${isLight ? "text-slate-500" : "text-white/50"}`}>
                                        <Calendar size={12} />
                                        {trip.startDate} {trip.endDate ? `to ${trip.endDate}` : ""}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeTrip(trip.id)}
                                    className={`p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all ${
                                      isLight ? "bg-white hover:bg-rose-100 text-rose-500" : "bg-black/20 hover:bg-rose-500/20 text-rose-400"
                                    }`}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>

                                <div className="relative z-10">
                                  <div className="flex justify-between items-end mb-2">
                                    <div>
                                      <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isLight ? "text-slate-500" : "text-white/50"}`}>
                                        Spent
                                      </div>
                                      <div className="font-black text-lg">
                                        {currencySymbols[currency]}{trip.spent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isLight ? "text-slate-500" : "text-white/50"}`}>
                                        {overspent ? "Overspent" : "Remaining"}
                                      </div>
                                      <div className={`font-black text-lg ${overspent ? (isLight ? "text-rose-600" : "text-rose-400") : ""}`}>
                                        {currencySymbols[currency]}{Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
                                    Total Budget: {currencySymbols[currency]}{trip.budget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleAddTrip}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center mb-2 px-2">
                        <h3 className="font-bold text-lg">Plan Trip</h3>
                        <button type="button" onClick={() => setIsAdding(false)} className="text-sm font-bold opacity-60">Cancel</button>
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 px-2 ${isLight ? "text-slate-500" : "text-white/50"}`}>Destination / Name</label>
                        <input
                          type="text"
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
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 px-2 ${isLight ? "text-slate-500" : "text-white/50"}`}>Trip Budget ({currency})</label>
                        <div className="relative">
                          <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-lg ${isLight ? "text-slate-400" : "text-white/40"}`}>
                            {currencySymbols[currency]}
                          </span>
                          <input
                            type="text"
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
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 px-2 ${isLight ? "text-slate-500" : "text-white/50"}`}>Start</label>
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
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 px-2 ${isLight ? "text-slate-500" : "text-white/50"}`}>End</label>
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
                        <div className="flex gap-2 p-2">
                          {presetGradients.map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setNewTrip({ ...newTrip, gradient: g })}
                              className={`w-8 h-8 rounded-full transition-all ${newTrip.gradient === g ? "ring-2 ring-offset-2 ring-slate-800 dark:ring-white dark:ring-offset-black scale-110" : ""}`}
                              style={{ background: g }}
                            />
                          ))}
                        </div>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        disabled={!newTrip.title || !newTrip.budget}
                        className={`w-full py-4 mt-2 rounded-[20px] font-black text-sm flex items-center justify-center gap-2 transition-all ${
                          !newTrip.title || !newTrip.budget
                            ? "opacity-50 cursor-not-allowed bg-slate-500/20"
                            : "bg-gradient-to-r from-[#EAB308] to-[#F97316] text-white shadow-xl shadow-[#EAB308]/30"
                        }`}
                      >
                        Save Trip
                      </motion.button>
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
