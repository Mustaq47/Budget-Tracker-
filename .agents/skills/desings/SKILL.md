---
name: desings
description: Master UI/UX & Visual Design Skill synthesizing Apple Design principles, Anti-Slop Frontend Taste, High-End Agency Visual Standards, 花叔 (Huashu) High-Fidelity Prototyping, Motion Animation Discovery, Project Redesigns, Stitch Design Systems, Android/Mobile UI, and 7 Core Theme Paradigms with calibrated color palettes.
---

# 🎨 DESINGS — Master UI/UX & Visual Design System

The definitive, anti-generic design skill for building state-of-the-art web and mobile interfaces. Combines 7 core visual themes, exact color palettes, Apple's physical motion, agency-grade typography, micro-animations, and mobile-native responsiveness.

---

## 🎨 7 Core Design & Theme Paradigms with Exact Color Palettes

| Theme | Description | Recommended Color Palette |
| --- | --- | --- |
| 🌙 **Dark Theme** ⭐ | Elegant, modern, and easy on the eyes. Great for users who prefer dark mode. | **Background:** `#121212`<br>**Surface:** `#1E1E1E`<br>**Primary:** `#22C55E` (Green)<br>**Accent:** `#06B6D4` (Cyan)<br>**Income:** `#22C55E`<br>**Expense:** `#EF4444`<br>**Text:** `#FFFFFF` |
| ☀️ **Light Theme** ⭐ | Clean, bright, and ideal for finance apps. | **Background:** `#F8FAFC`<br>**Surface:** `#FFFFFF`<br>**Primary:** `#16A34A`<br>**Accent:** `#3B82F6`<br>**Income:** `#22C55E`<br>**Expense:** `#EF4444`<br>**Text:** `#111827` |
| 🎨 **Material Design** ⭐ | Google's modern design system with clear navigation and components. | **Primary:** `#16A34A`<br>**Secondary:** `#4CAF50`<br>**Accent:** `#FFC107`<br>**Background:** `#F5F5F5`<br>**Surface:** `#FFFFFF`<br>**Text:** `#212121` |
| 💎 **Glassmorphism** | Frosted glass cards with blurred backgrounds for a premium look. | **Background:** `#E0F2FE`<br>**Glass:** `rgba(255,255,255,0.25)`<br>**Primary:** `#3B82F6`<br>**Accent:** `#22C55E`<br>**Text:** `#111827` |
| 🟢 **Neumorphism** | Soft shadows and rounded elements for a smooth, modern interface. | **Background:** `#E0E5EC`<br>**Primary:** `#16A34A`<br>**Accent:** `#3B82F6`<br>**Text:** `#374151` |
| 📱 **Minimalist Theme** ⭐ | Simple, clutter-free design focused on usability. | **Background:** `#FFFFFF`<br>**Primary:** `#16A34A`<br>**Accent:** `#F59E0B`<br>**Text:** `#111827`<br>**Secondary Text:** `#6B7280` |
| 🌈 **Gradient Theme** | Modern gradients with vibrant colors that add visual appeal. | **Gradient:** `#16A34A → #3B82F6`<br>**Accent:** `#06B6D4`<br>**Background:** `#F8FAFC`<br>**Text:** `#111827` |

---

## 1. Core Visual Principles & Aesthetic Guardrails

### 🚫 The "Anti-Slop" Bans (What NEVER to do)
- **NO Generic Default Gradients**: Ban uncalibrated RGB blue/red/green gradients. Use specified theme palette tokens.
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
- **Warm Minimalist Palette**: Deep cosmic charcoal/obsidian backgrounds (`#121212`, `#0E0E12`, `#000000`) paired with curated green, cyan, or champagne gold accents.
- **Asymmetric Bento Grids**: Layouts should leverage functional bento grid blocks with generous internal padding (`p-6` to `p-8`) and large corner radii (`rounded-3xl` or `rounded-[48px]`).

### 🌸 花叔 (Huashu) High-Fidelity Prototyping & Review
- **Interactive Prototyping**: Build production-grade HTML/React mockups with immediate interactive states.
- **Design Direction Choice**: Offer distinct aesthetic options (Dark Theme, Light Theme, Material Design, Glassmorphism, Neumorphism, Minimalist, Gradient).

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
