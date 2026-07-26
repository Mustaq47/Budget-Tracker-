import { motion, AnimatePresence } from "motion/react";
import { X, Palette, Check, Sparkles, Eye, Moon, Sun } from "lucide-react";
import { useBudgetStore, AppTheme } from "../../../store/useBudgetStore";
import { themeMap, getActiveThemeConfig } from "../../../utils/themePresets";

interface DesignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DesignModal({ isOpen, onClose }: DesignModalProps) {
  const { theme, setTheme, colorMode, setColorMode } = useBudgetStore();

  const themesList = Object.values(themeMap);
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;

  const handleSelectTheme = (selectedId: AppTheme) => {
    setTheme(selectedId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[110] max-w-md mx-auto"
          >
            <div className="backdrop-blur-[60px] bg-gradient-to-b from-white/12 via-white/8 to-[#0B0914] border-t border-white/20 rounded-t-[48px] p-7 shadow-[0_-10px_50px_rgba(123,97,255,0.35),0_-4px_20px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto">
              
              {/* Top Drag Handle */}
              <div className="w-12 h-1.5 rounded-full bg-white/25 mx-auto mb-5" />

              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 cursor-pointer hover:bg-white/20 transition-all"
              >
                <X size={18} className="text-white/80" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D] flex items-center justify-center shadow-[0_0_25px_rgba(123,97,255,0.5)]">
                  <Palette size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-black tracking-tight">Design & Themes</h2>
                  <div className="text-white/60 text-xs tracking-tight">Select Your Aesthetic System</div>
                </div>
              </div>

              {/* Mode Selector Segmented Tabs */}
              <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 mb-6">
                <button
                  type="button"
                  onClick={() => setColorMode('dark')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    colorMode === 'dark'
                      ? "bg-gradient-to-r from-[#7B61FF] to-[#00E5FF] text-white shadow-md font-black"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <Moon size={14} /> Dark
                </button>
                <button
                  type="button"
                  onClick={() => setColorMode('light')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    colorMode === 'light'
                      ? "bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-md font-black"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <Sun size={14} /> Light
                </button>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10 mb-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold text-white/50 tracking-wider uppercase flex items-center gap-1">
                    <Eye size={12} className="text-[#00E5FF]" /> Live UI Preview
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-white font-semibold border border-white/15">
                    {activeTheme.tag}
                  </span>
                </div>

                {/* Sample Card */}
                <div className={`p-5 rounded-3xl ${activeTheme.bgClass} border ${isLight ? 'border-slate-200/90' : 'border-white/15'} shadow-xl transition-all`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`${isLight ? 'text-slate-600' : 'text-white/60'} text-xs font-semibold`}>Total Balance</span>
                    <div className="flex gap-1.5">
                      {activeTheme.swatchColors.map((color, i) => (
                        <div
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className={`${activeTheme.textColor} text-3xl font-black tracking-tighter mb-4`}>
                    ₹48,250.00
                  </div>

                  {/* Gradient Sample Bar */}
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${activeTheme.accentGradient} shadow-sm mb-1`}
                  />
                </div>
              </div>

              {/* Themes Selector List */}
              <div className="space-y-3 mb-6">
                <div className="text-white/60 text-xs font-semibold tracking-tight ml-1 mb-2">
                  Select Theme Preset
                </div>

                {themesList.map((tConfig) => {
                  const isSelected = tConfig.id === theme;
                  // Get dynamic config for the current item to display correct swatch colors
                  const dynamicConfig = getActiveThemeConfig(tConfig.id, colorMode);

                  return (
                    <motion.div
                      key={tConfig.id}
                      onClick={() => handleSelectTheme(tConfig.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? "bg-white/12 border-white/30 shadow-[0_0_25px_rgba(255,255,255,0.15)]"
                          : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          {/* Color Swatch Circles using current color mode */}
                          <div className="flex -space-x-1.5 items-center">
                            {dynamicConfig.swatchColors.map((c, i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full border-2 border-black/40 shadow-sm"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm font-bold tracking-tight">
                                {tConfig.name}
                              </span>
                              <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/10 text-white/70 font-semibold">
                                {tConfig.tag}
                              </span>
                            </div>
                            <div className="text-white/50 text-[11px] tracking-tight">
                              {tConfig.subtitle}
                            </div>
                          </div>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center shadow-lg">
                            <Check size={16} className="text-white stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Close / Confirm Button */}
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-black text-xs bg-gradient-to-r from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D] text-white shadow-[0_0_25px_rgba(123,97,255,0.5)] flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-all"
              >
                <Sparkles size={16} /> Apply Active Theme
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
