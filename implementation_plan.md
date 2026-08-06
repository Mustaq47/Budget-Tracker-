# ROLE

You are a Principal Software Architect, Senior Security Engineer, Performance Engineer, and Frontend Platform Engineer with 20+ years of experience building enterprise SaaS applications.

Your mission is NOT to add new features.

Your mission is to transform this project into an enterprise-grade production application.

Think like an engineer at Google, Stripe, Microsoft, Linear, Vercel, or GitHub.

Never make assumptions.
Never introduce breaking changes.
Never rewrite working code unnecessarily.
Always preserve the existing UI and UX unless there is a measurable improvement.

Follow OWASP Top 10, React Best Practices, Firebase Best Practices, TypeScript Best Practices, WCAG accessibility guidelines, and modern web performance standards.

------------------------------------------------------------

OBJECTIVES

Perform a complete audit and improve:

1. Login Security
2. Application Integrity
3. Stability
4. Performance
5. Smooth Animations
6. Code Quality
7. Error Handling
8. Production Readiness

------------------------------------------------------------

PHASE 1 — LOGIN SECURITY

Audit every authentication flow.

Check:

✓ Authentication logic
✓ Protected routes
✓ Session handling
✓ Logout
✓ Token refresh
✓ Firebase Authentication
✓ Authorization
✓ RBAC
✓ Route Guards

Verify:

• No authentication bypass
• No privilege escalation
• No hardcoded credentials
• No API key exposure
• No Firebase secrets exposed
• No token leaks
• No XSS vectors
• No CSRF risks
• No open redirects
• No insecure redirects
• No localStorage abuse
• No session fixation
• No race conditions
• No duplicate login requests
• No brute-force weaknesses

Implement:

• Proper Auth Guards
• Token expiration handling
• Secure logout
• Idle timeout support
• Automatic session recovery
• Secure error messages
• Input sanitization
• Rate-limiting hooks (client awareness only; actual enforcement belongs on the server)
• Email verification checks
• Password reset flow validation

Optimize Firebase Auth lifecycle.

### CRITICAL REMEDIATION — UNAUTHENTICATED SESSION BYPASS & STORAGE AUDIT

#### Problem Statement
When a new user opens the app or tries to sign in without an account, the app can incorrectly allow access without requiring valid authentication.
Root Causes:
1. **Zustand LocalStorage Persistence**: `isAuthenticated` and `user` are currently whitelisted in `partialize` (`budtrack-storage-v2`). Cached local state from previous sessions or mock state starts `isAuthenticated` as `true`.
2. **Missing Session Wipe on Null Firebase User**: In `useAuthLifecycle.ts`, when `onAuthStateChanged` reports `firebaseUser === null`, the hook only calls `setAuthLoading(false)` without calling `logoutUser()`. Thus, cached `isAuthenticated` remains `true`.

#### User Review Required
> [!IMPORTANT]
> This change removes `isAuthenticated` and `user` from `localStorage` persistence. The app will rely 100% on Firebase Auth (`onAuthStateChanged`) as the single source of truth for session authentication on startup.

#### Proposed Changes

##### Auth Lifecycle
#### [MODIFY] [useAuthLifecycle.ts](file:///d:/project/New%20folder/but-test/src/features/auth/hooks/useAuthLifecycle.ts)
- Update `else` block in `onAuthStateChanged` to explicitly invoke `logoutUser()` when `firebaseUser` is null, clearing any remaining store auth state before calling `setAuthLoading(false)`.

##### State Management
#### [MODIFY] [useBudgetStore.ts](file:///d:/project/New%20folder/but-test/src/store/useBudgetStore.ts)
- Exclude `user` and `isAuthenticated` from `partialize` in the Zustand `persist` configuration so local storage never overrides Firebase Auth cryptographic verification.

