---
name: desings
description: Master UI/UX & Visual Design Skill synthesizing Apple Design principles, Anti-Slop Frontend Taste, High-End Agency Visual Standards, 花叔 (Huashu) High-Fidelity Prototyping, Motion Animation Discovery, Project Redesigns, Stitch Design Systems, Android/Mobile UI, and 7 Core Theme Paradigms with calibrated Material Design 3 (Material You) color palettes.
---

# 🎨 DESINGS — Master UI/UX & Visual Design System

The definitive, anti-generic design skill for building state-of-the-art web and mobile interfaces. Combines 7 core visual themes, Material Design 3 (Material You) tokens, Apple's physical motion, agency-grade typography, micro-animations, and mobile-native responsiveness.

---

## 🎨 Material Design 3 (Material You) Color Palette System

### 🎨 Material Design – Light Mode
| Element | Color Name | HEX Code |
| --- | --- | --- |
| **Primary** | Emerald Green | `#16A34A` |
| **On Primary** | White | `#FFFFFF` |
| **Primary Container** | Light Green | `#DCFCE7` |
| **Secondary** | Blue | `#2563EB` |
| **Secondary Container** | Light Blue | `#DBEAFE` |
| **Tertiary (Savings)** | Amber | `#F59E0B` |
| **Background** | Gray 50 | `#F8FAFC` |
| **Surface** | White | `#FFFFFF` |
| **Surface Variant** | Gray 100 | `#F1F5F9` |
| **Text (Primary)** | Gray 900 | `#111827` |
| **Text (Secondary)** | Gray 500 | `#6B7280` |
| **Divider** | Gray 200 | `#E5E7EB` |
| **Success (Income)** | Green | `#22C55E` |
| **Error (Expense)** | Red | `#EF4444` |
| **Warning** | Amber | `#F59E0B` |

### 🌙 Material Design – Dark Mode
| Element | Color Name | HEX Code |
| --- | --- | --- |
| **Primary** | Green | `#4ADE80` |
| **On Primary** | Dark Green | `#052E16` |
| **Primary Container** | Dark Green | `#14532D` |
| **Secondary** | Sky Blue | `#60A5FA` |
| **Secondary Container** | Navy | `#1E3A8A` |
| **Tertiary** | Gold | `#FBBF24` |
| **Background** | Dark Gray | `#121212` |
| **Surface** | Gray 900 | `#1E1E1E` |
| **Surface Variant** | Gray 800 | `#2D2D2D` |
| **Text (Primary)** | White | `#F8FAFC` |
| **Text (Secondary)** | Gray 400 | `#94A3B8` |
| **Divider** | Gray 700 | `#374151` |
| **Success (Income)** | Light Green | `#4ADE80` |
| **Error (Expense)** | Light Red | `#F87171` |
| **Warning** | Amber | `#FBBF24` |

### 📊 Category Colors Map
| Category | Color Name | HEX Code |
| --- | --- | --- |
| **Income** | Green | `#22C55E` |
| **Expense** | Red | `#EF4444` |
| **Savings** | Amber | `#F59E0B` |
| **Investments** | Indigo | `#6366F1` |
| **Bills** | Orange | `#F97316` |
| **Shopping** | Pink | `#EC4899` |
| **Transport** | Cyan | `#06B6D4` |
| **Food** | Violet | `#8B5CF6` |

---

## 🎨 Additional 6 Theme Paradigms

1. 🌙 **Dark Theme** — `#121212` background, `#1E1E1E` surface, `#22C55E` green primary, `#06B6D4` cyan accent, `#FFFFFF` text.
2. ☀️ **Light Theme** — `#F8FAFC` background, `#FFFFFF` surface, `#16A34A` primary, `#3B82F6` blue accent, `#111827` text.
3. 💎 **Glassmorphism** — `#E0F2FE` background, `rgba(255,255,255,0.4)` frosted glass, `#3B82F6` blue primary, `#22C55E` accent.
4. 🟢 **Neumorphism** — `#E0E5EC` background with soft dual extruded shadows, `#16A34A` primary, `#3B82F6` accent.
5. 📱 **Minimalist Theme** — `#FFFFFF` clean background, `#16A34A` primary, `#F59E0B` amber accent, high breathing whitespace.
6. 🌈 **Gradient Theme** — `#F8FAFC` background, `#16A34A → #3B82F6` gradient, `#06B6D4` cyan accent.

---

## 1. Core Visual Principles & Aesthetic Guardrails

### 🚫 The "Anti-Slop" Bans (What NEVER to do)
- **NO Generic Default Gradients**: Use specified theme palette tokens.
- **NO Harsh Heavy Shadows**: Avoid ugly `shadow-2xl` or uncalibrated black drop shadows. Use M3 elevation shadows (`shadow-md` for Light, surface tint for Dark).
- **NO Thick Borders**: Ban solid `border-2` outlines. Use `border-[#E5E7EB]` for M3 Light and `border-[#374151]` for M3 Dark.
- **NO Cards-Inside-Cards Nesting**: Maximize breathing room; use M3 elevated containers (`rounded-[28px]`).
- **NO Static Layouts**: Every button, input, and interactive element MUST have spring physics or smooth transitions (`transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`).

---

## 2. Integrated Framework Foundations

### 🍏 Apple Interface & Fluid Motion Philosophy
- **Translucent Materials & Depth**: Use M3 surface containers with frosted backdrop blurs (`backdrop-blur-3xl`).
- **Interruptible Spring Physics**: Motion must feel physical, smooth, and natural (Framer Motion `type: "spring"`, `damping: 28`, `stiffness: 280`).
- **Optical Typography**: High-contrast, broad editorial font hierarchy with tight tracking (`tracking-tighter` on headings, `tracking-tight` on body).

---

## 3. Workflow for UI Tasks & Redesigns

1. **Audit & Plan**: Identify hardcoded values, generic colors, static buttons, and missing micro-animations.
2. **Apply Theme Palette**: Select or apply active M3 light/dark tokens across background ground, containers, borders, and text labels.
3. **Elevate Components**: Upgrade plain divs into M3 surface containers (`rounded-[28px]`) with ambient blur glows and spring-animated entry.
4. **Verify Motion & Accessibility**: Ensure smooth 60fps hardware-accelerated transitions and legible contrast ratios across all screen sizes.
