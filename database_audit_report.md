# coZify Database & Data-Flow Audit Report

## 1. Firebase Connection
**PASS**
- `firebase.js` initializes the App, Auth, and Firestore correctly.
- No hardcoded credentials were found in the source code; they rely on environment variables (Vite env config).

## 2. User Profile Flow
**PASS**
- **Flow:** `Firebase Auth (onAuthStateChanged) → extract UID → syncUserProfileToFirestore() → writes to users/{uid} → Zustand (useBudgetStore.setUser) → UI`
- **Security:** `useAuthLifecycle.ts` uses a single global observer. It handles token refreshing (every 45m) and securely logs the user out after 30 minutes of inactivity.
- **Edge Cases:** If `firebaseUser` is null, `logoutUser()` wipes the local Zustand state and localStorage cleanly, preventing data leaks between accounts.

## 3. All User Data Collections
**WARNING** (Local state is excellent, but cloud subcollection sync is broken due to security rules - see Fixes Required)
- **Local Persistence:** Data correctly persists in Zustand using `localStorage` (`budtrack-storage-v2`).
- **Data Traced:** Transactions, Wallets, Goals, Trips, Preferences, Custom Categories.
- **Reloading:** `useCloudSync.ts` correctly mounts and fetches `users/{uid}/backups/latest` (containing transactions, budget, custom categories, preferences).
- **Subcollections:** Trips and Goals are saved to their own subcollections (`users/{uid}/trips` and `users/{uid}/goals`).

## 4. Cloud Sync
**PASS (Logic), FAIL (Permission on Subcollections)**
- **Hashing Optimization:** `firestoreService.ts` computes an MD5 hash of the payload before uploading. If the local state hasn't changed, the network request is bypassed.
- **Conflict Resolution:** `useCloudSync.ts` compares the timestamp of the latest local transaction against the backup's `updatedAtFormatted`. It avoids overwriting newer local data with a stale cloud backup.
- **Debounce:** Cloud sync is heavily debounced (2 seconds) to prevent spamming Firestore writes on rapid UI interactions.

## 5. Firestore Security
**FAIL (CRITICAL)**
- **Audit Findings:** The `firestore.rules` file enforces strict isolation:
  - `match /users/{userId}/backups/latest` allows `isOwner(userId)` and strictly validates the schema `isValidBackupPayload()`.
  - `match /users/{userId}` allows `isOwner(userId)`.
  - However, the rules **do not define access for user subcollections** (except for Admins who get `match /users/{document=**}`).
- **Impact:** When `syncTripsToFirestore` or `syncGoalsToFirestore` run, the user attempts to write to `users/{uid}/trips/{tripId}` and `users/{uid}/goals/{goalId}`. Firestore will reject these writes with a "Missing or insufficient permissions" error. Trips and Goals are currently not backing up to the cloud!

## 6. Admin Database Connections
**PASS**
- **Audit Findings:** `adminRevenueService.ts` and `adminAnalyticsService.ts` are wired up to actual Firestore collections (`revenue/summary`, `revenue/summary/countries`, etc.).
- There is no mock data masking failed connections. If the `revenue` collection is empty, the service falls back gracefully by returning structured zeroes, which the UI handles correctly.

## 7. Hardcoded / Fake Data Detection
**HARDCODED DATA FOUND**
- **File:** `src/app/components/screens/InsightsWidget.tsx`
- **Location:** Line 23
- **What is hardcoded:** `const savedThisWeek = Math.max(0, (trends.weekdayTotal + trends.weekendTotal) * 0.1); // Mock calculation`
- **Impact:** The "saved this week" insight metric is not real; it simply multiplies total spending by 10%.

## 8. Database Flow Map
### Main Backup Payload Flow
1. **Trigger:** Zustand `useBudgetStore` changes (transactions, preferences, categories).
2. **Hash Check:** `useCloudSync.ts` generates MD5 hash of payload.
3. **Write:** `firestoreService.ts` writes to `users/{uid}/backups/latest`.
4. **Metadata:** Updates parent doc `users/{uid}` with stats (`transactionCount`, `localStorageSizeKb`).

### Trips / Goals Flow
1. **Trigger:** Zustand `useTripsStore` or `useGoalsStore` changes.
2. **Write:** `firestoreService.ts` executes a `writeBatch` deleting removed items and updating current items in `users/{uid}/trips/{tripId}`.
3. **Metadata:** Updates `tripsCount` / `goalsCount` on `users/{uid}`.
4. **Current Status:** BLOCKED by Firestore Security Rules.

## 9. Fixes Required

### 1. Critical
- **File:** `firestore.rules`
- **Problem:** Users lack permission to read/write to their own `trips` and `goals` subcollections.
- **Root Cause:** Firestore rules do not cascade automatically. The rule `match /users/{userId}` does not grant access to `/users/{userId}/trips/{document}`.
- **Recommended Fix:** Add the following to `firestore.rules`:
  ```json
  match /users/{userId}/trips/{tripId} {
    allow read, write: if isOwner(userId) || isAdmin();
  }
  match /users/{userId}/goals/{goalId} {
    allow read, write: if isOwner(userId) || isAdmin();
  }
  ```

### 2. Low
- **File:** `src/app/components/screens/InsightsWidget.tsx`
- **Problem:** "Saved this week" trend is a mock calculation.
- **Recommended Fix:** Replace with actual calculation comparing previous week spending or goal contributions.
