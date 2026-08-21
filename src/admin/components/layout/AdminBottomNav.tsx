// Admin Bottom Navigation — 5 tabs, mobile-first
// M3 tokens, spring physics on press

import React from "react";
import { motion } from "motion/react";
import { LayoutDashboard, Users, DollarSign, BarChart2, Settings2 } from "lucide-react";
import type { AdminTab } from "../../types/admin.types";

interface AdminBottomNavProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  isDark: boolean;
  openTickets?: number;
}

const TABS: { key: AdminTab; label: string; Icon: React.ElementType }[] = [
  { key: "dashboard", label: "Overview", Icon: LayoutDashboard },
  { key: "users", label: "Users", Icon: Users },
  { key: "revenue", label: "Revenue", Icon: DollarSign },
  { key: "analytics", label: "Analytics", Icon: BarChart2 },
  { key: "settings", label: "Settings", Icon: Settings2 },
];

export function AdminBottomNav({ activeTab, onTabChange, isDark, openTickets = 0 }: AdminBottomNavProps) {
  const navBg = isDark
    ? "bg-[#1C1C1E]/75 border-white/5"
    : "bg-white/75 border-slate-200/50";
  const activeColor = isDark ? "text-[#4ADE80]" : "text-[#16A34A]";
  const inactiveColor = isDark ? "text-[#94A3B8]" : "text-[#6B7280]";
  const activeDot = isDark ? "bg-[#4ADE80]" : "bg-[#16A34A]";

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.08)] ${navBg}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = activeTab === key;
          const showBadge = key === "settings" && openTickets > 0;
          return (
            <motion.button
              key={key}
              onClick={() => onTabChange(key)}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl relative cursor-pointer transition-colors ${
                isActive
                  ? isDark ? "bg-[#4ADE80]/10" : "bg-[#16A34A]/10"
                  : ""
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${isActive ? activeColor : inactiveColor}`}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                    {openTickets > 9 ? "9+" : openTickets}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-bold transition-colors ${
                  isActive ? activeColor : inactiveColor
                }`}
              >
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="admin-nav-dot"
                  className={`absolute -bottom-1.5 w-1 h-1 rounded-full ${activeDot}`}
                  transition={{ type: "spring", damping: 28, stiffness: 280 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
