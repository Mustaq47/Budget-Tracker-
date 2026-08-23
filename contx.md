# coZify Application Context (contx)

## 1. High-Level Architecture
- **Framework:** React 18 with Vite.
- **Language:** TypeScript.
- **Styling:** Tailwind CSS (strict Apple-style minimal aesthetics, "Anti-slop", heavy use of glassmorphism, precise typography).
- **Native Wrapper:** Capacitor (for generating the Android APK `coZify-v1.x.x.apk`).
- **State Management:** Zustand (with `persist` middleware for local-first functionality).
- **Backend/Database:** Firebase (Authentication + Firestore).
- **Money Handling:** `dinero.js` (v2) for precise currency mathematics.

## 2. UI / UX Flow
The application acts as a single-page local-first app that feels like a native mobile app. It avoids traditional URL routing in favor of an app-like Modal/Sheet system.
- **Entry Point (`Root.tsx`):**
  - Checks Firebase Authentication state (`useAuthStore`).
  - If no user -> Shows `LoginScreen.tsx` or `Onboarding.tsx`.
  - If user exists -> Shows `Home.tsx`.
- **Main Dashboard (`Home.tsx`):**
  - Displays total balance, income/expense summaries, and recent transactions.
  - Features quick-access "Wallet" cards.
- **Navigation (Bottom Sheets):**
  - Instead of pages, the app uses draggable/swipeable bottom sheets (e.g., `BottomSheet.tsx`) to display core features:
    - **`QuickEntrySheet.tsx`:** The central hub for logging expenses (General, Trip-specific, or Goal contributions). Includes Quick Amount buttons and strict UI mode coloring (Emerald for general, Amber for Trips, Blue for Goals).
    - **`TripsModal.tsx`:** Manages specialized travel budgets and logs.
    - **`GoalsModal.tsx`:** Manages savings targets. Features unique visual "glows" (Gold, Blue, Purple, Pink).
    - **`WalletModal.tsx`:** Manages different accounts/cards.
    - **`UserProfileModal.tsx` / `Profile.tsx`:** Settings, themes, CSV exports, and manual cloud sync controls.

## 3. Database Connection & Cloud Sync
The app is strictly **Local-First**. Operations read/write to local Zustand stores instantly, and sync to Firebase in the background.
- **Firebase Initialization (`src/services/firebase.js`):**
  - Connects to the project using standard Firebase config.
- **Cloud Sync System (`firestoreService.ts` & `useCloudSync.ts`):**
  - **Timestamp-Based Conflict Resolution:** Data is synced based on the `lastUpdated` timestamp.
  - **Payload Hashing:** To avoid unnecessary writes, `computePayloadHash` generates an MD5 hash of the local state (including `transactions`, `trips`, `goals`, `wallets`, `preferences`, and `customCategories`). If the hash matches the one stored in Firestore, network writes are skipped to save bandwidth and reads/writes.
  - **Collections:**
    - `users/{uid}`: Stores the user's entire encrypted/stringified state payload.
    - `revenue`: Tracked by the admin panel for app monetization/metrics.
    - `support_queries`: Stores messages sent from the user profile.

## 4. State Management (Zustand)
Divided into several slice-like stores, primarily coordinated by `useBudgetStore.ts`:
- **`useBudgetStore`:** Manages transactions, wallets, currency, theme preferences (light/dark glassmorphism), and overall balance calculations.
- **`useTripsStore`:** Manages travel destinations, trip budgets, and trip-specific expenses.
- **`useGoalsStore`:** Manages saving targets, current progress, and target amounts.
- **`useAuthStore`:** Manages Firebase user session and premium status.

## 5. Admin Panel (Internal Tools)
Located in `src/admin/`, meant for app owners.
- **Dashboards:** Tracks MAU, Revenue, and total transactions.
- **User Directory:** Lists all registered users and allows exporting user data to CSV.
- **IAM / Security:** Future infrastructure for Role-Based Access Control and device tracking.
- **Strict Rule:** Admin services must directly connect to Firestore (`adminRevenueService.ts`, `adminAnalyticsService.ts`) and never use dummy/placeholder data.

## 6. Website / Distribution (`Website-coZiy/`)
- A secondary repository/folder containing a simple, premium landing page for the application.
- Distributes the Android application. The `public` folder hosts the compiled APK (e.g., `coZify-v1.0.3.apk`) and `App.tsx` links directly to this file for user downloads.

## 7. Key Project Constraints & Rules
- **Anti-slop Design:** Strict adherence to Material Design 3 and Apple's human interface guidelines. No harsh borders, heavy shadows, or generic colors.
- **Caveman Communication:** AI agent interactions are expected to be terse, highly technical, and devoid of fluff.
- **Performance:** App is heavily chunked (Vite manual chunks). Wait for background Gradle syncs before pushing APK updates.
