# Phase 7 — State Management Checklist

**Purpose**: Execute Phase 7 (State Management) from `implementation_plan.md` to review and harden Zustand store organization, ensure hydration safety, prevent unnecessary updates, eliminate derived state storage issues, and provide atomic selector helpers.

---

## Phase 1: Hydration Safety & State Normalization

- [x] T001 [US1] Add hydration safety flag `_hasHydrated` and `setHasHydrated` with `onRehydrateStorage` callback in `src/store/useBudgetStore.ts` so components can safely check persistence hydration status.
- [x] T002 [US1] Ensure `cardsCount` is synchronized cleanly as derived state without localStorage drift in `src/store/useBudgetStore.ts`.

## Phase 2: Atomic Selectors & Subscription Optimization

- [x] T003 [US1] Create atomic store selectors (`selectUserAuth`, `selectTransactions`, `selectCards`, `selectGoals`, `selectThemeSettings`, `selectBackupState`) in `src/store/useBudgetStore.ts` to allow fine-grained subscriptions and prevent full-store re-renders.

## Phase 3: Verification & Rule Compliance

- [x] T004 [US1] Run production bundle build (`npm run build`) and verify clean compilation without TypeScript or syntax regressions.
- [x] T005 [US1] Enforce `rule.md` Compliance:
  - Do NOT directly commit into git.
  - Do NOT create a new APK.
