// Dashboard Tab — Overview KPI grid + recent logins + platform breakdown
// M3 Material Design tokens, spring animations, Stripe-style editorial cards

import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Users,
  Activity,
  MessageSquare,
  ShieldCheck,
  Cloud,
  Smartphone,
  Globe,
  Monitor,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { MetricCard } from "../components/shared/MetricCard";
import {
  ChartCard,
  SectionHeader,
  ProgressBar,
  StatusBadge,
  SkeletonCard,
  EmptyState,
} from "../components/shared/SharedComponents";
import type { DashboardMetrics, UserDirectoryEntry } from "../types/admin.types";

interface DashboardTabProps {
  metrics: DashboardMetrics | null;
  recentUsers: UserDirectoryEntry[];
  isLoading: boolean;
  isDark: boolean;
}

export function DashboardTab({ metrics, recentUsers, isLoading, isDark }: DashboardTabProps) {
  const [sortBy, setSortBy] = useState("recent_login");
  const cardBg = isDark 
    ? "bg-[#1C1C1E]/80 border-white/5 backdrop-blur-2xl shadow-[0_4px_20px_rgb(0,0,0,0.3)]" 
    : "bg-white/80 border-slate-200/50 backdrop-blur-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]";
  const subColor = isDark ? "text-white/50" : "text-slate-500";
  const textColor = isDark ? "text-white" : "text-black";
  const divider = isDark ? "divide-white/5" : "divide-slate-200/50";
  const rowHover = isDark ? "hover:bg-white/5" : "hover:bg-slate-100/50";

  const totalPlatform = (metrics?.androidCount || 0) + (metrics?.webCount || 0) + (metrics?.iosCount || 0);

  const sortedUsers = useMemo(() => {
    const list = [...recentUsers];
    list.sort((a, b) => {
      if (sortBy === "name") return a.displayName.localeCompare(b.displayName);
      if (sortBy === "transactions") return (b.stats?.transactionCount || 0) - (a.stats?.transactionCount || 0);
      return new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime();
    });
    return list;
  }, [recentUsers, sortBy]);

  const activityData = useMemo(() => {
    // Group recent logins by day for the chart
    const groups: Record<string, number> = {};
    recentUsers.forEach(u => {
      const date = new Date(u.lastLoginAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      groups[date] = (groups[date] || 0) + 1;
    });
    // Create an array and sort by date chronologically
    return Object.entries(groups)
      .map(([date, count]) => ({ date, logins: count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  }, [recentUsers]);

  return (
    <div className="space-y-5">
      {/* KPI Row 1 — Primary Metrics */}
      <div>
        <SectionHeader
          title="Overview"
          subtitle="Live telemetry from Firestore"
          isDark={isDark}
        />
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Total Users"
            value={metrics?.totalUsers ?? 0}
            color="emerald"
            icon="👤"
            isLoading={isLoading}
            isDark={isDark}
          />
          <MetricCard
            label="Logged In Today"
            value={metrics?.activeToday ?? 0}
            color="blue"
            icon="⚡"
            isLoading={isLoading}
            isDark={isDark}
          />
          <MetricCard
            label="Open Tickets"
            value={metrics?.openTickets ?? 0}
            color={metrics?.openTickets ? "red" : "slate"}
            icon="🎫"
            isLoading={isLoading}
            isDark={isDark}
          />
          <MetricCard
            label="Admin Roles"
            value={metrics?.adminRolesCount ?? 0}
            color="purple"
            icon="🔐"
            isLoading={isLoading}
            isDark={isDark}
          />
        </div>
      </div>

      {/* KPI Row 2 — Sync Status */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Cloud Synced"
          value={metrics?.syncedCloud ?? 0}
          color="blue"
          icon="☁️"
          isLoading={isLoading}
          isDark={isDark}
        />
        <MetricCard
          label="Offline Devices"
          value={metrics?.offlineLocal ?? 0}
          color="amber"
          icon="📱"
          isLoading={isLoading}
          isDark={isDark}
        />
      </div>

      {/* v1.0.0 Adoption */}
      {isLoading ? (
        <SkeletonCard isDark={isDark} lines={2} />
      ) : (
        <ChartCard
          title="Version Adoption"
          subtitle="v1.0.0 rollout coverage"
          isDark={isDark}
        >
          <div className="space-y-3">
            <ProgressBar
              label="v1.0.0"
              value={metrics?.v100AdoptionPercent ?? 0}
              count={metrics?.totalUsers ?? 0}
              color="bg-emerald-500"
              isDark={isDark}
            />
          </div>
          <div className={`mt-4 pt-4 border-t ${divider} flex items-center justify-between`}>
            <span className={`text-xs ${subColor}`}>v1.0.0 adoption rate</span>
            <span className="text-sm font-black text-emerald-500">{metrics?.v100AdoptionPercent ?? 0}%</span>
          </div>
        </ChartCard>
      )}

      {/* Platform Breakdown */}
      {isLoading ? (
        <SkeletonCard isDark={isDark} lines={3} />
      ) : (
        <ChartCard title="Platform Distribution" subtitle="Users by device" isDark={isDark}>
          <div className="space-y-3">
            <ProgressBar
              label="Android"
              value={totalPlatform > 0 ? Math.round(((metrics?.androidCount ?? 0) / totalPlatform) * 100) : 0}
              count={metrics?.androidCount ?? 0}
              color="bg-emerald-500"
              isDark={isDark}
            />
            <ProgressBar
              label="Web"
              value={totalPlatform > 0 ? Math.round(((metrics?.webCount ?? 0) / totalPlatform) * 100) : 0}
              count={metrics?.webCount ?? 0}
              color="bg-blue-500"
              isDark={isDark}
            />
            <ProgressBar
              label="iOS"
              value={totalPlatform > 0 ? Math.round(((metrics?.iosCount ?? 0) / totalPlatform) * 100) : 0}
              count={metrics?.iosCount ?? 0}
              color="bg-purple-500"
              isDark={isDark}
            />
          </div>
        </ChartCard>
      )}

      {/* User Activity Graph */}
      {!isLoading && activityData.length > 0 && (
        <ChartCard title="User Activity" subtitle="Logins over the last active days" isDark={isDark}>
          <div className="h-48 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <XAxis dataKey="date" stroke={isDark ? "#ffffff50" : "#64748b"} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1C1C1E' : '#ffffff', 
                    borderRadius: '16px', 
                    border: 'none',
                    boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.1)'
                  }} 
                  itemStyle={{ color: isDark ? '#fff' : '#000', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="logins" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* Recent User Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionHeader
            title="Recent Activity"
            subtitle={`${recentUsers.length} users tracked`}
            isDark={isDark}
          />
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`appearance-none rounded-xl px-3 py-1.5 pr-8 text-xs font-bold outline-none cursor-pointer transition-colors border ${
                isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-200 text-black"
              }`}
            >
              <option value="recent_login">Recent Login</option>
              <option value="name">Name (A-Z)</option>
              <option value="transactions">Transactions</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <svg className={`w-3 h-3 ${isDark ? "text-white/50" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
        {isLoading ? (
          <SkeletonCard isDark={isDark} lines={4} />
        ) : recentUsers.length === 0 ? (
          <EmptyState
            title="No users yet"
            description="Users will appear once they log in"
            isDark={isDark}
          />
        ) : (
          <div className={`rounded-[28px] border ${cardBg} divide-y ${divider} overflow-hidden`}>
            {sortedUsers.slice(0, 8).map((user, idx) => (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, type: "spring", damping: 28, stiffness: 280 }}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${rowHover}`}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 bg-emerald-500/10 text-emerald-600"
                >
                  {user.displayName?.[0]?.toUpperCase() || "U"}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-black tracking-tight truncate ${textColor}`}>{user.displayName}</div>
                  <div className={`text-[11px] font-medium truncate mt-0.5 ${subColor}`}>{user.email}</div>
                  <div className={`flex items-center gap-2 mt-1`}>
                    <div className={`text-[9px] opacity-70 ${subColor}`}>
                      {new Date(user.lastLoginAt).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {(sortBy === "transactions") && (
                      <div className={`text-[9px] font-bold ${textColor}`}>
                        • {user.stats.transactionCount} transactions
                      </div>
                    )}
                  </div>
                </div>
                {/* Status + Platform */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <StatusBadge status={user.syncState} isDark={isDark} />
                  <span className={`text-[10px] ${subColor}`}>{user.platform}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
