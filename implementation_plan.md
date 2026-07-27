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