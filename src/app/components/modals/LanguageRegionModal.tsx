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
  { code: 'en' as LanguageCode, name: "English", nativeName: "English", flag: "us" },
  { code: 'te' as LanguageCode, name: "Telugu", nativeName: "తెలుగు", flag: "in" },
  { code: 'hi' as LanguageCode, name: "Hindi", nativeName: "हिन्दी", flag: "in" },
  { code: 'ar' as LanguageCode, name: "Arabic", nativeName: "العربية", flag: "sa" },
  { code: 'zh' as LanguageCode, name: "Chinese", nativeName: "中文", flag: "cn" },
  { code: 'kw' as LanguageCode, name: "Cornish", nativeName: "Kernewek", flag: "gb" },
  { code: 'cs' as LanguageCode, name: "Czech", nativeName: "Čeština", flag: "cz" },
  { code: 'nl' as LanguageCode, name: "Dutch", nativeName: "Nederlands", flag: "nl" },
  { code: 'fr' as LanguageCode, name: "French", nativeName: "Français", flag: "fr" },
  { code: 'de' as LanguageCode, name: "German", nativeName: "Deutsch", flag: "de" },
  { code: 'el' as LanguageCode, name: "Greek", nativeName: "Ελληνικά", flag: "gr" },
  { code: 'he' as LanguageCode, name: "Hebrew", nativeName: "עברית", flag: "il" },
  { code: 'it' as LanguageCode, name: "Italian", nativeName: "Italiano", flag: "it" },
  { code: 'ja' as LanguageCode, name: "Japanese", nativeName: "日本語", flag: "jp" },
  { code: 'kk' as LanguageCode, name: "Kazakh", nativeName: "Қазақша", flag: "kz" },
  { code: 'ko' as LanguageCode, name: "Korean", nativeName: "한국어", flag: "kr" },
  { code: 'pl' as LanguageCode, name: "Polish", nativeName: "Polski", flag: "pl" },
  { code: 'pt' as LanguageCode, name: "Portuguese", nativeName: "Português", flag: "pt" },
  { code: 'ru' as LanguageCode, name: "Russian", nativeName: "Русский", flag: "ru" },
  { code: 'es' as LanguageCode, name: "Spanish", nativeName: "Español", flag: "es" },
  { code: 'tl' as LanguageCode, name: "Tagalog", nativeName: "Tagalog", flag: "ph" },
  { code: 'vi' as LanguageCode, name: "Vietnamese", nativeName: "Tiếng Việt", flag: "vn" },
];

const currencies = [
  { code: 'INR' as CurrencyCode, symbol: "₹", name: "Indian Rupee", flag: "in" },
  { code: 'USD' as CurrencyCode, symbol: "$", name: "US Dollar", flag: "us" },
  { code: 'EUR' as CurrencyCode, symbol: "€", name: "Euro", flag: "eu" },
  { code: 'GBP' as CurrencyCode, symbol: "£", name: "British Pound", flag: "gb" },
  { code: 'JPY' as CurrencyCode, symbol: "¥", name: "Japanese Yen", flag: "jp" },
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
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-[110] max-w-md mx-auto touch-pan-y"
          >
            <div className="backdrop-blur-[60px] bg-gradient-to-b from-white/12 via-white/8 to-[#0B0914] border-t border-white/20 rounded-t-[48px] p-7 shadow-default max-h-[90vh] overflow-y-auto">
              
              <div className="w-12 h-1.5 rounded-full bg-white/25 mx-auto mb-5 touch-none cursor-grab active:cursor-grabbing" />

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-default">
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
                            ? "bg-white/12 border-white/30 shadow-default"
                            : "bg-white/5 border-white/10 hover:bg-white/8"
                        }`}
                      >
                        <img src={`https://flagcdn.com/w40/${lang.flag}.png`} className="w-8 rounded-sm shadow-sm" alt={`${lang.name} flag`} />
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
                            ? "bg-white/12 border-white/30 shadow-default"
                            : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/15"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img src={`https://flagcdn.com/w20/${curr.flag}.png`} className="w-5 rounded-[2px] shadow-sm" alt={`${curr.name} flag`} />
                          <span className="text-white text-sm font-bold">{curr.name} ({curr.code})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary text-sm font-extrabold">{curr.symbol}</span>
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
                <div className="text-center text-xs font-semibold text-primary mb-4 flex items-center justify-center gap-1.5 animate-pulse">
                  <Sparkles size={14} /> {toastMsg}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-black text-xs bg-primary text-white shadow-default flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-all"
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
