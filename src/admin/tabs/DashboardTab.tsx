// Dashboard Tab — Overview KPI grid + recent logins + platform breakdown
// M3 Material Design tokens, spring animations, Stripe-style editorial cards

import React from "react";
import { motion } from "motion/react";
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
  const cardBg = isDark ? "bg-[#1E1E1E] border-[#374151]" : "bg-white border-[#E5E7EB]";
  const subColor = isDark ? "text-[#94A3B8]" : "text-[#6B7280]";
  const textColor = isDark ? "text-[#F8FAFC]" : "text-[#111827]";
  const divider = isDark ? "border-[#374151]" : "border-[#E5E7EB]";
  const rowHover = isDark ? "hover:bg-white/5" : "hover:bg-[#F8FAFC]";

  const totalPlatform = (metrics?.androidCount || 0) + (metrics?.webCount || 0) + (metrics?.iosCount || 0);

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
            label="Active Today"
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

      {/* KPI Row 2 — Cloud + Adoption */}
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
          label="Offline Local"
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

      {/* Recent User Activity */}
      <div>
        <SectionHeader
          title="Recent Activity"
          subtitle={`${recentUsers.length} users tracked`}
          isDark={isDark}
        />
        {isLoading ? (
          <SkeletonCard isDark={isDark} lines={4} />
        ) : recentUsers.length === 0 ? (
          <EmptyState
            title="No users yet"
            description="Users will appear once they log in"
            isDark={isDark}
          />
        ) : (
          <div className={`rounded-[20px] border ${cardBg} divide-y ${divider} overflow-hidden`}>
            {recentUsers.slice(0, 8).map((user, idx) => (
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
                  <div className={`text-xs font-bold truncate ${textColor}`}>{user.displayName}</div>
                  <div className={`text-[10px] truncate ${subColor}`}>{user.email}</div>
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
