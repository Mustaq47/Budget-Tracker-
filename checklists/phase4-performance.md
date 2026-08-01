# Phase 4 — Performance & Rendering Optimization Checklist

**Purpose**: Execute Phase 4 (Performance) from `implementation_plan.md` to optimize rendering speed, minimize re-render frequency, optimize list/chart rendering, reduce scripting/paint cost, and achieve 95+ performance metrics while obeying `rule.md`.

---

## Phase 1: List & Component Memoization (Re-render Reduction)

- [x] T001 [US1] Optimize `FlowItemCard` in `src/app/components/screens/Flow.tsx` with `React.memo` and memoized action callbacks to prevent re-rendering unmodified timeline cards.
- [x] T002 [US1] Add pagination / item cap in `src/app/components/screens/Flow.tsx` for large transaction arrays (`slice(0, 150)`) to prevent DOM bloat and layout thrashing.

## Phase 2: Expensive Calculation Memoization (Charts & Insights)

- [x] T003 [US1] Ensure chart category breakdown and time-series calculations in `src/app/components/screens/Insights.tsx` are wrapped in `useMemo` to eliminate synchronous scripting overhead on tab switching.

## Phase 3: Image & Asset Loading Optimization

- [x] T004 [US1] Add `loading="lazy"`, `decoding="async"`, and `fetchPriority="low"` to profile image tags in `src/app/components/SafeAvatar.tsx` to reduce main-thread paint cost.

## Phase 4: Verification & Rule Compliance

- [x] T005 [US1] Run production bundle build (`npm run build`) and verify clean compilation without errors or regressions.
- [x] T006 [US1] Enforce `rule.md` Compliance:
  - Do NOT directly commit into git.
  - Do NOT create a new APK.
