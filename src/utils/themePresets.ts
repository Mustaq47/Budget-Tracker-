import { AppTheme } from "../store/useBudgetStore";

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  subtitle: string;
  tag: string;
  isDark: boolean;
  textColor: string;
  subtextColor: string;
  bgClass: string;
  cardBg: string;
  accentGradient: string;
  ringGradient: [string, string, string];
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  swatchColors: [string, string, string];
}

export const themeMap: Record<AppTheme, ThemeConfig> = {
  'material-design': {
    id: 'material-design',
    name: '🎨 Material Design',
    subtitle: 'Google M3 | Primary Green & Blue accents',
    tag: 'Google M3',
    isDark: false,
    textColor: 'text-[#111827]',
    subtextColor: 'text-[#6B7280]',
    bgClass: 'bg-[#F8FAFC]',
    cardBg: 'bg-[#FFFFFF] border-[#E5E7EB] rounded-[28px] shadow-sm text-[#111827]',
    accentGradient: 'from-[#16A34A] via-[#2563EB] to-[#F59E0B]',
    ringGradient: ['#16A34A', '#2563EB', '#F59E0B'],
    primaryColor: '#16A34A',
    secondaryColor: '#2563EB',
    glowColor: 'rgba(22, 163, 74, 0.25)',
    swatchColors: ['#F8FAFC', '#16A34A', '#2563EB'],
  },
  'glassmorphism': {
    id: 'glassmorphism',
    name: '💎 Glassmorphism',
    subtitle: 'Frosted Glass look with soft blur & gradients',
    tag: 'Frosted Glass',
    isDark: false,
    textColor: 'text-[#111827]',
    subtextColor: 'text-slate-700',
    bgClass: 'bg-[#E0F2FE]',
    cardBg: 'bg-white/40 backdrop-blur-2xl border-white/60 shadow-xl text-[#111827] rounded-[28px]',
    accentGradient: 'from-[#3B82F6] via-[#60A5FA] to-[#22C55E]',
    ringGradient: ['#3B82F6', '#60A5FA', '#22C55E'],
    primaryColor: '#3B82F6',
    secondaryColor: '#22C55E',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    swatchColors: ['#E0F2FE', '#3B82F6', '#22C55E'],
  },
  'neumorphism': {
    id: 'neumorphism',
    name: '🟢 Neumorphism',
    subtitle: 'Soft extruded shadows & clean tactile surfaces',
    tag: 'Soft Tactile',
    isDark: false,
    textColor: 'text-[#374151]',
    subtextColor: 'text-slate-600',
    bgClass: 'bg-[#E0E5EC]',
    cardBg: 'bg-[#E0E5EC] shadow-[8px_8px_16px_#becaf3,-8px_-8px_16px_#ffffff] border-none text-[#374151] rounded-[28px]',
    accentGradient: 'from-[#16A34A] via-[#3B82F6] to-[#10B981]',
    ringGradient: ['#16A34A', '#3B82F6', '#10B981'],
    primaryColor: '#16A34A',
    secondaryColor: '#3B82F6',
    glowColor: 'rgba(22, 163, 74, 0.25)',
    swatchColors: ['#E0E5EC', '#16A34A', '#3B82F6'],
  },
  'minimalist-theme': {
    id: 'minimalist-theme',
    name: '📱 Minimalist Theme',
    subtitle: 'High whitespace, ultra-thin borders & simplicity',
    tag: 'Clean Minimal',
    isDark: false,
    textColor: 'text-[#111827]',
    subtextColor: 'text-[#6B7280]',
    bgClass: 'bg-[#FFFFFF]',
    cardBg: 'bg-white border border-slate-200/80 shadow-sm text-[#111827] rounded-[28px]',
    accentGradient: 'from-[#16A34A] via-[#F59E0B] to-[#16A34A]',
    ringGradient: ['#16A34A', '#F59E0B', '#16A34A'],
    primaryColor: '#16A34A',
    secondaryColor: '#F59E0B',
    glowColor: 'rgba(22, 163, 74, 0.2)',
    swatchColors: ['#FFFFFF', '#16A34A', '#F59E0B'],
  },
  'gradient-theme': {
    id: 'gradient-theme',
    name: '🌈 Gradient Theme',
    subtitle: 'Vibrant color gradients with premium depth',
    tag: 'Vibrant Gradient',
    isDark: false,
    textColor: 'text-[#111827]',
    subtextColor: 'text-[#6B7280]',
    bgClass: 'bg-[#F8FAFC]',
    cardBg: 'bg-white/90 border-slate-200 text-[#111827] shadow-md rounded-[28px]',
    accentGradient: 'from-[#16A34A] via-[#3B82F6] to-[#06B6D4]',
    ringGradient: ['#16A34A', '#3B82F6', '#06B6D4'],
    primaryColor: '#16A34A',
    secondaryColor: '#06B6D4',
    glowColor: 'rgba(22, 163, 74, 0.4)',
    swatchColors: ['#F8FAFC', '#16A34A', '#3B82F6'],
  },
};

