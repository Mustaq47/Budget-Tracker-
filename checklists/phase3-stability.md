# Phase 3 — Stability & Crash Prevention Checklist

**Purpose**: Execute Phase 3 (Stability) from `implementation_plan.md` to ensure the application never crashes, handles network/render/image failures gracefully, and adheres strictly to `/desings` visual rules and `rule.md` guardrails.

---

## Phase 1: Foundational Stability & Error Recovery

- [x] T001 [US1] Create enterprise-grade Global Error Boundary in `src/app/components/ErrorBoundary.tsx` with Material Design 3 glowing recovery card, error stack collapse, 'Try Again', and 'Reset Application State' actions per `/desings`.
- [x] T002 [US1] Wrap `<RouterProvider router={router} />` in `src/app/App.tsx` with `<ErrorBoundary>` so uncaught render errors never crash the app to a blank white screen.

## Phase 2: Graceful Loading States & Image Fallbacks

- [x] T003 [US1] Create reusable `SkeletonLoader` in `src/app/components/SkeletonLoader.tsx` with `/desings` shimmer animations and `prefers-reduced-motion` compliance for charts and summary cards.
- [x] T004 [US1] Create `SafeAvatar` component in `src/app/components/SafeAvatar.tsx` with `onError` fallback to gradient initials so broken Google photoURLs never display broken image icons.

## Phase 3: Resilient Network & Async Operations

- [x] T005 [US1] Create `safeAsync` wrapper and exponential backoff retry helper in `src/utils/asyncHandler.ts` for resilient Firestore/network operations and graceful offline handling.

## Phase 4: Verification & Rule Compliance

- [x] T006 [US1] Verify production build via `npm run build` with zero TypeScript or syntax errors.
- [x] T007 [US1] Enforce `rule.md` Compliance:
  - Do NOT directly commit into git.
  - Do NOT create a new APK.
