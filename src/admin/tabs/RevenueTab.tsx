// Revenue Tab — Placeholder zeros until revenue/ Firestore collection is seeded
// All source="no_data" values render "—" per MetricCard logic

import React from "react";
import { motion } from "motion/react";
import { DollarSign, TrendingUp, BarChart3, Globe, AlertCircle } from "lucide-react";
import { MetricCard } from "../components/shared/MetricCard";
import {
  ChartCard,
  SectionHeader,
  ProgressBar,
  NoDataBanner,
  SkeletonCard,
  EmptyState,
} from "../components/shared/SharedComponents";
import type { RevenueMetrics } from "../types/admin.types";

interface RevenueTabProps {
  revenue: RevenueMetrics | null;
  isLoading: boolean;
  isDark: boolean;
}

function fmtCurrency(value: number, currency = "USD"): string {
  if (value === 0) return "0";
  if (currency === "%") return `${value}%`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(2);
}

export function RevenueTab({ revenue, isLoading, isDark }: RevenueTabProps) {
  const isNoData = !revenue || (
    revenue.today.source === "no_data" &&
    revenue.thisMonth.source === "no_data"
  );

  const subColor = isDark ? "text-[#94A3B8]" : "text-[#6B7280]";
  const cardBg = isDark ? "bg-[#1E1E1E] border-[#374151]" : "bg-white border-[#E5E7EB]";
  const divider = isDark ? "divide-[#374151]" : "divide-[#E5E7EB]";
  const textColor = isDark ? "text-[#F8FAFC]" : "text-[#111827]";

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Revenue"
        subtitle="Subscription & lifetime purchase metrics"
        isDark={isDark}
      />

      {isNoData && !isLoading && (
        <NoDataBanner
          message="Revenue collection not yet seeded. Connect RevenueCat or Stripe to populate."
          isDark={isDark}
        />
      )}

      {/* Primary Revenue KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Today"
          value={revenue ? fmtCurrency(revenue.today.value) : "—"}
          source={revenue?.today.source}
          color="emerald"
          icon="💰"
          suffix={revenue?.today.currency !== "no_data" ? ` ${revenue?.today.currency}` : ""}
          isLoading={isLoading}
          isDark={isDark}
        />
        <MetricCard
          label="This Month"
          value={revenue ? fmtCurrency(revenue.thisMonth.value) : "—"}
          source={revenue?.thisMonth.source}
          color="blue"
          icon="📅"
          isLoading={isLoading}
          isDark={isDark}
        />
        <MetricCard
          label="This Year"
          value={revenue ? fmtCurrency(revenue.thisYear.value) : "—"}
          source={revenue?.thisYear.source}
          color="purple"
          icon="📈"
          isLoading={isLoading}
          isDark={isDark}
        />
        <MetricCard
          label="MRR"
          value={revenue ? fmtCurrency(revenue.mrr.value) : "—"}
          source={revenue?.mrr.source}
          color="amber"
          icon="🔄"
          isLoading={isLoading}
          isDark={isDark}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="ARR"
          value={revenue ? fmtCurrency(revenue.arr.value) : "—"}
          source={revenue?.arr.source}
          color="slate"
          icon="📊"
          isLoading={isLoading}
          isDark={isDark}
        />
        <MetricCard
          label="ARPU"
          value={revenue ? fmtCurrency(revenue.arpu.value) : "—"}
          source={revenue?.arpu.source}
          color="slate"
          icon="👤"
          isLoading={isLoading}
          isDark={isDark}
        />
        <MetricCard
          label="LTV"
          value={revenue ? fmtCurrency(revenue.ltv.value) : "—"}
          source={revenue?.ltv.source}
          color="emerald"
          icon="♾️"
          isLoading={isLoading}
          isDark={isDark}
        />
        <MetricCard
          label="Churn Rate"
          value={revenue ? `${revenue.churnRate.value}` : "—"}
          source={revenue?.churnRate.source}
          color={revenue?.churnRate.value && revenue.churnRate.value > 5 ? "red" : "slate"}
          suffix="%"
          icon="📉"
          isLoading={isLoading}
          isDark={isDark}
        />
      </div>

      {/* Subscription Stats */}
      {isLoading ? (
        <SkeletonCard isDark={isDark} lines={3} />
      ) : (
        <ChartCard
          title="Subscriptions"
          subtitle="Active subscriber breakdown"
          isDark={isDark}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-xs ${subColor}`}>Active Subscriptions</span>
              <span className={`text-sm font-black ${textColor}`}>{revenue?.activeSubscriptions ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs ${subColor}`}>Trial Users</span>
              <span className={`text-sm font-black ${textColor}`}>{revenue?.trialUsers ?? "—"}</span>
            </div>
            {isNoData && (
              <div className={`text-xs font-medium ${subColor} pt-2`}>
                Connect payment provider to see live data
              </div>
            )}
          </div>
        </ChartCard>
      )}

      {/* Platform Breakdown */}
      {isLoading ? (
        <SkeletonCard isDark={isDark} lines={3} />
      ) : (
        <ChartCard title="Revenue by Platform" subtitle="Split across Android, Web, iOS" isDark={isDark}>
          {!revenue || revenue.platformBreakdown.length === 0 ? (
            <div className={`text-xs ${subColor} py-4 text-center`}>No platform revenue data yet</div>
          ) : (
            <div className="space-y-3">
              {revenue.platformBreakdown.map((p) => (
                <ProgressBar
                  key={p.platform}
                  label={p.platform}
                  value={p.percent}
                  count={p.amount}
                  color={p.platform === "Android" ? "bg-emerald-500" : p.platform === "Web" ? "bg-blue-500" : "bg-purple-500"}
                  isDark={isDark}
                />
              ))}
            </div>
          )}
        </ChartCard>
      )}

      {/* Country Breakdown */}
      {isLoading ? (
        <SkeletonCard isDark={isDark} lines={4} />
      ) : (
        <ChartCard title="Revenue by Country" subtitle="Top markets" isDark={isDark}>
          {!revenue || revenue.countryBreakdown.length === 0 ? (
            <div className={`text-xs ${subColor} py-4 text-center`}>No country revenue data yet</div>
          ) : (
            <div className={`divide-y ${divider}`}>
              {revenue.countryBreakdown.slice(0, 8).map((c, idx) => (
                <div key={c.country} className="flex justify-between items-center py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black ${isDark ? "text-white/30" : "text-slate-300"}`}>
                      #{idx + 1}
                    </span>
                    <Globe className={`w-3.5 h-3.5 ${subColor}`} />
                    <span className={`text-xs font-bold ${isDark ? "text-[#F8FAFC]" : "text-[#111827]"}`}>{c.country}</span>
                  </div>
                  <span className="text-xs font-black text-emerald-500">
                    {fmtCurrency(c.amount, c.currency)} {c.currency}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      )}
    </div>
  );
}
