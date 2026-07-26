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
    name: '🎨 Material Design (Material You)',
    subtitle: 'Google M3 | Primary: #16A34A (Light) / #4ADE80 (Dark) | Secondary: #2563EB / #60A5FA',
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
  'dark-theme': {
    id: 'dark-theme',
    name: '🌙 Dark Theme',
    subtitle: 'Bg: #121212 | Surface: #1E1E1E | Primary: #22C55E | Accent: #06B6D4',
    tag: 'OLED Obsidian',
    isDark: true,
    textColor: 'text-[#F8FAFC]',
    subtextColor: 'text-[#94A3B8]',
    bgClass: 'bg-[#121212]',
    cardBg: 'bg-[#1E1E1E] border-[#374151] rounded-[28px] text-[#F8FAFC]',
    accentGradient: 'from-[#22C55E] via-[#06B6D4] to-[#22C55E]',
    ringGradient: ['#22C55E', '#06B6D4', '#22C55E'],
    primaryColor: '#22C55E',
    secondaryColor: '#06B6D4',
    glowColor: 'rgba(34, 197, 94, 0.35)',
    swatchColors: ['#121212', '#22C55E', '#06B6D4'],
  },
  'light-theme': {
    id: 'light-theme',
    name: '☀️ Light Theme',
    subtitle: 'Bg: #F8FAFC | Surface: #FFFFFF | Primary: #16A34A | Accent: #3B82F6',
    tag: 'Clean & Bright',
    isDark: false,
    textColor: 'text-[#111827]',
    subtextColor: 'text-[#6B7280]',
    bgClass: 'bg-[#F8FAFC]',
    cardBg: 'bg-white border-slate-200 shadow-md text-[#111827] rounded-[28px]',
    accentGradient: 'from-[#16A34A] via-[#3B82F6] to-[#22C55E]',
    ringGradient: ['#16A34A', '#3B82F6', '#22C55E'],
    primaryColor: '#16A34A',
    secondaryColor: '#3B82F6',
    glowColor: 'rgba(22, 163, 74, 0.25)',
    swatchColors: ['#F8FAFC', '#16A34A', '#3B82F6'],
  },
  'glassmorphism': {
    id: 'glassmorphism',
    name: '💎 Glassmorphism',
    subtitle: 'Bg: #E0F2FE | Glass: rgba(255,255,255,0.4) | Primary: #3B82F6',
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
    subtitle: 'Bg: #E0E5EC | Primary: #16A34A | Accent: #3B82F6 | Soft Shadows',
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
    subtitle: 'Bg: #FFFFFF | Primary: #16A34A | Accent: #F59E0B | High Whitespace',
    tag: 'Clean Minimal',
    isDark: false,
    textColor: 'text-[#111827]',
    subtextColor: 'text-[#6B7280]',
    bgClass: 'bg-[#FFFFFF]',
    cardBg: 'bg-white border-slate-200/80 shadow-sm text-[#111827] rounded-[28px]',
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
    subtitle: 'Bg: #F8FAFC | Gradient: #16A34A → #3B82F6 | Accent: #06B6D4',
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
  'cyber-neon': {
    id: 'cyber-neon',
    name: '⚡ Cyber Neon',
    subtitle: 'Futuristic Dark Void & Radiant Neon',
    tag: 'Default Signature',
    isDark: true,
    textColor: 'text-white',
    subtextColor: 'text-white/60',
    bgClass: 'bg-gradient-to-b from-[#0B0914] via-[#120E29] to-[#0B0914]',
    cardBg: 'bg-white/5 border-white/10 text-white rounded-[28px]',
    accentGradient: 'from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D]',
    ringGradient: ['#7B61FF', '#00E5FF', '#FF4D8D'],
    primaryColor: '#7B61FF',
    secondaryColor: '#FF4D8D',
    glowColor: 'rgba(123, 97, 255, 0.4)',
    swatchColors: ['#0B0914', '#7B61FF', '#FF4D8D'],
  },
};

/**
 * Returns dynamic Material Design 3 theme tokens based on active theme and colorMode ('dark' | 'light')
 */
export function getActiveThemeConfig(theme: AppTheme, colorMode: 'dark' | 'light'): ThemeConfig {
  const base = themeMap[theme] || themeMap['material-design'];

  if (theme === 'material-design') {
    if (colorMode === 'dark') {
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
      };
    }
  }

  // Handle colorMode === 'dark' overrides for other themes if requested
  if (colorMode === 'dark' && !base.isDark) {
    return {
      ...base,
      isDark: true,
      bgClass: 'bg-[#121212]',
      cardBg: 'bg-[#1E1E1E] border-[#374151] rounded-[28px] shadow-lg text-[#F8FAFC]',
      textColor: 'text-[#F8FAFC]',
      subtextColor: 'text-[#94A3B8]',
    };
  }

  return base;
}
