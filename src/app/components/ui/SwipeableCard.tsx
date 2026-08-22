import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "motion/react";
import { Trash2, X } from "lucide-react";

export interface SwipeableCardProps {
  children: React.ReactNode;
  onDelete: () => void;
  renderContextMenu: (closeMenu: () => void) => React.ReactNode;
  isLight: boolean;
}

export function SwipeableCard({ children, onDelete, renderContextMenu, isLight }: SwipeableCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const controls = useAnimation();

  const handlePointerDown = () => {
    pressTimer.current = setTimeout(() => {
      setShowMenu(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(50); // Haptic feedback on long press
      }
    }, 500); // 500ms long press
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (event: any, info: any) => {
    setIsDragging(false);
    const offset = info.offset.x;
    if (offset < -80 || offset > 80) {
      // Swiped far enough
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }
      
      // Animate off-screen in the direction of the swipe
      const direction = offset > 0 ? 1 : -1;
      await controls.start({ 
        x: direction * (window.innerWidth || 500), 
        opacity: 0,
        transition: { duration: 0.2, ease: "easeOut" } 
      });
      
      onDelete();
    } else {
      // Snap back
      controls.start({ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 120, damping: 24, mass: 1.2 }}
      className="relative w-full rounded-[20px] mb-3"
    >
      {/* Background Delete Indicator (Revealed on Swipe) */}
      <div className={`absolute inset-0 flex items-center justify-between px-5 z-0 rounded-[20px] bg-rose-500 overflow-hidden transition-opacity duration-300 ${isDragging ? "opacity-100" : "opacity-0"}`}>
        <Trash2 className="text-white w-6 h-6 opacity-80" />
        <Trash2 className="text-white w-6 h-6 opacity-80" />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={controls}
        onPointerDown={handlePointerDown}
        onPointerUp={cancelPress}
        onPointerMove={cancelPress}
        onPointerCancel={cancelPress}
        onContextMenu={(e) => {
          e.preventDefault(); // Prevent default browser context menu
          setShowMenu(true);
        }}
        className={`relative w-full p-4 rounded-[20px] border backdrop-blur-xl transition-all cursor-grab active:cursor-grabbing z-10 ${
          isLight ? "bg-white border-slate-200" : "bg-white/5 hover:bg-white/10 border-white/10"
        }`}
      >
        {children}

        {/* Hold-to-open Context Menu Overlay */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-[20px]"
              onPointerDown={(e) => e.stopPropagation()} // Stop drag when interacting with menu
              onClick={() => setShowMenu(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 5 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`flex items-center gap-1 p-1.5 rounded-full backdrop-blur-3xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border ${isLight ? "bg-white/80 border-white/50" : "bg-black/60 border-white/10"}`}
                onClick={(e) => e.stopPropagation()}
              >
                {renderContextMenu(() => setShowMenu(false))}
              </motion.div>

              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
                className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${isLight ? "bg-white/80 text-slate-500 hover:text-slate-900" : "bg-white/10 text-white/50 hover:text-white"}`}
              >
                <X size={14} strokeWidth={2} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
