# Restructure Design & Themes: Dark/Light × 5 Presets

## Goal

Restructure the theme system from a flat list of 8 themes + separate dark/light toggle → **two-tab picker** (Dark | Light) with **5 theme presets** under each:

```
Design & Themes
       |
--------------------------
|                        |
🌙 Dark                ☀️ Light
|- 🎨 Material Design  |- 🎨 Material Design
|- 💎 Glassmorphism     |- 💎 Glassmorphism
|- 🟢 Neumorphism      |- 🟢 Neumorphism
|- 📱 Minimalist       |- 📱 Minimalist
|- 🌈 Gradient         |- 🌈 Gradient
```

## User Review Required

> [!IMPORTANT]
> **Removing 3 legacy themes**: `dark-theme`, `light-theme`, `cyber-neon` will be removed from `AppTheme`. These were mode-specific themes that are now replaced by the dark/light variant of each of the 5 core presets. The default theme becomes `material-design` with `colorMode: 'dark'`.

> [!IMPORTANT]
> **Profile "Appearance & Mode" toggle will be removed** — dark/light switching moves into DesignModal itself via the top-level tabs.

## Proposed Changes

### 1. Store — [useBudgetStore.ts](file:///d:/project/New%20folder/but-test/src/store/useBudgetStore.ts)

#### Simplify `AppTheme` union type

```diff
-export type AppTheme = 
-  | 'dark-theme' 
-  | 'light-theme' 
-  | 'material-design' 
-  | 'glassmorphism' 
-  | 'neumorphism' 
-  | 'minimalist-theme' 
-  | 'gradient-theme'
-  | 'cyber-neon';
+export type AppTheme = 
+  | 'material-design' 
+  | 'glassmorphism' 
+  | 'neumorphism' 
+  | 'minimalist-theme' 
+  | 'gradient-theme';
```

- Default `theme` changes from `'cyber-neon'` → `'material-design'`
- `colorMode` stays as `'dark' | 'light'`

---

### 2. Theme Engine — [themePresets.ts](file:///d:/project/New%20folder/but-test/src/utils/themePresets.ts)

#### Remove 3 legacy presets from `themeMap`

Delete entries: `dark-theme`, `light-theme`, `cyber-neon`

#### Define full dark + light token pairs for each of the 5 themes

Expand `getActiveThemeConfig()` to handle dark/light for all 5 presets (not just material-design):

| Theme | Light Bg | Light Surface | Dark Bg | Dark Surface |
|-------|----------|---------------|---------|--------------|
| Material Design | `#F8FAFC` | `#FFFFFF` | `#121212` | `#1E1E1E` |
| Glassmorphism | `#E0F2FE` | `rgba(255,255,255,0.4)` | `#0A0E1A` | `rgba(255,255,255,0.08)` |
| Neumorphism | `#E0E5EC` | `#E0E5EC` | `#2D2D3A` | `#35354A` |
| Minimalist | `#FFFFFF` | `#FFFFFF` | `#0F0F0F` | `#1A1A1A` |
| Gradient | `#F8FAFC` | `#FFFFFF` | `#0B0B1A` | `#151528` |

Each theme retains its unique identity (frosted glass, soft shadows, vibrant gradients) in both modes.

---

### 3. DesignModal UI — [DesignModal.tsx](file:///d:/project/New%20folder/but-test/src/app/components/modals/DesignModal.tsx)

#### New layout:

```
┌─────────────────────────────────┐
│  🎨 Design & Themes            │
│  Select Your Aesthetic System   │
│                                 │
│  ┌──────────┬──────────┐        │
│  │  🌙 Dark │ ☀️ Light │  ← segmented tabs
│  └──────────┴──────────┘        │
│                                 │
│  ┌─ Live Preview Card ────────┐ │
│  │  [active theme preview]    │ │
│  └────────────────────────────┘ │
│                                 │
│  🎨 Material Design     [●]    │
│  💎 Glassmorphism        [○]    │
│  🟢 Neumorphism          [○]    │
│  📱 Minimalist            [○]    │
│  🌈 Gradient              [○]    │
│                                 │
│  [✨ Apply Active Theme]        │
└─────────────────────────────────┘
```

- **Dark/Light segmented tabs** at top — sets `colorMode`
- **5 theme cards** below — sets `theme`
- **Live preview** updates dynamically with both selections
- Selecting a tab + theme = one action, applies immediately
- Only 5 items to scroll instead of 8

---

### 4. Profile Screen — [Profile.tsx](file:///d:/project/New%20folder/but-test/src/app/components/screens/Profile.tsx)

#### Remove "Appearance & Mode" section (lines ~194-246)

The dark/light toggle is now inside DesignModal. Profile just shows "Design & Themes" in Preferences section (already exists).

---

### 5. Fallback / Migration

Any persisted `theme` value of `'dark-theme'`, `'light-theme'`, or `'cyber-neon'` in localStorage → migrated to `'material-design'` on store initialization.

---

## Files Changed Summary

| File | Action |
|------|--------|
| [useBudgetStore.ts](file:///d:/project/New%20folder/but-test/src/store/useBudgetStore.ts) | Simplify `AppTheme`, change default, add migration |
| [themePresets.ts](file:///d:/project/New%20folder/but-test/src/utils/themePresets.ts) | Remove 3 legacy presets, expand dark/light for all 5 |
| [DesignModal.tsx](file:///d:/project/New%20folder/but-test/src/app/components/modals/DesignModal.tsx) | Rewrite: Dark/Light tabs + 5 theme cards |
| [Profile.tsx](file:///d:/project/New%20folder/but-test/src/app/components/screens/Profile.tsx) | Remove Appearance & Mode toggle section |

## Verification Plan

### Build
```bash
npm run build
```

### Manual Verification
- Toggle Dark tab → select each of 5 themes → verify bg, card, text, icons visible
- Toggle Light tab → select each of 5 themes → verify bg, card, text, icons visible
- Close modal → settings persist
- Refresh → theme + colorMode survive reload
