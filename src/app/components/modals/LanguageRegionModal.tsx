import { motion, AnimatePresence } from "motion/react";
import { X, Globe, Check, Sparkles } from "lucide-react";
import { useBudgetStore, CurrencyCode, LanguageCode } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { useState } from "react";
import { createPortal } from "react-dom";

interface LanguageRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  { code: 'en' as LanguageCode, name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: 'te' as LanguageCode, name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: 'hi' as LanguageCode, name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: 'ar' as LanguageCode, name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: 'zh' as LanguageCode, name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: 'kw' as LanguageCode, name: "Cornish", nativeName: "Kernewek", flag: "🇬🇧" },
  { code: 'cs' as LanguageCode, name: "Czech", nativeName: "Čeština", flag: "🇨🇿" },
  { code: 'nl' as LanguageCode, name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: 'fr' as LanguageCode, name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: 'de' as LanguageCode, name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: 'el' as LanguageCode, name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷" },
  { code: 'he' as LanguageCode, name: "Hebrew", nativeName: "עברית", flag: "🇮🇱" },
  { code: 'it' as LanguageCode, name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: 'ja' as LanguageCode, name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: 'kk' as LanguageCode, name: "Kazakh", nativeName: "Қазақша", flag: "🇰🇿" },
  { code: 'ko' as LanguageCode, name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: 'pl' as LanguageCode, name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: 'pt' as LanguageCode, name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: 'ru' as LanguageCode, name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: 'es' as LanguageCode, name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: 'tl' as LanguageCode, name: "Tagalog", nativeName: "Tagalog", flag: "🇵🇭" },
  { code: 'vi' as LanguageCode, name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
];

const currencies = [
  { code: 'INR' as CurrencyCode, symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: 'USD' as CurrencyCode, symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: 'EUR' as CurrencyCode, symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: 'GBP' as CurrencyCode, symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: 'JPY' as CurrencyCode, symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
];

export function LanguageRegionModal({ isOpen, onClose }: LanguageRegionModalProps) {
  const { theme, colorMode, currency, language, setCurrency, setLanguage } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  
  const [toastMsg, setToastMsg] = useState("");

  const handleSelectLanguage = (code: LanguageCode, name: string) => {
    setLanguage(code);
    setToastMsg(`Language set to ${name}!`);
    setTimeout(() => setToastMsg(""), 2000);
  };

  const handleSelectCurrency = (code: CurrencyCode, symbol: string) => {
    setCurrency(code);
    setToastMsg(`Currency symbol changed to ${symbol}!`);
    setTimeout(() => setToastMsg(""), 2000);
  };

  return createPortal(
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
              
              <div className="w-12 h-1.5 rounded-full bg-white/25 mx-auto mb-5" />

              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 cursor-pointer hover:bg-white/20 transition-all"
              >
                <X size={18} className="text-white/80" />
              </button>

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D] flex items-center justify-center shadow-[0_0_25px_rgba(123,97,255,0.5)]">
                  <Globe size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-black tracking-tight">Language & Region</h2>
                  <div className="text-white/60 text-xs tracking-tight">Set Localization & Currency Options</div>
                </div>
              </div>

              {/* Language Selector Section */}
              <div className="mb-6">
                <div className="text-white/60 text-xs font-semibold tracking-tight ml-1 mb-2">
                  System Language
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSelectLanguage(lang.code, lang.name)}
                        className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer text-center relative overflow-hidden ${
                          isSelected
                            ? "bg-white/12 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                            : "bg-white/5 border-white/10 hover:bg-white/8"
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="text-white text-xs font-bold">{lang.name}</div>
                          <div className="text-white/40 text-[9px]">{lang.nativeName}</div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Check size={10} className="text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Currency Selector Section */}
              <div className="mb-6">
                <div className="text-white/60 text-xs font-semibold tracking-tight ml-1 mb-2">
                  Preferred Currency
                </div>
                <div className="space-y-2">
                  {currencies.map((curr) => {
                    const isSelected = currency === curr.code;
                    return (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => handleSelectCurrency(curr.code, curr.symbol)}
                        className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-white/12 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/15"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl w-6 h-6 flex items-center justify-center">{curr.flag}</span>
                          <span className="text-white text-sm font-bold">{curr.name} ({curr.code})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#00E5FF] text-sm font-extrabold">{curr.symbol}</span>
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                              <Check size={12} className="text-white stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {toastMsg && (
                <div className="text-center text-xs font-semibold text-[#00E5FF] mb-4 flex items-center justify-center gap-1.5 animate-pulse">
                  <Sparkles size={14} /> {toastMsg}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-black text-xs bg-gradient-to-r from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D] text-white shadow-[0_0_25px_rgba(123,97,255,0.5)] flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-all"
              >
                Apply Preferences
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
