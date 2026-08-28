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
}


export function GlassCard({
  children,
  className = "",
  glow = false,
  onClick,
  ...props
}: GlassCardProps) {
  const { theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const glowStyle = glow ? { boxShadow: `0 0 30px ${activeTheme.primaryColor}80` } : {};
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
      style={glowStyle}
      className={`
        backdrop-blur-[40px]
        rounded-[28px]
        p-6
        ${activeTheme.cardBg}

        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
