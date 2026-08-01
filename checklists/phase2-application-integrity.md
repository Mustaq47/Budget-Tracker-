# Phase 2 — Application Integrity Checklist

**Purpose**: Execute Phase 2 (Application Integrity) from `implementation_plan.md` to inspect the codebase, eliminate timer/memory leaks, fix unsafe TypeScript assertions and broken references, replace ad-hoc console logging with a production-safe logger, and ensure strict compliance with `/desings` and `rule.md`.

---

## Phase 1: Type Safety & Reference Fixes

- [x] T001 [US1] Fix broken Recharts `Tooltip` cursor radius type error (`radius: [6, 6, 0, 0]` -> `radius: 6`) in `src/app/components/screens/Insights.tsx` to resolve TypeScript overload errors.
- [x] T002 [US1] Verify zero compilation and type errors across the entire codebase (`npx tsc --noEmit`).

## Phase 2: Timer & Memory Leak Cleanup

- [x] T003 [US1] Clean up press timer refs (`budgetPressTimerRef`, `weekPressTimerRef`, `monthPressTimerRef`) on unmount in `src/app/components/screens/Insights.tsx` to prevent timer leaks.
- [x] T004 [US1] Replace manual `longPressTimer` ref in `src/app/components/screens/Profile.tsx` with reusable `useLongPress` hook from `src/utils/useLongPress.ts` to prevent unmount timer leaks and eliminate duplicate code.

## Phase 3: Production Logging & Console Cleanup

- [x] T005 [US1] Create production-safe application logger `src/utils/logger.ts` to silence non-critical debug/warn logs in production builds.
- [x] T006 [US1] Replace direct `console.warn` / `console.error` calls in UI screens and modals (`Profile.tsx`, `LoginScreen.tsx`, `PrivacyModal.tsx`, `NotificationsModal.tsx`, `AccountSwitcherModal.tsx`) with `logger.warn` / `logger.error`.

## Phase 4: Verification & Rule Compliance

- [x] T007 [US1] Run production bundle build (`npm run build`) and verify clean compilation without TypeScript or syntax regressions.
- [x] T008 [US1] Enforce `rule.md` Compliance:
  - Do NOT directly commit into git.
  - Do NOT create a new APK.
