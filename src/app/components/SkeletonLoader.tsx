import React from "react";

export type SkeletonVariant = "card" | "listItem" | "text" | "avatar" | "chart";

interface Props {
  variant?: SkeletonVariant;
  className?: string;
  count?: number;
}

/**
 * SkeletonLoader — Material Design 3 Shimmer Loading Component
 * Adheres to /desings Phase 3 Stability and prefers-reduced-motion accessibility standards.
 */
export function SkeletonLoader({ variant = "card", className = "", count = 1 }: Props) {
  const baseShimmerClass =
    "bg-slate-200/80 dark:bg-white/10 rounded-2xl animate-pulse motion-reduce:animate-none motion-reduce:opacity-75";

  const renderSingleSkeleton = (index: number) => {
    switch (variant) {
      case "listItem":
        return (
          <div
            key={index}
            className={`w-full p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/50 dark:bg-white/5 flex items-center justify-between gap-4 ${className}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl ${baseShimmerClass}`} />
              <div className="space-y-2">
                <div className={`w-28 h-4 ${baseShimmerClass}`} />
                <div className={`w-16 h-3 ${baseShimmerClass}`} />
              </div>
            </div>
            <div className={`w-16 h-5 ${baseShimmerClass}`} />
          </div>
        );

      case "avatar":
        return (
          <div
            key={index}
            className={`w-10 h-10 rounded-full ${baseShimmerClass} ${className}`}
          />
        );

      case "text":
        return (
          <div
            key={index}
            className={`w-full h-4 rounded-lg ${baseShimmerClass} ${className}`}
          />
        );

      case "chart":
        return (
          <div
            key={index}
            className={`w-full h-48 p-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-100/50 dark:bg-white/5 flex items-end justify-between gap-2 ${className}`}
          >
            {[40, 70, 50, 90, 60, 85, 65].map((height, i) => (
              <div
                key={i}
                className={`w-full rounded-t-xl ${baseShimmerClass}`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        );

      case "card":
      default:
        return (
          <div
            key={index}
            className={`w-full p-5 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-100/50 dark:bg-white/5 space-y-3 ${className}`}
          >
            <div className="flex justify-between items-center">
              <div className={`w-24 h-4 ${baseShimmerClass}`} />
              <div className={`w-8 h-8 rounded-full ${baseShimmerClass}`} />
            </div>
            <div className={`w-36 h-8 ${baseShimmerClass}`} />
            <div className={`w-20 h-3 ${baseShimmerClass}`} />
          </div>
        );
    }
  };

  if (count > 1) {
    return (
      <div className="space-y-3 w-full">
        {Array.from({ length: count }).map((_, i) => renderSingleSkeleton(i))}
      </div>
    );
  }

  return renderSingleSkeleton(0);
}
