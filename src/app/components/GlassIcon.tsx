import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { useBudgetStore } from "../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../utils/themePresets";

interface GlassIconProps {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
  active?: boolean;
  glow?: "purple" | "blue" | "pink" | "gold";
  onClick?: () => void;
  asChild?: boolean;
}

const sizeMap = {
  sm: { container: "w-10 h-10", icon: 18 },
  md: { container: "w-14 h-14", icon: 24 },
  lg: { container: "w-20 h-20", icon: 32 },
};

const glowMap = {
  purple: "shadow-[0_0_20px_rgba(123,97,255,0.6)] border-[#7B61FF]/30",
  blue: "shadow-[0_0_20px_rgba(0,229,255,0.6)] border-[#00E5FF]/30",
  pink: "shadow-[0_0_20px_rgba(255,77,141,0.6)] border-[#FF4D8D]/30",
  gold: "shadow-[0_0_20px_rgba(255,209,102,0.6)] border-[#FFD166]/30",
};

const borderMap = {
  purple: "border-[#7B61FF]/20",
  blue: "border-[#00E5FF]/20",
  pink: "border-[#FF4D8D]/20",
  gold: "border-[#FFD166]/20",
};

// Light-mode equivalents: visible colored tints
const lightGlowMap = {
  purple: "shadow-md border-[#7B61FF]/25 bg-[#7B61FF]/10",
  blue: "shadow-md border-[#00B4D8]/25 bg-[#00B4D8]/10",
  pink: "shadow-md border-[#FF4D8D]/25 bg-[#FF4D8D]/10",
  gold: "shadow-md border-[#F59E0B]/25 bg-[#F59E0B]/10",
};

const lightBorderMap = {
  purple: "border-[#7B61FF]/15 bg-[#7B61FF]/8",
  blue: "border-[#00B4D8]/15 bg-[#00B4D8]/8",
  pink: "border-[#FF4D8D]/15 bg-[#FF4D8D]/8",
  gold: "border-[#F59E0B]/15 bg-[#F59E0B]/8",
};

// Icon text colors for light mode — use the glow accent as the icon color
const lightIconColorMap = {
  purple: "text-[#7B61FF]",
  blue: "text-[#0891B2]",
  pink: "text-[#E11D73]",
  gold: "text-[#D97706]",
};

export function GlassIcon({
  icon: Icon,
  size = "md",
  active = false,
  glow = "purple",
  onClick,
  asChild = false
}: GlassIconProps) {
  const { theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;

  const Component = asChild ? motion.div : motion.button;

  let themeContainerStyle = "";
  let themeIconColor = "";

  if (theme === "minimalist-theme") {
    themeContainerStyle = isLight
      ? "bg-zinc-100 border-zinc-300 shadow-sm hover:bg-zinc-200"
      : "bg-zinc-800/80 border-zinc-700 shadow-sm hover:bg-zinc-700";
    themeIconColor = isLight ? "text-zinc-900" : "text-zinc-100";
  } else if (theme === "gradient-theme") {
    themeContainerStyle = "bg-zinc-900 border-2 border-orange-500 shadow-[2px_2px_0px_#f97316] rounded-xl";
    themeIconColor = "text-orange-400";
  } else if (theme === "neumorphism") {
    themeContainerStyle = isLight
      ? "bg-[#E2E8F0] border border-white shadow-[4px_4px_8px_#CBD5E1,-4px_-4px_8px_#FFFFFF]"
      : "bg-slate-800 border border-slate-700 shadow-[4px_4px_8px_#0F172A,-4px_-4px_8px_#334155]";
    themeIconColor = isLight ? "text-slate-700" : "text-slate-200";
  } else if (theme === "material-design") {
    themeContainerStyle = isLight
      ? "bg-emerald-50 border-emerald-200 shadow-sm hover:bg-emerald-100"
      : "bg-emerald-950/40 border-emerald-500/30 shadow-md hover:bg-emerald-900/50";
    themeIconColor = isLight ? "text-emerald-700" : "text-emerald-400";
  }

  return (
    <Component
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${sizeMap[size].container}
        rounded-full
        flex items-center justify-center
        backdrop-blur-[40px]
        border
        transition-all duration-300
        ${themeContainerStyle
          ? themeContainerStyle
          : active
          ? isLight
            ? `${lightGlowMap[glow]}`
            : `bg-white/10 ${glowMap[glow]}`
          : isLight
            ? `${lightBorderMap[glow]} shadow-sm`
            : `bg-white/5 shadow-[0_4px_12px_rgba(0,0,0,0.3)] ${borderMap[glow]}`
        }
      `}
    >
      <Icon
        size={sizeMap[size].icon}
        className={
          themeIconColor
            ? themeIconColor
            : isLight
            ? active
              ? lightIconColorMap[glow]
              : `${lightIconColorMap[glow]} opacity-80`
            : active
            ? "text-white"
            : "text-white/70"
        }
        strokeWidth={1.5}
      />
    </Component>
  );
}
