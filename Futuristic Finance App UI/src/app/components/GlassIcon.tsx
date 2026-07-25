import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

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

export function GlassIcon({
  icon: Icon,
  size = "md",
  active = false,
  glow = "purple",
  onClick,
  asChild = false
}: GlassIconProps) {
  const Component = asChild ? motion.div : motion.button;

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
        ${active
          ? `bg-white/10 ${glowMap[glow]}`
          : `bg-white/5 shadow-[0_4px_12px_rgba(0,0,0,0.3)] ${borderMap[glow]}`
        }
      `}
    >
      <Icon
        size={sizeMap[size].icon}
        className={active ? "text-white" : "text-white/70"}
        strokeWidth={1.5}
      />
    </Component>
  );
}
