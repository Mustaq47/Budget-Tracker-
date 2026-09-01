import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, TrendingDown, TrendingUp, PartyPopper } from "lucide-react";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { useSmartTrends } from "../../hooks/useSmartTrends";

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeeklySummaryModal({ isOpen, onClose }: WeeklySummaryModalProps) {
  const { theme, colorMode, currency } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const trends = useSmartTrends();
  
  const isLight = !activeTheme.isDark;
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  
  const symbol = currencySymbols[currency];
  
  const savedThisWeek = Math.max(0, (trends.weekdayTotal + trends.weekendTotal) * 0.1); // Mock calculation for demo

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className={`fixed bottom-0 left-0 right-0 z-[110] max-w-md mx-auto pointer-events-auto p-6 rounded-t-[32px] ${activeTheme.bgClass} shadow-2xl border-t ${isLight ? "border-slate-200" : "border-white/10"} touch-pan-y`}
          >
            <div className={`w-12 h-1.5 rounded-full ${isLight ? "bg-slate-300" : "bg-white/20"} mx-auto mb-4 touch-none cursor-grab active:cursor-grabbing`} />
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <Calendar size={20} />
                </div>
              </div>
            </div>
            
            <div className={`p-5 rounded-2xl border mb-4 flex items-center justify-between ${isLight ? "bg-emerald-50 border-emerald-100" : "bg-emerald-500/10 border-emerald-500/20"}`}>
              <div>
                <div className="text-emerald-500 font-bold flex items-center gap-1 mb-1">
                  <PartyPopper size={16} /> Great week!
                </div>
                <div className={`${textColor} text-sm font-medium`}>
                  You saved {symbol}{savedThisWeek.toFixed(2)} compared to last week.
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className={`p-4 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"} flex justify-between items-center`}>
                <div className={`${subtextColor} text-sm font-medium`}>Total Spent</div>
                <div className={`${textColor} font-bold`}>{symbol}{(trends.weekdayTotal + trends.weekendTotal).toFixed(2)}</div>
              </div>
              
              <div className={`p-4 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"} flex justify-between items-center`}>
                <div className={`${subtextColor} text-sm font-medium`}>Top Category</div>
                <div className={`${textColor} font-bold capitalize`}>{trends.topCategory || "None"}</div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-[#7B61FF] text-white font-bold tracking-tight shadow-[0_0_20px_rgba(123,97,255,0.4)]"
            >
              Continue to next week
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
