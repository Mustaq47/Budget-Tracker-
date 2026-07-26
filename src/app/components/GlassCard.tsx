import { motion } from "motion/react";
import { ReactNode } from "react";
import { useBudgetStore } from "../../store/useBudgetStore";
import { themeMap } from "../../utils/themePresets";

interface GlassCardProps {
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

export function GlassCard({ children, className = "", glow = false, glowColor = "purple" }: GlassCardProps) {
  const { theme, colorMode } = useBudgetStore();
  const activeTheme = themeMap[theme] || themeMap["cyber-neon"];
  const isLight = colorMode === 'light' || !activeTheme.isDark;

  const defaultCardBg = isLight 
    ? "bg-white/90 border border-slate-200/80 shadow-md text-slate-900" 
    : `${activeTheme.cardBg}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        backdrop-blur-[40px]
        rounded-3xl
        p-6
        transition-all
        duration-300
        ${defaultCardBg}
        ${glow ? glowColors[glowColor] : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
