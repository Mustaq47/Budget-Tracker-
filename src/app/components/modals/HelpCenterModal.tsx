import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Search,
  HelpCircle,
  ChevronDown,
  Mail,
  MessageSquare,
  BookOpen,
  ShieldCheck,
  Cloud,
  DollarSign,
  Palette,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { useTranslation } from "../../../utils/translations";

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: any;
}

export function HelpCenterModal({ isOpen, onClose }: HelpCenterModalProps) {
  const { theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>("faq-1");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [helpfulMap, setHelpfulMap] = useState<Record<string, string>>({});
  const [copiedEmail, setCopiedEmail] = useState(false);

  const faqs: FaqItem[] = useMemo(
    () => [
      {
        id: "faq-1",
        category: "Getting Started",
        question: "How do I set or edit my daily budget?",
        answer:
          "You can set your daily budget from the Home screen by tapping 'Budget' in Quick Actions, or on the Profile screen under Preferences. You can choose a custom amount or use preset recommendations.",
        icon: DollarSign,
      },
      {
        id: "faq-2",
        category: "Budgeting",
        question: "How is the daily progress circle calculated?",
        answer:
          "Your circle shows today's total expenses compared to your set Daily Budget. Once expenses exceed 80%, the indicator shifts to warn you. You can track spending by category or week in Insights.",
        icon: Sparkles,
      },
      {
        id: "faq-3",
        category: "Cloud & Sync",
        question: "How does Cloud Backup and Restore work?",
        answer:
          "When signed in with Google, tap 'Backup Now' on your Profile screen to securely save your transactions, cards, and daily budget to encrypted Firebase Cloud storage. You can restore your data on any device.",
        icon: Cloud,
      },
      {
        id: "faq-4",
        category: "Security",
        question: "Is my financial data private and secure?",
        answer:
          "Yes! coZify is designed local-first. Your financial data lives entirely on your device unless you explicitly trigger a cloud backup. We never sell or share data with third parties.",
        icon: ShieldCheck,
      },
      {
        id: "faq-5",
        category: "Customization",
        question: "How do I change currency, language, or themes?",
        answer:
          "Go to your Profile screen and open 'Design & Themes' or 'Language & Region'. coZify supports 22 languages and multiple currencies (₹ INR, $ USD, € EUR, £ GBP, ¥ JPY) with real-time formatting.",
        icon: Palette,
      },
      {
        id: "faq-6",
        category: "Budgeting",
        question: "Can I manage multiple cards and wallets?",
        answer:
          "Yes! Tap 'Cards' or 'Wallet' from Home or Profile to add custom debit cards, credit cards, or cash balances. You can assign transactions directly to specific cards.",
        icon: BookOpen,
      },
    ],
    []
  );

  const categories = ["All", "Getting Started", "Budgeting", "Cloud & Sync", "Security", "Customization"];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleSendFeedback = () => {
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
    }, 3500);
  };

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("mustaqsk47@gmail.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className={`relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border ${
              isLight
                ? "bg-white/95 border-slate-200 text-slate-800"
                : "bg-[#0f1123]/95 border-white/10 text-white"
            } backdrop-blur-2xl`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-6 py-5 border-b shrink-0 ${
                isLight ? "border-slate-200" : "border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-lg font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                      {t.help}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/15 border border-blue-500/30 text-blue-400">
                      24/7 HUB
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-white/60"}`}>
                    Knowledge Base & Executive Support
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className={`p-2 rounded-full border transition-colors cursor-pointer ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Search Bar */}
              <div className="relative">
                <Search
                  className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${
                    isLight ? "text-slate-400" : "text-white/40"
                  }`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions or topics..."
                  className={`w-full pl-11 pr-10 py-3 rounded-2xl text-xs font-semibold border ${
                    isLight
                      ? "bg-slate-100 border-slate-200 text-slate-800 placeholder:text-slate-400"
                      : "bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  } focus:outline-none focus:border-purple-500 transition-colors`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer ${
                      isLight ? "text-slate-400 hover:text-slate-600" : "text-white/40 hover:text-white"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Pills + Results Counter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-1">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    const count = cat === "All" ? faqs.length : faqs.filter((f) => f.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md"
                            : isLight
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/5"
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${isActive ? "bg-white/20 text-white" : "bg-black/10 text-current opacity-70"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FAQ Accordion List */}
              <div className="space-y-3">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle
                      className={`w-10 h-10 mx-auto mb-2 ${isLight ? "text-slate-300" : "text-white/20"}`}
                    />
                    <p className={`text-xs font-medium ${isLight ? "text-slate-500" : "text-white/60"}`}>
                      No articles found matching "{searchQuery}"
                    </p>
                  </div>
                ) : (
                  filteredFaqs.map((faq) => {
                    const isExpanded = expandedId === faq.id;
                    const IconComp = faq.icon;
                    const feedbackState = helpfulMap[faq.id];
                    return (
                      <div
                        key={faq.id}
                        className={`rounded-2xl border transition-all select-none overflow-hidden ${
                          isExpanded
                            ? isLight
                              ? "bg-purple-50/80 border-purple-200 shadow-sm"
                              : "bg-white/10 border-purple-500/40 shadow-lg shadow-purple-500/5"
                            : isLight
                            ? "bg-slate-50 border-slate-200 hover:border-slate-300 cursor-pointer"
                            : "bg-white/5 border-white/10 hover:border-white/20 cursor-pointer"
                        }`}
                      >
                        <div
                          onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                          className="flex items-center justify-between p-4 gap-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isExpanded
                                  ? "bg-purple-500 text-white"
                                  : isLight
                                  ? "bg-slate-200 text-slate-700"
                                  : "bg-white/10 text-white/70"
                              }`}
                            >
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="block text-[10px] font-black uppercase tracking-wider text-purple-400 mb-0.5">
                                {faq.category}
                              </span>
                              <span
                                className={`text-xs font-bold leading-snug ${
                                  isLight ? "text-slate-900" : "text-white"
                                }`}
                              >
                                {faq.question}
                              </span>
                            </div>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                              isExpanded
                                ? "rotate-180 text-purple-500" : isLight ? "text-slate-400" : "text-white/40"
                            }`}
                          />
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`px-4 pb-4 pt-2 text-xs leading-relaxed border-t ${
                                isLight
                                  ? "text-slate-700 border-slate-200 font-medium"
                                  : "text-white/80 border-white/10"
                              }`}
                            >
                              <p className="mb-3">{faq.answer}</p>
                              {/* Helpful feedback pill */}
                              <div className={`flex items-center justify-between pt-3 border-t text-[11px] ${isLight ? "border-slate-200" : "border-white/10"}`}>
                                <span className={isLight ? "text-slate-500" : "text-white/60"}>Was this article helpful?</span>
                                {feedbackState ? (
                                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Thanks for feedback!
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setHelpfulMap((prev) => ({ ...prev, [faq.id]: "yes" }));
                                      }}
                                      className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                                        isLight ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700" : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                                      }`}
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setHelpfulMap((prev) => ({ ...prev, [faq.id]: "no" }));
                                      }}
                                      className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                                        isLight ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700" : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                                      }`}
                                    >
                                      No
                                    </button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Direct Support Section with Executive SLA badge */}
              <div
                className={`p-5 rounded-2xl border ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-white/10"
                } space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                        Executive Support
                      </h4>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ⚡ SLA &lt; 24h
                      </span>
                    </div>
                    <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-white/60"}`}>
                      Lead Developer: Mustaq • Direct technical assistance
                    </p>
                  </div>
                  {feedbackSent && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-bold animate-pulse">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Request Sent!
                    </span>
                  )}
                  {copiedEmail && (
                    <span className="flex items-center gap-1 text-[11px] text-purple-400 font-bold animate-pulse">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Email Copied!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href="mailto:mustaqsk47@gmail.com?subject=coZify%20App%20Support"
                    className="flex flex-col items-center justify-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md hover:opacity-90 transition-all cursor-pointer text-center"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Mail className="w-3.5 h-3.5" /> Email Developer
                    </div>
                    <span className="text-[10px] text-white/90 font-normal mt-0.5">mustaqsk47@gmail.com</span>
                  </a>
                  <button
                    onClick={handleCopyEmail}
                    className={`flex flex-col items-center justify-center py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isLight
                        ? "bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-800"
                        : "bg-white/10 hover:bg-white/15 border-white/10 text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <MessageSquare className="w-3.5 h-3.5" /> Copy Email
                    </div>
                    <span className="text-[10px] opacity-70 font-normal mt-0.5">mustaqsk47@gmail.com</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`px-6 py-4 border-t flex items-center justify-between shrink-0 ${
                isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-black/20 border-white/10 text-white/50"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>coZify v1.0.0 • Verified Support</span>
              </div>
              <button
                onClick={onClose}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isLight ? "bg-slate-200 hover:bg-slate-300 text-slate-800" : "bg-white/10 hover:bg-white/15 text-white"
                }`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
}
