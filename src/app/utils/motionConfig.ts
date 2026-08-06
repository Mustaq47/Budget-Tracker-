import { useState, useEffect } from "react";
import type { Variants, Transition } from "motion/react";

/**
 * motionConfig.ts — 60 FPS GPU-Accelerated Animation & Accessibility Design System
 * Enforces Apple-style physical spring physics, zero layout thrashing,
 * and WCAG-compliant prefers-reduced-motion fallback behavior.
 */

// ─── 1. STANDARD SPRING & EASING CURVES (60 FPS GPU-Optimized) ───
export const SPRING_PHYSICS: Transition = {
  type: "spring",
  damping: 26,
  stiffness: 320,
};

export const FAST_SPRING: Transition = {
  type: "spring",
  damping: 24,
  stiffness: 380,
};

export const SMOOTH_EASE: Transition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1], // Apple-style cubic-bezier ease-in-out
};

// ─── 2. REUSABLE GPU-ONLY ANIMATION VARIANTS ───
export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: "easeIn" } },
};

export const modalContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_PHYSICS,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: SMOOTH_EASE,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const cardHoverVariants: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.015,
    y: -2,
    transition: FAST_SPRING,
  },
  tap: {
    scale: 0.985,
    transition: { duration: 0.1 },
  },
};

export const navIndicatorTransition: Transition = {
  type: "spring",
  damping: 25,
  stiffness: 320,
};

// ─── 3. PREFERS-REDUCED-MOTION ACCESSIBILITY HOOK ───
/**
 * Returns true if the user's OS or browser has enabled Reduced Motion.
 * Can be used to conditionally disable scale/translate animations.
 */
export function useAccessibleAnimation(): boolean {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}

/**
 * Helper to get accessible modal content variants.
 * Falls back to pure opacity if reduced motion is requested.
 */
export function getAccessibleModalVariants(isReduced: boolean): Variants {
  if (isReduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.15 } },
      exit: { opacity: 0, transition: { duration: 0.1 } },
    };
  }
  return modalContentVariants;
}
