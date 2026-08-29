// Analytics Tab — DAU/WAU/MAU, Feature Usage, Theme, Auth Methods
// Derived from real Firestore users collection fields

import React from "react";
import { motion } from "motion/react";
import { MetricCard } from "../components/shared/MetricCard";
import {
  ChartCard,
  SectionHeader,
  ProgressBar,
  SkeletonCard,
  EmptyState,
} from "../components/shared/SharedComponents";
import type { AnalyticsSummary } from "../types/admin.types";

interface AnalyticsTabProps {
  analytics: AnalyticsSummary | null;
  isLoading: boolean;
  isDark: boolean;
}

const THEME_COLORS: Record<string, string> = {
  // Full IDs stored in Firestore
  "material-design": "bg-emerald-500",
  "glassmorphism": "bg-sky-400",
  "neumorphism": "bg-purple-400",
  "minimalist-theme": "bg-slate-400",
  // Short aliases (legacy)
  dark: "bg-slate-800",
  light: "bg-amber-400",
  material: "bg-emerald-500",
  glass: "bg-sky-400",
  neumorphism_short: "bg-purple-400",
  gradient: "bg-blue-500",
  minimal: "bg-slate-400",
  unknown: "bg-slate-300",
};

export function AnalyticsTab({ analytics, isLoading, isDark }: AnalyticsTabProps) {
  const subColor = isDark ? "text-white/50" : "text-slate-500";
  const textColor = isDark ? "text-white" : "text-black";
  const cardBg = isDark 
    ? "bg-[#1C1C1E]/80 border-white/5 backdrop-blur-2xl shadow-[0_4px_20px_rgb(0,0,0,0.3)]" 
    : "bg-white/80 border-slate-200/50 backdrop-blur-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]";

  const authTotal = analytics
    ? analytics.authMethods.google + analytics.authMethods.email + analytics.authMethods.phone
    : 0;

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Analytics"
        subtitle="Derived from live Firestore telemetry"
        isDark={isDark}
      />

      {/* Active Users — DAU/WAU/MAU */}
      <div className="grid grid-cols-3 gap-2">
        <MetricCard
          label="DAU"
          value={analytics?.activeUsers.dau ?? 0}
          color="emerald"
          icon="⚡"
          isLoading={isLoading}
          isDark={isDark}
          size="sm"
        />
        <MetricCard
          label="WAU"
          value={analytics?.activeUsers.wau ?? 0}
          color="blue"
          icon="📅"
          isLoading={isLoading}
          isDark={isDark}
          size="sm"
        />
        <MetricCard
          label="MAU"
          value={analytics?.activeUsers.mau ?? 0}
          color="purple"
          icon="🗓️"
          isLoading={isLoading}
          isDark={isDark}
          size="sm"
        />
      </div>

      {/* Retention + Session */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Retention"
          value={analytics?.activeUsers.retentionPercent ?? 0}
          suffix="%"
          color={
            analytics?.activeUsers.retentionPercent && analytics.activeUsers.retentionPercent >= 50
              ? "emerald"
              : "amber"
          }
          icon="🔁"
          isLoading={isLoading}
          isDark={isDark}
        />
        <MetricCard
          label="Avg Session"
          value={analytics?.activeUsers.avgSessionMinutes ?? 0}
          suffix=" min"
          color="slate"
          icon="⏱️"
          isLoading={isLoading}
          isDark={isDark}
        />
      </div>

      {/* Feature Usage */}
      {isLoading ? (
        <SkeletonCard isDark={isDark} lines={5} />
      ) : (
        <ChartCard
          title="Feature Usage"
          subtitle="Adoption across active users"
          isDark={isDark}
        >
          {!analytics || analytics.featureUsage.length === 0 ? (
            <div className={`text-xs ${subColor} py-4 text-center`}>
              No feature telemetry yet
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.featureUsage.map((f, i) => (
                <ProgressBar
                  key={f.feature}
                  label={f.feature}
                  value={f.percent}
                  count={f.usageCount}
                  color={
                    i === 0 ? "bg-emerald-500" :
                    i === 1 ? "bg-blue-500" :
                    i === 2 ? "bg-purple-500" :
                    i === 3 ? "bg-amber-500" :
                    "bg-slate-500"
                  }
                  isDark={isDark}
                />
              ))}
            </div>
          )}
        </ChartCard>
      )}

      {/* Theme Analytics */}
      {isLoading ? (
        <SkeletonCard isDark={isDark} lines={4} />
      ) : (
        <ChartCard
          title="Theme Popularity"
          subtitle="User theme preferences"
          isDark={isDark}
        >
          {!analytics || analytics.themeBreakdown.length === 0 ? (
            <div className={`text-xs ${subColor} py-4 text-center`}>
              No theme preferences recorded yet
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.themeBreakdown.slice(0, 6).map((t) => {
                const colorClass = THEME_COLORS[t.theme.toLowerCase()] || THEME_COLORS.unknown;
                return (
                  <ProgressBar
                    key={t.theme}
                    label={t.theme}
                    value={t.percent}
                    count={t.count}
                    color={colorClass}
                    isDark={isDark}
                  />
                );
              })}
            </div>
          )}
        </ChartCard>
      )}

      {/* Auth Methods */}
      {isLoading ? (
        <SkeletonCard isDark={isDark} lines={3} />
      ) : (
        <ChartCard
          title="Authentication Methods"
          subtitle="Login method distribution"
          isDark={isDark}
        >
          <div className="space-y-3">
            <ProgressBar
              label="Google"
              value={authTotal > 0 ? Math.round((analytics!.authMethods.google / authTotal) * 100) : 0}
              count={analytics?.authMethods.google ?? 0}
              color="bg-red-400"
              isDark={isDark}
            />
            <ProgressBar
              label="Email/Password"
              value={authTotal > 0 ? Math.round((analytics!.authMethods.email / authTotal) * 100) : 0}
              count={analytics?.authMethods.email ?? 0}
              color="bg-blue-500"
              isDark={isDark}
            />
            <ProgressBar
              label="Phone"
              value={authTotal > 0 ? Math.round((analytics!.authMethods.phone / authTotal) * 100) : 0}
              count={analytics?.authMethods.phone ?? 0}
              color="bg-emerald-500"
              isDark={isDark}
            />
          </div>
        </ChartCard>
      )}

      {/* Transaction Analytics */}
      {isLoading ? (
        <SkeletonCard isDark={isDark} lines={2} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Avg Expense"
            value={analytics?.avgExpensePerTransaction ?? 0}
            color="red"
            icon="💸"
            isLoading={isLoading}
            isDark={isDark}
          />
          <MetricCard
            label="Avg Income"
            value={analytics?.avgIncomePerTransaction ?? 0}
            color="emerald"
            icon="💵"
            isLoading={isLoading}
            isDark={isDark}
          />
        </div>
      )}

      {/* Top Platform */}
      {!isLoading && analytics && (
        <div className={`flex items-center gap-4 p-5 rounded-[24px] border ${cardBg}`}>
          <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center text-2xl">📱</div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${subColor}`}>Top Platform</p>
            <p className={`text-xl font-black tracking-tight ${textColor}`}>{analytics.topPlatform}</p>
          </div>
        </div>
      )}
    </div>
  );
}
