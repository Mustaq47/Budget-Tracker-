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
    subtitle: 'Black backgrounds with bright cyan & pink accents',
    tag: 'OLED Obsidian',
    bgClass: 'bg-black',
    cardBg: 'from-white/10 to-white/5',
    accentGradient: 'from-[#00E5FF] via-[#7B61FF] to-[#FF4D8D]',
    ringGradient: ['#00E5FF', '#7B61FF', '#FF4D8D'],
    primaryColor: '#00E5FF',
    secondaryColor: '#FF4D8D',
    glowColor: 'rgba(0, 229, 255, 0.4)',
    swatchColors: ['#000000', '#00E5FF', '#FF4D8D'],
  },
  'light-theme': {
    id: 'light-theme',
    name: '☀️ Light Theme',
    subtitle: 'Clean white interface with soft pastel colors',
    tag: 'Pure & Crisp',
    bgClass: 'bg-gradient-to-b from-[#F8F9FA] via-[#E9ECEF] to-[#DEE2E6]',
    cardBg: 'from-white/80 to-white/60 border-slate-200 text-slate-900',
    accentGradient: 'from-[#3B82F6] via-[#10B981] to-[#6366F1]',
    ringGradient: ['#3B82F6', '#10B981', '#6366F1'],
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    swatchColors: ['#FFFFFF', '#3B82F6', '#10B981'],
  },
  'material-design': {
    id: 'material-design',
    name: '🎨 Material Design',
    subtitle: "Google's modern M3 container design language",
    tag: 'Google M3',
    bgClass: 'bg-[#1C1B1F]',
    cardBg: 'from-[#2B2930] to-[#211F26] border-[#49454F]',
    accentGradient: 'from-[#D0BCFF] via-[#CCC2DC] to-[#EFB8C8]',
    ringGradient: ['#D0BCFF', '#CCC2DC', '#EFB8C8'],
    primaryColor: '#D0BCFF',
    secondaryColor: '#EFB8C8',
    glowColor: 'rgba(208, 188, 255, 0.35)',
    swatchColors: ['#1C1B1F', '#D0BCFF', '#EFB8C8'],
  },
  'glassmorphism': {
    id: 'glassmorphism',
    name: '💎 Glassmorphism',
    subtitle: 'Frosted glass effect with blur & transparency',
    tag: 'Frosted Glass',
    bgClass: 'bg-gradient-to-b from-[#0B0914] via-[#120E29] to-[#0B0914]',
    cardBg: 'from-white/15 via-white/8 to-white/5 border-white/20 backdrop-blur-3xl',
    accentGradient: 'from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D]',
    ringGradient: ['#7B61FF', '#00E5FF', '#FF4D8D'],
    primaryColor: '#7B61FF',
    secondaryColor: '#00E5FF',
    glowColor: 'rgba(123, 97, 255, 0.5)',
    swatchColors: ['#0B0914', '#7B61FF', '#00E5FF'],
  },
  'neumorphism': {
    id: 'neumorphism',
    name: '🟢 Neumorphism',
    subtitle: 'Soft shadows & embossed tactile elements',
    tag: 'Soft Tactile',
    bgClass: 'bg-[#18181C]',
    cardBg: 'bg-[#18181C] shadow-[8px_8px_16px_#101013,-8px_-8px_16px_#202025] border-none',
    accentGradient: 'from-[#10B981] via-[#059669] to-[#047857]',
    ringGradient: ['#10B981', '#059669', '#047857'],
    primaryColor: '#10B981',
    secondaryColor: '#34D399',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    swatchColors: ['#18181C', '#10B981', '#34D399'],
  },
  'minimalist-theme': {
    id: 'minimalist-theme',
    name: '📱 Minimalist Theme',
    subtitle: 'Simple layouts with maximum breathing whitespace',
    tag: 'Warm Editorial',
    bgClass: 'bg-gradient-to-b from-[#0E0E12] via-[#1A1820] to-[#0E0E12]',
    cardBg: 'from-[#F4E8D1]/12 to-[#F4E8D1]/4 border-white/10',
    accentGradient: 'from-[#F4E8D1] via-[#E2B380] to-[#D4AF37]',
    ringGradient: ['#F4E8D1', '#E2B380', '#D4AF37'],
    primaryColor: '#F4E8D1',
    secondaryColor: '#E2B380',
    glowColor: 'rgba(244, 232, 209, 0.35)',
    swatchColors: ['#0E0E12', '#F4E8D1', '#D4AF37'],
  },
  'gradient-theme': {
    id: 'gradient-theme',
    name: '🌈 Gradient Theme',
    subtitle: 'Colorful multi-stop gradients for a vibrant look',
    tag: 'Vibrant Spectrum',
    bgClass: 'bg-gradient-to-b from-[#14061F] via-[#0B1536] to-[#14061F]',
    cardBg: 'from-white/15 via-[#FF4D8D]/10 to-white/5 border-white/20',
    accentGradient: 'from-[#FF4D8D] via-[#7B61FF] to-[#00E5FF]',
    ringGradient: ['#FF4D8D', '#7B61FF', '#00E5FF'],
    primaryColor: '#FF4D8D',
    secondaryColor: '#00E5FF',
    glowColor: 'rgba(255, 77, 141, 0.5)',
    swatchColors: ['#14061F', '#FF4D8D', '#00E5FF'],
  },
  'cyber-neon': {
    id: 'cyber-neon',
    name: '⚡ Cyber Neon',
    subtitle: 'Futuristic Dark Void & Radiant Neon',
    tag: 'Default Signature',
    bgClass: 'bg-gradient-to-b from-[#0B0914] via-[#120E29] to-[#0B0914]',
    cardBg: 'from-white/10 to-white/5',
    accentGradient: 'from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D]',
    ringGradient: ['#7B61FF', '#00E5FF', '#FF4D8D'],
    primaryColor: '#7B61FF',
    secondaryColor: '#FF4D8D',
    glowColor: 'rgba(123, 97, 255, 0.4)',
    swatchColors: ['#0B0914', '#7B61FF', '#FF4D8D'],
  },
};
