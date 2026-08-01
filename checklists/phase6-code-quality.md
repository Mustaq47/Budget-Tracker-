# Phase 6 — Code Quality & Refactoring Checklist

**Purpose**: Execute Phase 6 (Code Quality) from `implementation_plan.md` to eliminate duplicate logic, extract reusable constants/utilities/hooks, improve maintainability and readability, and adhere strictly to `/desings` and `rule.md` guardrails.

---

## Phase 1: Reusable Utilities & Constants (Single Source of Truth)

- [x] T001 [US1] Create centralized category meta & color mapping utility `src/utils/categoryConfig.ts` (`getCategoryMeta`, `categoryColors`, `DEFAULT_CATEGORY_META`) to eliminate duplicate icon and color definitions across screens and modals.
- [x] T002 [US1] Create reusable formatting utility `src/utils/formatters.ts` (`formatCurrency`, `formatDateLabel`) to standardize number and date display across the app.

## Phase 2: Reusable Hooks (Touch & Gestures)

- [x] T003 [US1] Create reusable long-press gesture hook `src/utils/useLongPress.ts` (`useLongPress`) with haptic feedback support to replace duplicate ref/timeout logic in list cards and profile selectors.

## Phase 3: Integration & Duplicate Removal

- [x] T004 [US1] Integrate `getCategoryMeta` and `formatCurrency` in `src/app/components/screens/Flow.tsx` and `src/app/components/screens/Insights.tsx` to remove redundant category map lookups.

## Phase 4: Verification & Rule Compliance

- [x] T005 [US1] Run production bundle build (`npm run build`) and verify clean compilation without TypeScript or syntax regressions.
- [x] T006 [US1] Enforce `rule.md` Compliance:
  - Do NOT directly commit into git.
  - Do NOT create a new APK.
