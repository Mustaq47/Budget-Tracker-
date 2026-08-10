import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, MessageSquareHeart } from "lucide-react";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  
  const isLight = !activeTheme.isDark;
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;

  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    // Mock submit
    setTimeout(() => {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setFeedback("");
      }, 2000);
    }, 500);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className={`fixed bottom-0 left-0 right-0 z-[110] max-w-md mx-auto pointer-events-auto p-6 rounded-t-[32px] ${activeTheme.bgClass} shadow-2xl border-t ${isLight ? "border-slate-200" : "border-white/10"}`}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <MessageSquareHeart size={20} />
                </div>
                <h3 className={`${textColor} text-xl font-bold tracking-tight`}>Give Feedback</h3>
              </div>
              <button onClick={onClose} className={`p-2 rounded-full ${isLight ? "bg-slate-100" : "bg-white/10"} ${textColor}`}>
                <X size={18} />
              </button>
            </div>
            
            {submitted ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-4">
                  <Send size={24} />
                </div>
                <h4 className={`${textColor} font-bold text-lg mb-2`}>Thank You!</h4>
                <p className={`${subtextColor} text-sm`}>Your feedback helps us improve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What do you love? What can we improve?"
                  className={`w-full p-4 rounded-2xl border mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    isLight 
                      ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400" 
                      : "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  }`}
                  rows={4}
                />
                <button
                  type="submit"
                  disabled={!feedback.trim()}
                  className={`w-full py-3.5 rounded-2xl font-bold tracking-tight transition-all flex justify-center items-center gap-2 ${
                    !feedback.trim()
                      ? "bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-white/30"
                      : "bg-[#2563EB] text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                  }`}
                >
                  <Send size={18} /> Submit Feedback
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
