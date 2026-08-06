import React, { useState } from "react";
import { User } from "lucide-react";

interface Props {
  src?: string | null;
  alt?: string;
  name?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

/**
 * SafeAvatar — Crash-Resistant User Profile Avatar
 * Gracefully falls back to gradient initials or User icon if the photoURL fails to load.
 * Adheres to Phase 3 Stability rules.
 */
export function SafeAvatar({
  src,
  alt = "User Avatar",
  name,
  className = "",
  size = "md",
}: Props) {
  const [hasError, setHasError] = useState(false);

  const sizeClass = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-20 h-20 text-2xl",
  }[size];

  const getInitials = (displayName?: string | null): string => {
    if (!displayName) return "";
    const parts = displayName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(name);
  const isGradient = src?.startsWith("linear-gradient");

  if (!src || hasError || isGradient) {
    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-extrabold tracking-tight select-none shrink-0 border border-white/10 shadow-lg overflow-hidden ${className}`}
        style={
          isGradient
            ? { background: src }
            : {
                background:
                  "linear-gradient(135deg, rgba(22, 163, 74, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)",
              }
        }
        aria-label={alt}
      >
        {initials && !isGradient ? (
          <span className="text-emerald-600 dark:text-emerald-400">
            {initials}
          </span>
        ) : (
          <User className="w-1/2 h-1/2 text-emerald-600 dark:text-emerald-400" />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      className={`${sizeClass} rounded-full object-cover border border-slate-200/80 dark:border-white/10 shrink-0 shadow-lg ${className}`}
      referrerPolicy="no-referrer"
    />
  );
}
