// Shared Admin UI Components — all in one file for simplicity
// StatusBadge, FilterBar, EmptyState, ChartCard, SectionHeader, ProgressBar

import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, AlertCircle, InboxIcon } from "lucide-react";

// ─── StatusBadge ──────────────────────────────────────────────
interface StatusBadgeProps {
  status: string;
  isDark?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  SYNCED: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  ACTIVE: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  OFFLINE_LOCAL: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  PENDING: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  FLAGGED: "bg-red-500/15 text-red-600 border-red-500/30",
  SUSPENDED: "bg-red-500/15 text-red-600 border-red-500/30",
  IDLE: "bg-slate-500/15 text-slate-500 border-slate-500/30",
  OPEN: "bg-red-500/15 text-red-600 border-red-500/30",
  IN_PROGRESS: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  RESOLVED: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  CLOSED: "bg-slate-500/15 text-slate-500 border-slate-500/30",
  HIGH: "bg-red-500/15 text-red-600 border-red-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  LOW: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  SUPER_ADMIN: "bg-purple-500/15 text-purple-600 border-purple-500/30",
  SUPPORT_MODERATOR: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  ANALYST: "bg-teal-500/15 text-teal-600 border-teal-500/30",
  USER: "bg-slate-500/15 text-slate-500 border-slate-500/30",
};

export function StatusBadge({ status, isDark }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || "bg-slate-500/15 text-slate-500 border-slate-500/30";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${style}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── FilterBar ────────────────────────────────────────────────
interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (v: string) => void;
  searchPlaceholder?: string;
  isDark?: boolean;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  filters,
  activeFilter,
  onFilterChange,
  searchPlaceholder = "Search...",
  isDark = false,
}: FilterBarProps) {
  const inputBg = isDark ? "bg-[#2D2D2D] border-[#374151] text-white placeholder-white/30" : "bg-[#F1F5F9] border-[#E5E7EB] text-[#111827] placeholder-[#6B7280]";
  const pillBase = isDark ? "text-[#94A3B8] hover:bg-white/10" : "text-[#6B7280] hover:bg-slate-200";
  const pillActive = isDark ? "bg-white text-[#111827]" : "bg-[#111827] text-white";

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/30" : "text-[#6B7280]"}`} />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className={`w-full h-10 pl-10 pr-4 rounded-2xl border text-sm font-medium outline-none transition-all ${inputBg}`}
        />
      </div>
      {/* Segment Pills */}
      <div className={`flex gap-1.5 overflow-x-auto pb-1 p-1.5 rounded-2xl ${isDark ? "bg-white/5" : "bg-[#F1F5F9]"}`}>
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeFilter === f.value ? pillActive : pillBase
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── EmptyState ────────────────────────────────────────────────
interface EmptyStateProps {
  title: string;
  description?: string;
  isDark?: boolean;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, isDark, icon }: EmptyStateProps) {
  const textColor = isDark ? "text-[#94A3B8]" : "text-[#6B7280]";
  const titleColor = isDark ? "text-[#F8FAFC]" : "text-[#111827]";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className={`mb-3 ${textColor}`}>
        {icon || <InboxIcon className="w-10 h-10 opacity-30" />}
      </div>
      <p className={`font-bold text-sm mb-1 ${titleColor}`}>{title}</p>
      {description && <p className={`text-xs ${textColor}`}>{description}</p>}
    </motion.div>
  );
}

// ─── ChartCard ────────────────────────────────────────────────
interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isDark?: boolean;
  className?: string;
  action?: React.ReactNode;
}

export function ChartCard({ title, subtitle, children, isDark, className = "", action }: ChartCardProps) {
  const cardBg = isDark ? "bg-[#1E1E1E] border-[#374151]" : "bg-white border-[#E5E7EB]";
  const titleColor = isDark ? "text-[#F8FAFC]" : "text-[#111827]";
  const subColor = isDark ? "text-[#94A3B8]" : "text-[#6B7280]";
  return (
    <div className={`p-5 rounded-[20px] border ${cardBg} ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`text-sm font-black tracking-tight ${titleColor}`}>{title}</h3>
          {subtitle && <p className={`text-[11px] mt-0.5 ${subColor}`}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  isDark?: boolean;
}

export function SectionHeader({ title, subtitle, action, isDark }: SectionHeaderProps) {
  const titleColor = isDark ? "text-[#F8FAFC]" : "text-[#111827]";
  const subColor = isDark ? "text-[#94A3B8]" : "text-[#6B7280]";
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className={`text-base font-black tracking-tight ${titleColor}`}>{title}</h2>
        {subtitle && <p className={`text-[11px] mt-0.5 ${subColor}`}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────
interface ProgressBarProps {
  value: number;    // 0-100
  label: string;
  count?: number;
  color?: string;
  isDark?: boolean;
}

export function ProgressBar({ value, label, count, color = "bg-emerald-500", isDark }: ProgressBarProps) {
  const labelColor = isDark ? "text-[#94A3B8]" : "text-[#6B7280]";
  const valueColor = isDark ? "text-[#F8FAFC]" : "text-[#111827]";
  const trackBg = isDark ? "bg-white/10" : "bg-[#F1F5F9]";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${labelColor}`}>{label}</span>
        <span className={`text-xs font-black ${valueColor}`}>
          {count !== undefined ? count : `${value}%`}
        </span>
      </div>
      <div className={`h-2 rounded-full ${trackBg} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ type: "spring", damping: 28, stiffness: 120, delay: 0.1 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

// ─── SkeletonCard ─────────────────────────────────────────────
interface SkeletonCardProps {
  isDark?: boolean;
  lines?: number;
}

export function SkeletonCard({ isDark, lines = 3 }: SkeletonCardProps) {
  const bg = isDark ? "bg-[#1E1E1E] border-[#374151]" : "bg-white border-[#E5E7EB]";
  const pulse = isDark ? "bg-white/10" : "bg-slate-200";
  return (
    <div className={`p-5 rounded-[20px] border ${bg} animate-pulse space-y-3`}>
      <div className={`h-3 w-24 rounded-full ${pulse}`} />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 rounded-full ${pulse}`} style={{ width: `${70 + i * 10}%` }} />
      ))}
    </div>
  );
}

// ─── NoDataBanner ─────────────────────────────────────────────
interface NoDataBannerProps {
  message: string;
  isDark?: boolean;
}

export function NoDataBanner({ message, isDark }: NoDataBannerProps) {
  const bg = isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200";
  const text = isDark ? "text-amber-400" : "text-amber-700";
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-medium ${bg} ${text}`}>
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {message}
    </div>
  );
}
