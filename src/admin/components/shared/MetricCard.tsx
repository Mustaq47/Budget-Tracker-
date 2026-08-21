// MetricCard — Reusable KPI metric card
// M3-compliant, animated counter, delta indicator

import React from "react";
import { motion } from "motion/react";
import type { MetricCardData } from "../../types/admin.types";

const colorMap = {
  emerald: { icon: "text-emerald-500", bg: "bg-emerald-500/10", delta: "text-emerald-500" },
  blue: { icon: "text-blue-500", bg: "bg-blue-500/10", delta: "text-blue-500" },
  purple: { icon: "text-purple-500", bg: "bg-purple-500/10", delta: "text-purple-500" },
  amber: { icon: "text-amber-500", bg: "bg-amber-500/10", delta: "text-amber-500" },
  red: { icon: "text-red-500", bg: "bg-red-500/10", delta: "text-red-500" },
  slate: { icon: "text-slate-500", bg: "bg-slate-500/10", delta: "text-slate-400" },
};

interface MetricCardProps extends MetricCardData {
  isLoading?: boolean;
  isDark?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function MetricCard({
  label,
  value,
  delta,
  deltaType = "neutral",
  icon,
  color = "slate",
  suffix,
  source,
  isLoading = false,
  isDark = false,
  className = "",
  size = "md",
}: MetricCardProps) {
  const colors = colorMap[color];
  const cardBg = isDark 
    ? "bg-[#1C1C1E]/80 border-white/5 backdrop-blur-2xl shadow-[0_4px_20px_rgb(0,0,0,0.3)]" 
    : "bg-white/80 border-slate-200/50 backdrop-blur-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]";
  const labelColor = isDark ? "text-white/50" : "text-slate-500";
  const valueColor = isDark ? "text-white" : "text-black";

  const sizeMap = {
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };
  const valueSizeMap = { sm: "text-xl", md: "text-2xl", lg: "text-3xl" };

  if (isLoading) {
    return (
      <div className={`${sizeMap[size]} rounded-[20px] border ${cardBg} ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`h-3 w-20 rounded-full ${isDark ? "bg-white/10" : "bg-slate-200"} animate-pulse`} />
          <div className={`w-7 h-7 rounded-xl ${isDark ? "bg-white/10" : "bg-slate-100"} animate-pulse`} />
        </div>
        <div className={`h-8 w-16 rounded-lg ${isDark ? "bg-white/10" : "bg-slate-200"} animate-pulse mb-2`} />
        <div className={`h-3 w-24 rounded-full ${isDark ? "bg-white/5" : "bg-slate-100"} animate-pulse`} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className={`${sizeMap[size]} rounded-[24px] border ${cardBg} ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[11px] font-extrabold uppercase tracking-wider ${labelColor}`}>
          {label}
        </span>
        {icon && (
          <div className={`w-7 h-7 rounded-xl ${colors.bg} flex items-center justify-center`}>
            <span className={`text-sm ${colors.icon}`}>{icon}</span>
          </div>
        )}
      </div>

      <div className={`${valueSizeMap[size]} font-black tracking-tight ${valueColor}`}>
        {source === "no_data" ? (
          <span className={`${isDark ? "text-white/20" : "text-slate-300"}`}>—</span>
        ) : (
          <>
            {value}
            {suffix && (
              <span className={`text-base font-semibold ml-0.5 ${labelColor}`}>{suffix}</span>
            )}
          </>
        )}
      </div>

      {delta !== undefined && (
        <div
          className={`text-[11px] font-bold mt-1.5 ${
            deltaType === "positive"
              ? "text-emerald-500"
              : deltaType === "negative"
              ? "text-red-400"
              : labelColor
          }`}
        >
          {deltaType === "positive" ? "↑" : deltaType === "negative" ? "↓" : "→"}{" "}
          {Math.abs(delta)}%
        </div>
      )}

      {source === "no_data" && (
        <div className={`text-[10px] font-medium mt-1 ${labelColor}`}>
          Awaiting data
        </div>
      )}
    </motion.div>
  );
}