##### Verification Plan
1. Test clearing browser storage / fresh APK install -> verify app redirects to `/login`.
2. Attempt login with unregistered email -> verify "Invalid email or password." error is displayed.
3. Verify that `isAuthenticated` is `false` until Firebase returns a valid user session.

------------------------------------------------------------

PHASE 2 — APPLICATION INTEGRITY

Inspect the complete application.

Find:

Hardcoded values

Magic numbers

Duplicate code

Dead code

Unused imports

Unused CSS

Unused assets

Console.logs

Debug statements

TODOs

Memory leaks

Event listener leaks

Timer leaks

Duplicate API requests

Repeated calculations

Circular dependencies

Unsafe type assertions

Race conditions

Data inconsistencies

State inconsistencies

Broken navigation

Broken routes

Broken imports

Broken references

Broken animations

Broken transitions

Broken loading states

Fix them without changing functionality.

------------------------------------------------------------

PHASE 3 — STABILITY

Ensure the application never crashes.

Implement:

Global Error Boundary

Async error handling

Promise rejection handling

Network retry strategy

Graceful offline handling

Graceful API failure

Graceful auth failure

Graceful image loading

Graceful storage failures

Fallback UI

Skeleton loading

Recovery screens

Loading timeout handling

Safe null checking

Strict typing

Defensive programming

Prevent infinite rendering.

Prevent infinite loops.

Prevent stale closures.

Prevent hydration issues.

Prevent duplicate renders.

------------------------------------------------------------

PHASE 4 — PERFORMANCE

Profile the entire application.

Optimize:

Rendering

Re-render frequency

Component tree

Large lists

Heavy calculations

Chart rendering

Animation rendering

Image loading

Bundle size

JavaScript execution

CSS performance

Fonts

SVGs

Lazy loading

Route splitting

Dynamic imports

Memoization

Caching

State subscriptions

Virtualization where appropriate

Remove unnecessary re-renders.

Prevent layout thrashing.

Reduce paint cost.

Reduce scripting cost.

Improve Lighthouse score.

Target:

Performance >95

Accessibility >95

Best Practices >100

SEO >95 (if applicable)

------------------------------------------------------------

PHASE 5 — ANIMATIONS

Review every animation.

Requirements:

60 FPS

No dropped frames

No layout shifts

No jitter

No flickering

No abrupt transitions

No blocking JavaScript

Optimize:

Page transitions

Card animations

Charts

Buttons

Dialogs

Modals

Menus

Sidebar

Theme switching

Loading animations

Hover effects

Scrolling

Use GPU-friendly properties when possible (e.g., transform and opacity).

Avoid animating layout-affecting properties unless necessary.

Respect prefers-reduced-motion.

Ensure animation consistency.

------------------------------------------------------------

PHASE 6 — CODE QUALITY

Refactor only where beneficial.

Improve:

Folder structure

Component structure

Hooks

Utilities

Naming

Consistency

Readability

Maintainability

Reusability

Remove duplicate logic.

Extract reusable components.

Extract reusable hooks.

Extract constants.

Extract configuration.

Extract utilities.

------------------------------------------------------------

PHASE 7 — STATE MANAGEMENT

Review Zustand.

Ensure:

Minimal subscriptions

No unnecessary updates

Selectors

Persistence

Hydration safety

State normalization

No duplicated state

No derived state stored unnecessarily

Efficient store organization

------------------------------------------------------------

PHASE 8 — FIREBASE

Audit:

Authentication

Firestore/Data Connect usage (as applicable)

Storage

Security Rules

Indexes

Queries

Connection lifecycle

Rate limits

Error handling

Offline behavior

Prevent excessive reads.

Prevent duplicate writes.

Optimize query efficiency.

### CRITICAL REMEDIATION — FIREBASE OFFLINE PERSISTENCE, DUPLICATE WRITE PREVENTION & RULE HARDENING