/**
 * Returns dynamic theme tokens based on active theme and colorMode ('dark' | 'light')
 */
export function getActiveThemeConfig(theme: AppTheme, colorMode: 'dark' | 'light'): ThemeConfig {
  const base = themeMap[theme] || themeMap['material-design'];
  const isDark = colorMode === 'dark';

  if (theme === 'material-design') {
    if (isDark) {
      return {
        ...base,
        isDark: true,
        bgClass: 'bg-[#121212]',
        cardBg: 'bg-[#1E1E1E] border-[#374151] rounded-[28px] shadow-lg text-[#F8FAFC]',
        primaryColor: '#4ADE80',
        secondaryColor: '#60A5FA',
        accentGradient: 'from-[#4ADE80] via-[#60A5FA] to-[#FBBF24]',
        ringGradient: ['#4ADE80', '#60A5FA', '#FBBF24'],
        swatchColors: ['#121212', '#4ADE80', '#60A5FA'],
        textColor: 'text-[#F8FAFC]',
        subtextColor: 'text-[#94A3B8]',
        glowColor: 'rgba(74, 222, 128, 0.25)',
      };
    } else {
      return {
        ...base,
        isDark: false,
        bgClass: 'bg-[#F8FAFC]',
        cardBg: 'bg-[#FFFFFF] border-[#E5E7EB] rounded-[28px] shadow-sm text-[#111827]',
        primaryColor: '#16A34A',
        secondaryColor: '#2563EB',
        accentGradient: 'from-[#16A34A] via-[#2563EB] to-[#F59E0B]',
        ringGradient: ['#16A34A', '#2563EB', '#F59E0B'],
        swatchColors: ['#F8FAFC', '#16A34A', '#2563EB'],
        textColor: 'text-[#111827]',
        subtextColor: 'text-[#6B7280]',
        glowColor: 'rgba(22, 163, 74, 0.25)',
      };
    }
  }

  if (theme === 'glassmorphism') {
    if (isDark) {
      return {
        ...base,
        isDark: true,
        bgClass: 'bg-[#0A0E1A]',
        cardBg: 'bg-white/8 backdrop-blur-2xl border border-white/10 shadow-2xl text-white rounded-[28px]',
        primaryColor: '#60A5FA',
        secondaryColor: '#4ADE80',
        accentGradient: 'from-[#60A5FA] via-[#3B82F6] to-[#4ADE80]',
        ringGradient: ['#60A5FA', '#3B82F6', '#4ADE80'],
        swatchColors: ['#0A0E1A', '#60A5FA', '#4ADE80'],
        textColor: 'text-white',
        subtextColor: 'text-white/60',
        glowColor: 'rgba(96, 165, 250, 0.35)',
      };
    } else {
      return {
        ...base,
        isDark: false,
        bgClass: 'bg-[#E0F2FE]',
        cardBg: 'bg-white/40 backdrop-blur-2xl border border-white/60 shadow-xl text-[#111827] rounded-[28px]',
        primaryColor: '#3B82F6',
        secondaryColor: '#22C55E',
        accentGradient: 'from-[#3B82F6] via-[#60A5FA] to-[#22C55E]',
        ringGradient: ['#3B82F6', '#60A5FA', '#22C55E'],
        swatchColors: ['#E0F2FE', '#3B82F6', '#22C55E'],
        textColor: 'text-[#111827]',
        subtextColor: 'text-slate-700',
        glowColor: 'rgba(59, 130, 246, 0.35)',
      };
    }
  }

  if (theme === 'neumorphism') {
    if (isDark) {
      return {
        ...base,
        isDark: true,
        bgClass: 'bg-[#2D2D3A]',
        cardBg: 'bg-[#2D2D3A] shadow-[8px_8px_16px_#1c1c24,-8px_-8px_16px_#3e3e50] border-none text-[#F8FAFC] rounded-[28px]',
        primaryColor: '#4ADE80',
        secondaryColor: '#60A5FA',
        accentGradient: 'from-[#4ADE80] via-[#60A5FA] to-[#34D399]',
        ringGradient: ['#4ADE80', '#60A5FA', '#34D399'],
        swatchColors: ['#2D2D3A', '#4ADE80', '#60A5FA'],
        textColor: 'text-[#F8FAFC]',
        subtextColor: 'text-[#94A3B8]',
        glowColor: 'rgba(74, 222, 128, 0.25)',
      };
    } else {
      return {
        ...base,
        isDark: false,
        bgClass: 'bg-[#E0E5EC]',
        cardBg: 'bg-[#E0E5EC] shadow-[8px_8px_16px_#becaf3,-8px_-8px_16px_#ffffff] border-none text-[#374151] rounded-[28px]',
        primaryColor: '#16A34A',
        secondaryColor: '#3B82F6',
        accentGradient: 'from-[#16A34A] via-[#3B82F6] to-[#10B981]',
        ringGradient: ['#16A34A', '#3B82F6', '#10B981'],
        swatchColors: ['#E0E5EC', '#16A34A', '#3B82F6'],
        textColor: 'text-[#374151]',
        subtextColor: 'text-slate-600',
        glowColor: 'rgba(22, 163, 74, 0.25)',
      };
    }
  }

  if (theme === 'minimalist-theme') {
    if (isDark) {
      return {
        ...base,
        isDark: true,
        bgClass: 'bg-[#0F0F0F]',
        cardBg: 'bg-[#1A1A1A] border border-white/5 shadow-none text-[#F8FAFC] rounded-[28px]',
        primaryColor: '#4ADE80',
        secondaryColor: '#FBBF24',
        accentGradient: 'from-[#4ADE80] via-[#FBBF24] to-[#4ADE80]',
        ringGradient: ['#4ADE80', '#FBBF24', '#4ADE80'],
        swatchColors: ['#0F0F0F', '#4ADE80', '#FBBF24'],
        textColor: 'text-[#F8FAFC]',
        subtextColor: 'text-[#94A3B8]',
        glowColor: 'rgba(74, 222, 128, 0.2)',
      };
    } else {
      return {
        ...base,
        isDark: false,
        bgClass: 'bg-[#FFFFFF]',
        cardBg: 'bg-white border border-slate-200/80 shadow-sm text-[#111827] rounded-[28px]',
        primaryColor: '#16A34A',
        secondaryColor: '#F59E0B',
        accentGradient: 'from-[#16A34A] via-[#F59E0B] to-[#16A34A]',
        ringGradient: ['#16A34A', '#F59E0B', '#16A34A'],
        swatchColors: ['#FFFFFF', '#16A34A', '#F59E0B'],
        textColor: 'text-[#111827]',
        subtextColor: 'text-[#6B7280]',
        glowColor: 'rgba(22, 163, 74, 0.2)',
      };
    }
  }

  if (theme === 'gradient-theme') {
    if (isDark) {
      return {
        ...base,
        isDark: true,
        bgClass: 'bg-[#0B0B1A]',
        cardBg: 'bg-[#151528] border border-white/10 text-white rounded-[28px] shadow-lg shadow-[#06B6D4]/5',
        primaryColor: '#4ADE80',
        secondaryColor: '#06B6D4',
        accentGradient: 'from-[#4ADE80] via-[#60A5FA] to-[#06B6D4]',
        ringGradient: ['#4ADE80', '#60A5FA', '#06B6D4'],
        swatchColors: ['#0B0B1A', '#4ADE80', '#60A5FA'],
        textColor: 'text-white',
        subtextColor: 'text-white/60',
        glowColor: 'rgba(74, 222, 128, 0.4)',
      };
    } else {
      return {
        ...base,
        isDark: false,
        bgClass: 'bg-[#F8FAFC]',
        cardBg: 'bg-white/90 border border-slate-200 text-[#111827] shadow-md rounded-[28px]',
        primaryColor: '#16A34A',
        secondaryColor: '#06B6D4',
        accentGradient: 'from-[#16A34A] via-[#3B82F6] to-[#06B6D4]',
        ringGradient: ['#16A34A', '#3B82F6', '#06B6D4'],
        swatchColors: ['#F8FAFC', '#16A34A', '#3B82F6'],
        textColor: 'text-[#111827]',
        subtextColor: 'text-[#6B7280]',
        glowColor: 'rgba(22, 163, 74, 0.4)',
      };
    }
  }

  return base;
}
