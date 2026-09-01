import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { ReactNode } from "react";
import { springConfig } from "../../utils/motion";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  isLight?: boolean;
}

export function BottomSheet({ isOpen, onClose, children, className = "", isLight = false }: BottomSheetProps) {
  // Use a deep blur backdrop that also triggers close on tap
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={springConfig}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            style={{ 
              willChange: "transform",
            }}
            className="fixed bottom-0 left-0 right-0 z-[110] max-w-lg mx-auto flex flex-col justify-end touch-pan-y"
          >
            <div
              className={`w-full max-h-[92vh] flex flex-col rounded-t-[40px] relative transition-colors ${
                isLight
                  ? "bg-white/95 border-t border-slate-200 text-slate-900 shadow-[0_-20px_50px_rgba(0,0,0,0.15)]"
                  : "bg-gradient-to-b from-[#181530]/98 via-[#0F0D24]/98 to-[#090816] border-t border-white/10 text-white shadow-[0_-20px_60px_rgba(123,97,255,0.25)]"
              } backdrop-blur-3xl ${className}`}
            >
              {/* Pill Handle with touch-action: none to capture drag properly */}
              <div 
                className="shrink-0 pt-4 pb-2 flex justify-center w-full bg-transparent"
                style={{ touchAction: "none" }}
              >
                <div className={`w-12 h-1.5 rounded-full ${isLight ? "bg-slate-300" : "bg-white/20"}`} />
              </div>

              {/* Prevent drag propagation when scrolling inner content on touch devices */}
              <div 
                className="flex-1 overflow-y-auto px-6 pb-12 hide-scrollbar"
                onPointerDown={(e) => {
                  // Only stop propagation if it's a touch event, so scroll works without dragging the modal
                  if (e.pointerType === "touch") {
                    e.stopPropagation();
                  }
                }}
              >
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
}