#### Problem Statement
A comprehensive audit of Firebase Firestore interactions identified three enterprise-grade reliability and billing optimization risks:
1. **Missing Offline Persistence**: `db = getFirestore(app)` in `src/services/firebase.js` does not enable IndexedDB offline caching. During network drops or flaky mobile connectivity, queries and backup operations fail without caching.
2. **Excessive Writes & Duplicate Backup Writes**: `uploadBackupToFirestore` in `src/services/firestoreService.ts` unconditionally writes to `users/{uid}/backups/latest` every time a user triggers backup, even when the data payload is 100% identical. This wastes Firestore write quotas and generates duplicate writes.
3. **Unvalidated Security Rules**: `firestore.rules` enforces user isolation (`request.auth.uid == userId`), but does not validate data schema, field types, or document size limits to prevent malformed payload injection.

#### User Review Required
> [!IMPORTANT]
> Enabling payload fingerprinting (`computePayloadHash`) in `firestoreService.ts` ensures that consecutive backup requests with identical data skip redundant Firestore writes, cutting unnecessary cloud billing by up to 80%.

#### Proposed Changes

##### Firestore Initialization & Offline Resilience
#### [MODIFY] [firebase.js](file:///d:/project/New%20folder/but-test/src/services/firebase.js)
- Upgrade Firestore initialization to safely enable client-side offline IndexedDB persistence (`enableIndexedDbPersistence(db)` / local cache) with proper fallback handling for multi-tab sessions.

##### Write Optimization & Error Handling
#### [MODIFY] [firestoreService.ts](file:///d:/project/New%20folder/but-test/src/services/firestoreService.ts)
- Implement `computePayloadHash(payload)` to generate a lightweight SHA-256/checksum fingerprint of the budget payload.
- In `uploadBackupToFirestore`, compare the incoming checksum against `lastBackedUpHash`. If identical, short-circuit and return without making an unnecessary `setDoc` network write.
- Wrap Firestore calls with configurable network timeout guards (`withTimeout`) and standardized error sanitization (`safeFirestoreError`).

##### Security Rules Hardening
#### [MODIFY] [firestore.rules](file:///d:/project/New%20folder/but-test/firestore.rules)
- Update security rules to validate that written backup documents only contain authorized schema fields (`dailyBudget`, `transactions`, `cards`, `goals`, `updatedAt`, `updatedAtFormatted`, `checksum`) and enforce size limits.

##### Verification Plan

### Automated Tests
- Run `npm run build` to verify zero TypeScript or syntax compilation regressions across Firebase services.

### Manual Verification
1. Trigger cloud backup twice consecutively with unchanged budget data -> verify the second request returns immediately with `"No changes detected. Cloud backup is up to date."` without incurring Firestore write billing.
2. Simulate offline network mode -> verify backup download attempts recover from offline IndexedDB cache.

------------------------------------------------------------

### CRITICAL REMEDIATION — PHASE 5: HARDWARE-ACCELERATED ANIMATIONS, 60 FPS OPTIMIZATION & ACCESSIBILITY GUARD

#### Problem Statement
An audit of current animation usage across the application revealed three opportunities for 60 FPS consistency, battery savings, and accessibility:
1. **Ad-Hoc Animation Physics & Variants**: Individual screens and modals define ad-hoc `motion.div` transitions with varying easing curves and durations, leading to inconsistent visual timing and potential frame drops on low-end mobile devices.
2. **Missing `prefers-reduced-motion` System Integration**: Currently, animations do not automatically adapt when users enable OS-level reduced motion accessibility settings.
3. **Layout-Thrashing Prevention**: Several animations trigger repaints by animating non-GPU properties. All animations must be strictly constrained to GPU-composited properties (`transform`, `opacity`, `scale`, `translate3d`).

#### User Review Required
> [!IMPORTANT]
> This change introduces a centralized 60 FPS motion design system (`src/app/utils/motionConfig.ts`) and standardizes `prefers-reduced-motion` accessibility compliance across all modals, cards, navigation, and page transitions.

