import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, MessageSquareHeart } from "lucide-react";
import { createPortal } from "react-dom";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { springConfig } from "../../../utils/motion";
import { submitSupportTicket } from "../../../services/supportQueryService";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { theme, colorMode, user } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  
  const isLight = !activeTheme.isDark;

  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setFeedback("");
      setIsSubmitting(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await submitSupportTicket({
        userEmail: user?.email || "anonymous",
        subject: "App Feedback",
        question: feedback,
        category: "FEATURE_REQUEST",
        priority: "LOW",
      });
      
      setSubmitted(true);
      setTimeout(() => {
        resetAndClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to submit feedback", error);
      setIsSubmitting(false);
    }
  };

  const accentGradient = `linear-gradient(135deg, ${activeTheme.primaryColor}, ${activeTheme.secondaryColor})`;
  const accentGlow = `0 4px 15px ${activeTheme.primaryColor}30`;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={springConfig}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                resetAndClose();
              }
            }}
            className={`relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border ${activeTheme.bgClass} ${
              isLight ? "border-slate-200 text-slate-800" : "border-white/10 text-white"
            } backdrop-blur-2xl touch-pan-y`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-6 py-5 border-b shrink-0 ${
                isLight ? "border-slate-200" : "border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: accentGradient, boxShadow: accentGlow }}
                >
                  <MessageSquareHeart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    Give Feedback
                  </h2>
                  <p className={`text-xs font-medium ${isLight ? "text-slate-500" : "text-white/60"}`}>
                    Help us improve coZify
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {submitted ? (
                <div className="py-12 text-center">
                  <div
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                    style={{ background: `${activeTheme.primaryColor}15`, color: activeTheme.primaryColor }}
                  >
                    <Send size={24} />
                  </div>
                  <h4 className={`font-bold text-lg mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                    Thank You!
                  </h4>
                  <p className={`text-sm ${isLight ? "text-slate-500" : "text-white/60"}`}>
                    Your feedback helps us improve.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="What do you love? What can we improve?"
                    className={`w-full p-4 rounded-2xl border mb-6 focus:outline-none focus:ring-2 transition-all resize-none ${
                      isLight 
                        ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400" 
                        : "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    }`}
                    style={{ "--tw-ring-color": activeTheme.primaryColor } as React.CSSProperties}
                    rows={5}
                  />
                  <button
                    type="submit"
                    disabled={!feedback.trim() || isSubmitting}
                    className={`w-full py-3.5 rounded-2xl font-extrabold tracking-tight transition-all flex justify-center items-center gap-2 ${
                      !feedback.trim() || isSubmitting
                        ? isLight ? "bg-slate-200 text-slate-400" : "bg-white/5 text-white/30"
                        : "text-white shadow-lg"
                    }`}
                    style={feedback.trim() && !isSubmitting ? {
                      background: accentGradient,
                      boxShadow: accentGlow,
                    } : {}}
                  >
                    <Send size={18} /> {isSubmitting ? "Sending..." : "Submit Feedback"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
}
