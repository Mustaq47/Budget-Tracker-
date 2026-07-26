---
name: desings
description: Master UI/UX & Visual Design Skill synthesizing Apple Design principles, Anti-Slop Frontend Taste, High-End Agency Visual Standards, 花叔 (Huashu) High-Fidelity Prototyping, Motion Animation Discovery, Project Redesigns, Stitch Design Systems, Android/Mobile UI, and 7 Core Theme Paradigms (Dark, Light, Material, Glassmorphism, Neumorphism, Minimalist, Gradient).
---

# 🎨 DESINGS — Master UI/UX & Visual Design System

The definitive, anti-generic design skill for building state-of-the-art web and mobile interfaces. Combines 7 core visual themes, Apple's physical motion, agency-grade typography, non-templated color theory, micro-animations, and mobile-native responsiveness.

---

## 🎨 7 Core Design & Theme Paradigms

1. 🌙 **Dark Theme** — Pure OLED/Obsidian black backgrounds (`#000000`) paired with high-contrast, bright vibrant accents (`#00E5FF`, `#FF4D8D`).
2. ☀️ **Light Theme** — Clean white/off-white interface (`#FFFFFF`, `#F8F9FA`) with soft pastel borders, dark slate typography (`#0F172A`), and pleasant accent highlights.
3. 🎨 **Material Design** — Google's modern M3 design language with elevated surface containers (`rounded-[28px]`), tonal color palettes, and crisp ripple feedback.
4. 💎 **Glassmorphism** — High-end frosted glass effects with heavy backdrop blur (`backdrop-blur-3xl`), semi-transparent white fills (`bg-white/10`), and subtle light-reflecting borders (`border-white/15`).
5. 🟢 **Neumorphism** — Soft tactile embossed UI elements using dual light/dark extruded shadows (`shadow-[6px_6px_14px_rgba(0,0,0,0.5),-6px_-6px_14px_rgba(255,255,255,0.05)]`).
6. 📱 **Minimalist Theme** — Spacious, clutter-free layouts with broad typography scale, generous breathing whitespace, and warm editorial monochrome tones (`#0F0E13` charcoal, `#F4E8D1` champagne).
7. 🌈 **Gradient Theme** — Vibrant multi-stop color spectrums (`from-[#FF4D8D] via-[#7B61FF] to-[#00E5FF]`) for buttons, progress rings, and animated background halos.

---

## 1. Core Visual Principles & Aesthetic Guardrails

### 🚫 The "Anti-Slop" Bans (What NEVER to do)
- **NO Generic Default Gradients**: Ban standard `from-purple-500 to-pink-500` or saturated primary RGB blue/red/green.
- **NO Harsh Heavy Shadows**: Avoid ugly `shadow-2xl` or uncalibrated black drop shadows.
- **NO Thick Borders**: Ban solid `border-2` or high-contrast box outlines. Use `border-white/10` or subtle HSL calibrated strokes.
- **NO Cards-Inside-Cards Nesting**: Maximize breathing room; avoid 4-level deep container boxes.
- **NO Static Layouts**: Every button, input, and interactive element MUST have spring physics or smooth transitions (`transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`).

---

## 2. Integrated Framework Foundations

### 🍏 Apple Interface & Fluid Motion Philosophy
- **Translucent Materials & Depth**: Use frosted glassmorphic layers (`backdrop-blur-3xl`, `bg-white/10` to `bg-white/5`).
- **Interruptible Spring Physics**: Motion must feel physical, smooth, and natural (Framer Motion `type: "spring"`, `damping: 28`, `stiffness: 280`).
- **Optical Typography**: High-contrast, broad editorial font hierarchy with tight tracking (`tracking-tighter` on headings, `tracking-tight` on body).

### ✨ High-End Visual Agency Standards
- **Warm Minimalist Palette**: Deep cosmic charcoal/obsidian backgrounds (`#0B0914`, `#0E0E12`, `#000000`) paired with curated neon, champagne gold, or emerald quartz accents.
- **Asymmetric Bento Grids**: Layouts should leverage functional bento grid blocks with generous internal padding (`p-6` to `p-8`) and large corner radii (`rounded-3xl` or `rounded-[48px]`).

### 🌸 花叔 (Huashu) High-Fidelity Prototyping & Review
- **Interactive Prototyping**: Build production-grade HTML/React mockups with immediate interactive states.
- **Design Direction Choice**: Offer distinct aesthetic options (Cyber Neon, Midnight OLED, Champagne Luxury, Emerald Quartz, Industrial Tactical).

### 🎬 Animation & Motion Opportunities
- **Perpetual Ambient Glows**: Pulse ambient radial glows (`animate-pulse` or infinite spring scale) behind primary CTA cards and circular progress rings.
- **Micro-Interactions**: Hover scale (`whileHover={{ scale: 1.02 }}`), tap compression (`whileTap={{ scale: 0.98 }}`), and spring entry transitions (`y: 20` -> `y: 0`).

### 📱 Android & Mobile Responsiveness
- **Touch Targets**: Minimum 44px (11rem/3) touch areas for all touchable buttons.
- **Bottom Sheet Modals**: Mobile-first bottom drag sheets (`max-h-[85vh]`, top drag handle bar `w-12 h-1.5 rounded-full bg-white/20`, slide-up spring animation).
- **Navigation Hiding**: Hiding / dropping bottom navigation bar off-screen (`y: 180`) when modals or action sheets are open.

---

## 3. Workflow for UI Tasks & Redesigns

1. **Audit & Plan**: Identify hardcoded values, generic colors, static buttons, and missing micro-animations.
2. **Apply Theme Palette**: Select or apply the active HSL/Hex theme tokens across background gradients, borders, and text labels.
3. **Elevate Components**: Upgrade plain divs into glass cards with gradient stroke borders, ambient blur glows, and spring-animated entry.
4. **Verify Motion & Accessibility**: Ensure smooth 60fps hardware-accelerated transitions and legible contrast ratios across all screen sizes.
