import { AppTheme } from "../store/useBudgetStore";

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  subtitle: string;
  tag: string;
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
  'dark-theme': {
    id: 'dark-theme',
    name: '🌙 Dark Theme',
    subtitle: 'Bg: #121212 | Surface: #1E1E1E | Primary: #22C55E | Accent: #06B6D4',
    tag: 'OLED Obsidian',
    bgClass: 'bg-[#121212]',
    cardBg: 'bg-[#1E1E1E] border-white/10 text-white',
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
    bgClass: 'bg-[#F8FAFC]',
    cardBg: 'bg-white border-slate-200/80 shadow-sm text-[#111827]',
    accentGradient: 'from-[#16A34A] via-[#3B82F6] to-[#22C55E]',
    ringGradient: ['#16A34A', '#3B82F6', '#22C55E'],
    primaryColor: '#16A34A',
    secondaryColor: '#3B82F6',
    glowColor: 'rgba(22, 163, 74, 0.25)',
    swatchColors: ['#F8FAFC', '#16A34A', '#3B82F6'],
  },
  'material-design': {
    id: 'material-design',
    name: '🎨 Material Design',
    subtitle: 'Bg: #F5F5F5 | Surface: #FFFFFF | Primary: #16A34A | Accent: #FFC107',
    tag: 'Google M3',
    bgClass: 'bg-[#F5F5F5]',
    cardBg: 'bg-white border-slate-200 rounded-[28px] shadow-md text-[#212121]',
    accentGradient: 'from-[#16A34A] via-[#4CAF50] to-[#FFC107]',
    ringGradient: ['#16A34A', '#4CAF50', '#FFC107'],
    primaryColor: '#16A34A',
    secondaryColor: '#FFC107',
    glowColor: 'rgba(22, 163, 74, 0.3)',
    swatchColors: ['#F5F5F5', '#16A34A', '#FFC107'],
  },
  'glassmorphism': {
    id: 'glassmorphism',
    name: '💎 Glassmorphism',
    subtitle: 'Bg: #E0F2FE | Glass: rgba(255,255,255,0.25) | Primary: #3B82F6',
    tag: 'Frosted Glass',
    bgClass: 'bg-[#E0F2FE]',
    cardBg: 'bg-white/25 backdrop-blur-xl border-white/40 shadow-lg text-[#111827]',
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
    bgClass: 'bg-[#E0E5EC]',
    cardBg: 'bg-[#E0E5EC] shadow-[8px_8px_16px_#becaf3,-8px_-8px_16px_#ffffff] border-none text-[#374151]',
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
    bgClass: 'bg-[#FFFFFF]',
    cardBg: 'bg-white border-slate-100 shadow-sm text-[#111827]',
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
    bgClass: 'bg-[#F8FAFC]',
    cardBg: 'bg-gradient-to-br from-[#16A34A]/10 via-[#3B82F6]/10 to-white border-slate-200 text-[#111827]',
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
    bgClass: 'bg-gradient-to-b from-[#0B0914] via-[#120E29] to-[#0B0914]',
    cardBg: 'from-white/10 to-white/5 text-white',
    accentGradient: 'from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D]',
    ringGradient: ['#7B61FF', '#00E5FF', '#FF4D8D'],
    primaryColor: '#7B61FF',
    secondaryColor: '#FF4D8D',
    glowColor: 'rgba(123, 97, 255, 0.4)',
    swatchColors: ['#0B0914', '#7B61FF', '#FF4D8D'],
  },
};