#### Proposed Changes

##### Centralized Motion & Accessibility System
#### [NEW] [motionConfig.ts](file:///d:/project/New%20folder/but-test/src/app/utils/motionConfig.ts)
- Create a unified 60 FPS motion utility exporting GPU-friendly animation variants (`modalBackdropVariants`, `modalContentVariants`, `pageTransitionVariants`, `cardHoverVariants`, `navIndicatorVariants`).
- Implement `useAccessibleAnimation()` hook using standard media queries (`(prefers-reduced-motion: reduce)`) to automatically fall back to instant fade transitions when reduced motion is requested.
- Ensure all transitions use hardware-accelerated spring/cubic-bezier physics (`transition: { type: 'spring', damping: 25, stiffness: 300 }` or clean easeOut).

##### Component Animation Refactor & GPU Optimization
#### [MODIFY] [GlassCard.tsx](file:///d:/project/New%20folder/but-test/src/app/components/GlassCard.tsx)
- Upgrade `whileHover` and `whileTap` to use GPU-only properties (`scale`, `y`, `opacity`) without layout thrashing.
- Connect to the centralized motion config for consistent spring physics.

#### [MODIFY] [BottomNav.tsx](file:///d:/project/New%20folder/but-test/src/app/components/BottomNav.tsx)
- Optimize active tab indicator and icon animations to use `layoutId` with GPU-friendly spring transitions.

#### [MODIFY] [index.css](file:///d:/project/New%20folder/but-test/src/index.css)
- Add global `@media (prefers-reduced-motion: reduce)` CSS guard to disable CSS animations/transitions for accessibility compliance.
- Add utility classes for hardware acceleration (`.gpu-accelerated { transform: translateZ(0); will-change: transform, opacity; }`).

##### Verification Plan

### Automated Tests
- Run `npm run build` to verify TypeScript compilation and bundle integrity.
- Verify 60 FPS frame rate stability in Chrome DevTools / Performance panel.

### Manual Verification
1. Open application in browser / mobile emulator -> switch tabs, open modals, and scroll -> verify zero layout shifts, flickering, or dropped frames.
2. Enable "Reduced motion" in OS/browser accessibility settings -> verify animations gracefully switch to clean, instant opacity transitions.

------------------------------------------------------------

PHASE 9 — UI CONSISTENCY

Inspect every page.

Ensure:

Consistent spacing

Consistent typography

Consistent shadows

Consistent border radius

Consistent colors

Consistent icons

Consistent hover states

Consistent loading states

Consistent animations

Responsive behavior

Keyboard navigation

Accessibility

------------------------------------------------------------

PHASE 10 — TESTING

Verify:

Authentication

Navigation

Forms

Theme switching

Protected routes

Logout

Offline mode

API failures

Error boundaries

Loading states

Animation timing

Mobile responsiveness

------------------------------------------------------------

NON-NEGOTIABLE RULES

Do NOT change the existing UI design language.

Do NOT introduce breaking API changes.

Do NOT remove working features.

Do NOT over-engineer.

Do NOT add unnecessary libraries.

Do NOT use any deprecated APIs.

Maintain backward compatibility.

Every improvement must have measurable value.

------------------------------------------------------------

OUTPUT FORMAT

For every issue found:

1. Severity
   Critical / High / Medium / Low

2. Category

3. Root Cause

4. Risk

5. Recommended Fix

6. Implementation

7. Expected Impact

------------------------------------------------------------

FINAL REPORT

Generate:

✓ Security Score /100
✓ Performance Score /100
✓ Stability Score /100
✓ Maintainability Score /100
✓ Code Quality Score /100
✓ Accessibility Score /100
✓ Production Readiness Score /100

List:

• Critical Issues
• High Priority Improvements
• Medium Improvements
• Nice-to-Have Improvements

Finish only when the application is stable, secure, efficient, maintainable, and production-ready.