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
  'cyber-neon': {
    id: 'cyber-neon',
    name: 'Cyber Neon Glass',
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
  'midnight-oled': {
    id: 'midnight-oled',
    name: 'Midnight OLED',
    subtitle: 'Pure Black & Translucent iOS Glass',
    tag: 'Apple Dark Minimal',
    bgClass: 'bg-black',
    cardBg: 'from-white/8 to-white/3',
    accentGradient: 'from-[#30D158] via-[#0A84FF] to-[#64D2FF]',
    ringGradient: ['#30D158', '#0A84FF', '#64D2FF'],
    primaryColor: '#30D158',
    secondaryColor: '#0A84FF',
    glowColor: 'rgba(48, 209, 88, 0.3)',
    swatchColors: ['#000000', '#30D158', '#0A84FF'],
  },
  'champagne-luxury': {
    id: 'champagne-luxury',
    name: 'Champagne Luxury',
    subtitle: 'Warm Charcoal & Silk Gold Editorial',
    tag: 'Haute Fashion',
    bgClass: 'bg-gradient-to-b from-[#0E0E12] via-[#1A1820] to-[#0E0E12]',
    cardBg: 'from-[#F4E8D1]/15 to-[#F4E8D1]/5',
    accentGradient: 'from-[#F4E8D1] via-[#E2B380] to-[#D4AF37]',
    ringGradient: ['#F4E8D1', '#E2B380', '#D4AF37'],
    primaryColor: '#F4E8D1',
    secondaryColor: '#E2B380',
    glowColor: 'rgba(244, 232, 209, 0.35)',
    swatchColors: ['#0E0E12', '#F4E8D1', '#D4AF37'],
  },
  'emerald-quartz': {
    id: 'emerald-quartz',
    name: 'Emerald Quartz',
    subtitle: 'Deep Emerald Matrix & Mint Aqua Glow',
    tag: 'Luxe Organic Dark',
    bgClass: 'bg-gradient-to-b from-[#051412] via-[#0B2522] to-[#051412]',
    cardBg: 'from-[#00F5D4]/12 to-[#00F5D4]/4',
    accentGradient: 'from-[#00F5D4] via-[#10B981] to-[#7B2CBF]',
    ringGradient: ['#00F5D4', '#10B981', '#7B2CBF'],
    primaryColor: '#00F5D4',
    secondaryColor: '#10B981',
    glowColor: 'rgba(0, 245, 212, 0.35)',
    swatchColors: ['#051412', '#00F5D4', '#7B2CBF'],
  },
  'industrial-tactical': {
    id: 'industrial-tactical',
    name: 'Industrial Tactical',
    subtitle: 'Matte Obsidian & Electric Tactical Lime',
    tag: 'Swiss Brutalist',
    bgClass: 'bg-gradient-to-b from-[#121214] via-[#1A1A1E] to-[#121214]',
    cardBg: 'from-white/10 to-white/5 border-white/20',
    accentGradient: 'from-[#CCFF00] via-[#FFB703] to-[#FF0055]',
    ringGradient: ['#CCFF00', '#FFB703', '#FF0055'],
    primaryColor: '#CCFF00',
    secondaryColor: '#FFB703',
    glowColor: 'rgba(204, 255, 0, 0.4)',
    swatchColors: ['#121214', '#CCFF00', '#FF0055'],
  },
};
