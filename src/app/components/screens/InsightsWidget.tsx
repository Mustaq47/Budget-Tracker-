import { motion, AnimatePresence } from "motion/react";
import { Flame, Target, TrendingUp, Sparkles, X } from "lucide-react";
import { GlassCard } from "../GlassCard";
import { useSmartTrends } from "../../hooks/useSmartTrends";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { useState } from "react";
import { useTranslation } from "../../../utils/translations";

export function InsightsWidget() {
  const trends = useSmartTrends();
  const { theme, colorMode, currency } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const { t } = useTranslation();
  
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const isLight = !activeTheme.isDark;

  const [dismissedInsights, setDismissedInsights] = useState<number[]>([]);

  if (trends.insights.length === 0 && trends.currentStreak === 0) return null;

  return (
    <div className="mb-6 space-y-4">
      {/* Streaks Widget */}
      {trends.currentStreak > 0 && (
        <GlassCard glow glowColor="pink" className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <Flame className="text-white w-5 h-5" />
            </div>
            <div>
              <div className={`${textColor} font-bold text-sm tracking-tight`}>
                {trends.currentStreak} {t.dayStreak || "Day Streak!"}
              </div>
              <div className={`${subtextColor} text-xs tracking-tight`}>
                {(t.bestDays || "Best: {days} days").replace("{days}", String(trends.bestStreak))}
              </div>
            </div>
          </div>
          <div className="px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full text-xs font-bold">
            {t.onFire || "On Fire 🔥"}
          </div>
        </GlassCard>
      )}

      {/* Smart Trends */}
      <AnimatePresence>
        {trends.insights.map((insight, index) => {
          if (dismissedInsights.includes(index)) return null;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard glow glowColor="blue" className="p-4 flex items-start gap-3 relative">
                <div className={`p-2 rounded-xl ${isLight ? "bg-blue-50 text-blue-500" : "bg-blue-500/20 text-blue-400"}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 pt-1">
                  <div className={`${textColor} text-sm font-semibold tracking-tight leading-tight pr-6`}>
                    {insight}
                  </div>
                </div>
                <button 
                  onClick={() => setDismissedInsights(prev => [...prev, index])}
                  className={`absolute top-4 right-4 ${subtextColor} hover:${textColor} transition-colors`}
                >
                  <X className="w-4 h-4" />
                </button>
              </GlassCard>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
