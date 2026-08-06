/**
 * formatters.ts — Standardized Number, Currency, and Date Formatting Helper
 * Eliminates duplicate toLocaleString() formatting calls across components.
 */

/**
 * Standard currency formatting with currency symbol and thousands separators.
 */
export function formatCurrency(
  amount: number,
  currencySymbol: string = "$"
): string {
  const num = Number(amount) || 0;
  return `${currencySymbol}${num.toLocaleString()}`;
}

/**
 * Standardized date parsing for ISO string dates (YYYY-MM-DD) avoiding UTC timezone shifts.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split("-").map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(dateStr);
}

/**
 * Formats ISO date string into human-readable label (e.g., "Today", "Yesterday", or "Jul 26").
 */
export function formatDateLabel(dateIso: string): string {
  if (!dateIso) return "";
  const now = new Date();
  const todayIso = now.toISOString().split("T")[0];
  if (dateIso === todayIso) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayIso = yesterday.toISOString().split("T")[0];
  if (dateIso === yesterdayIso) return "Yesterday";

  const d = parseLocalDate(dateIso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
