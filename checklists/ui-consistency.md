# UI Consistency & Design System Requirements Checklist

**Purpose**: Validate the completeness, clarity, consistency, and measurability of Phase 9 (UI Consistency) requirements against the `/desings` high-end visual design system.
**Created**: 2026-07-30
**Audience**: Requirements Author / Design System Reviewer
**Depth**: Standard Release Gate (Unit Tests for English)

---

## 1. Requirement Completeness & Token Mapping (Material Design 3 & Themes)

- [ ] CHK001 - Are exact HEX codes and semantic names defined for all primary, secondary, and tertiary Material Design 3 color tokens across Light and Dark themes? [Completeness, desings §MD3]
- [ ] CHK002 - Are specific category color mappings (Income, Expense, Savings, Investments, Bills, Shopping, Transport, Food) documented for consistent charts and badges? [Completeness, desings §CategoryColors]
- [ ] CHK003 - Does the specification explicitly define which of the 7 theme paradigms (Dark, Light, Glassmorphism, Neumorphism, Minimalist, Gradient) is active for each screen or state? [Completeness, desings §Themes]
- [ ] CHK004 - Are background ground (`#F8FAFC` / `#121212`) and elevated surface (`#FFFFFF` / `#1E1E1E`) token rules documented for all page layouts? [Completeness, Spec §Phase9]

---

## 2. Requirement Clarity & Quantifiable Metrics (Spacing, Typography, Radius, Shadows)

- [ ] CHK005 - Is "consistent spacing" quantified with an explicit spacing scale (e.g., 4px base grid, 24px container padding)? [Clarity, Spec §Phase9]
- [ ] CHK006 - Are "consistent typography" requirements specified with exact font family, optical sizing, weight, and line-height values? [Clarity, desings §Apple]
- [ ] CHK007 - Is letter-tracking explicitly quantified for heading styles (`tracking-tighter`) versus body copy (`tracking-tight`)? [Clarity, desings §Apple]
- [ ] CHK008 - Is "consistent border radius" quantified with precise pixel tokens (e.g., `rounded-[28px]` for primary surface containers)? [Clarity, desings §AntiSlop]
- [ ] CHK009 - Are elevation shadow requirements quantified with exact Material Design 3 elevation tokens (`shadow-md` for Light, surface tint for Dark) rather than generic labels? [Clarity, desings §AntiSlop]

---

## 3. Anti-Slop Guardrails & Visual Restraint (Borders, Gradients, Nesting)

- [ ] CHK010 - Are prohibitions against uncalibrated default gradients and saturated browser defaults explicitly documented in the requirements? [Completeness, desings §AntiSlop]
- [ ] CHK011 - Does the spec define clear rules prohibiting thick solid borders (`border-2`) in favor of subtle divider tokens (`#E5E7EB` light / `#374151` dark)? [Consistency, desings §AntiSlop]
- [ ] CHK012 - Are visual hierarchy rules documented to prevent "cards-inside-cards" container nesting and enforce breathing whitespace? [Clarity, desings §AntiSlop]
- [ ] CHK013 - Are requirements defined for frosted glass backdrop blur intensities (`backdrop-blur-3xl`) when translucent materials are used? [Clarity, desings §Apple]

---

## 4. Motion & Fluid Interaction Requirements (Apple Fluid Motion & Hardware Acceleration)

- [ ] CHK014 - Are spring physics curves quantified with exact damping and stiffness values (`type: "spring", damping: 28, stiffness: 280`) for interactive elements? [Measurability, desings §Apple]
- [ ] CHK015 - Does the spec define exact easing curves (`cubic-bezier(0.4, 0, 0.2, 1)`) and duration limits (e.g., ≤200ms) for micro-animations? [Clarity, desings §AntiSlop]
- [ ] CHK016 - Are requirements specified to restrict all motion and hover animations exclusively to GPU-composited properties (`transform`, `opacity`, `scale`)? [Consistency, Spec §Phase5]
- [ ] CHK017 - Is the fallback behavior for `prefers-reduced-motion: reduce` documented for all animated components? [Coverage, Spec §Phase5]

---

## 5. Scenario & Edge Case Coverage (Zero-State, Loading States, Fallbacks)

- [ ] CHK018 - Are visual layout requirements defined for zero-state screens (no transactions, empty charts, no accounts)? [Coverage, Edge Case]
- [ ] CHK019 - Are skeleton loader or shimmer animation tokens specified for asynchronous data fetching states? [Completeness, Spec §Phase9]
- [ ] CHK020 - Does the specification define fallback visual states when an avatar image or custom icon fails to load? [Coverage, Exception Flow]
- [ ] CHK021 - Are hover, focus, active, and disabled interaction state requirements documented for every clickable component? [Completeness, Spec §Phase9]

---

## 6. Accessibility & Responsive Navigation (A11y, Keyboard Nav, Contrast Ratios)

- [ ] CHK022 - Are WCAG AA/AAA minimum contrast ratios (e.g., 4.5:1 for text) explicitly mandated for all color token combinations? [Measurability, Spec §Phase9]
- [ ] CHK023 - Are keyboard navigation focus-ring styles (`focus:ring-2`) and tab-order rules specified across all modals and screens? [Completeness, Spec §Phase9]
- [ ] CHK024 - Are touch-target minimum dimensions (e.g., ≥44x44px) specified for mobile responsive breakpoints? [Measurability, desings §Mobile]
- [ ] CHK025 - Are screen-reader (`aria-label`, `aria-live`, `role`) requirements defined for icon-only buttons and dynamic toasts? [Completeness, Spec §Phase9]

---

## 7. Traceability & Ambiguities (Spec Section References & Resolving Gaps)

- [ ] CHK026 - Are all UI consistency requirements traceable to specific section IDs in `implementation_plan.md` or `desings/SKILL.md`? [Traceability]
- [ ] CHK027 - Are vague subjective terms like "clean spacing", "smooth animation", or "modern look" replaced with testable numerical tokens? [Ambiguity, Gap]
- [ ] CHK028 - Are requirements defined for testing visual consistency across both web desktop viewports and Capacitor Android WebView? [Coverage, Gap]
