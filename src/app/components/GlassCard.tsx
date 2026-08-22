import { motion, HTMLMotionProps } from "motion/react";
import { ReactNode } from "react";
import { useBudgetStore } from "../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../utils/themePresets";
import { useAccessibleAnimation, SMOOTH_EASE } from "../utils/motionConfig";
import { triggerHaptic } from "../../utils/motion";

export interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  glowColor?: "purple" | "blue" | "pink" | "gold";
}

const glowColors = {
  purple: "shadow-[0_0_30px_rgba(123,97,255,0.3)]",
  blue: "shadow-[0_0_30px_rgba(0,229,255,0.3)]",
  pink: "shadow-[0_0_30px_rgba(255,77,141,0.3)]",
  gold: "shadow-[0_0_30px_rgba(255,209,102,0.3)]",
};

export function GlassCard({
  children,
  className = "",
  glow = false,
  glowColor = "purple",
  onClick,
  ...props
}: GlassCardProps) {
  const { theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isReducedMotion = useAccessibleAnimation();

  return (
    <motion.div
      initial={{ opacity: 0, y: isReducedMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SMOOTH_EASE}
      whileHover={onClick && !isReducedMotion ? { scale: 1.02 } : {}}
      whileTap={onClick && !isReducedMotion ? { scale: 0.97 } : {}}
      onClick={(e) => {
        if (onClick) {
          triggerHaptic(15);
          onClick(e);
        }
      }}
      className={`
        backdrop-blur-[40px]
        rounded-[28px]
        p-6
        ${activeTheme.cardBg}
        ${glow ? glowColors[glowColor] : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
