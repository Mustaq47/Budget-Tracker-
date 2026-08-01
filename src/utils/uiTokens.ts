/**
 * uiTokens.ts — Unified Material Design 3 & Apple Typography Design Tokens
 * Enforces Phase 9 UI Consistency across Home, Flow, Insights, Profile, and Modals.
 */

export const pageTitleClass = "text-2xl sm:text-3xl tracking-tighter mb-1 sm:mb-2 font-black capitalize";
export const pageSubtitleClass = "tracking-tight text-xs sm:text-sm";
export const sectionTitleClass = "tracking-tight font-bold text-sm mb-4";

export const incomeTextClass = "text-emerald-600 dark:text-emerald-400 font-extrabold tracking-tight";
export const expenseTextClass = "text-red-600 dark:text-red-400 font-extrabold tracking-tight";

export const dividerBorderClass = "border-slate-200/80 dark:border-white/10";

export const focusRingClass = "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:focus-visible:ring-emerald-400/50";
export const touchTargetClass = "min-h-[44px] min-w-[44px] flex items-center justify-center";

/**
 * Returns standardized classes for interactive list item cards (Transactions, Accounts, Goals).
 */
export function getListItemCardClass(isLight: boolean): string {
  return isLight
    ? "bg-slate-100/70 border border-slate-200/80 text-slate-900 shadow-sm"
    : "bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-md";
}

/**
 * Returns standardized classes for elevated container panels.
 */
export function getElevatedContainerClass(isLight: boolean): string {
  return isLight
    ? "bg-white/90 border border-slate-200 shadow-md text-slate-900"
    : "bg-white/5 border border-white/10 text-white shadow-xl";
}
