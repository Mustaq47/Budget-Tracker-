import {
  ShoppingBag,
  Coffee,
  Car,
  Home as HomeIcon,
  Heart,
  Zap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Tag,
  Sparkles,
  Bookmark,
  Gift,
  Wrench,
  Briefcase,
  LucideIcon,
} from "lucide-react";

export type GlowColor = "purple" | "blue" | "pink" | "gold";

export interface CategoryMeta {
  icon: LucideIcon;
  glow: GlowColor;
  color: string;
}

export const categoryColors: Record<string, string> = {
  Income: "#22C55E",
  Expense: "#EF4444",
  Savings: "#F59E0B",
  Investments: "#6366F1",
  Bills: "#F97316",
  Shopping: "#EC4899",
  Transport: "#06B6D4",
  Food: "#8B5CF6",
  Utilities: "#06B6D4",
  Health: "#EC4899",
  Other: "#64748B",
};

export const iconMap: Record<string, { icon: LucideIcon; glow: GlowColor }> = {
  Shopping: { icon: ShoppingBag, glow: "pink" },
  Food: { icon: Coffee, glow: "blue" },
  Transport: { icon: Car, glow: "gold" },
  Bills: { icon: HomeIcon, glow: "purple" },
  Utilities: { icon: Zap, glow: "blue" },
  Health: { icon: Heart, glow: "pink" },
  Income: { icon: TrendingUp, glow: "blue" },
  Expense: { icon: TrendingDown, glow: "pink" },
  Savings: { icon: PiggyBank, glow: "gold" },
  Other: { icon: DollarSign, glow: "purple" },
};

export const DEFAULT_CATEGORY_META: CategoryMeta = {
  icon: DollarSign,
  glow: "purple",
  color: "#64748B",
};

const CUSTOM_PALETTE = [
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#6366F1", // Indigo
];

const CUSTOM_ICONS: LucideIcon[] = [Tag, Sparkles, Bookmark, Gift, Wrench, Briefcase];
const CUSTOM_GLOWS: GlowColor[] = ["purple", "blue", "pink", "gold"];

function getHashIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

/**
 * Returns icon, glow color, and hex color for any transaction category.
 * Single source of truth across Flow, Home, Insights, and Modals.
 */
export function getCategoryMeta(category?: string): CategoryMeta {
  if (!category) return DEFAULT_CATEGORY_META;
  const mapped = iconMap[category];
  const knownColor = categoryColors[category];
  if (mapped) {
    return {
      icon: mapped.icon,
      glow: mapped.glow,
      color: knownColor || DEFAULT_CATEGORY_META.color,
    };
  }
  // Custom category: generate deterministic color, icon, and glow from string hash
  const color = knownColor || CUSTOM_PALETTE[getHashIndex(category, CUSTOM_PALETTE.length)];
  const icon = CUSTOM_ICONS[getHashIndex(category, CUSTOM_ICONS.length)];
  const glow = CUSTOM_GLOWS[getHashIndex(category, CUSTOM_GLOWS.length)];
  return {
    icon,
    glow,
    color,
  };
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Shopping",
  "Food",
  "Transport",
  "Bills",
  "Utilities",
  "Health",
];

export function getCombinedCategories(customCategories: string[] = []): string[] {
  const customFiltered = customCategories.filter(
    (c) => !DEFAULT_EXPENSE_CATEGORIES.includes(c) && c !== "Other"
  );
  return [...DEFAULT_EXPENSE_CATEGORIES, ...customFiltered, "Other"];
}

export const monthsOfYear = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
