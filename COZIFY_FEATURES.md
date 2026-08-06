# coZify v6.0.0 — Comprehensive Feature Catalog

**coZify** is a premium, local-first personal finance and daily budget tracking application built with React, TypeScript, Tailwind CSS, Framer Motion, and Zustand. Below is the complete catalog of features and capabilities included in coZify.

---

## 1. Daily Budget Allowance & Top-Up Engine
- **Circular Budget Burn-Rate Ring**: Visual progress indicator on the dashboard displaying today's spent percentage against the user's daily spending allowance.
- **Inline Budget Allowance Top-Up (Tab 1)**:
  - Users can increase their daily budget allowance (`+ Add to Budget`) instantly on any day.
  - **Quick Addition Chips**: One-tap addition buttons (`+₹50`, `+₹100`, `+₹200`, `+₹500`, `+₹1000`) for rapid entry.
  - **Optional Note / Source Attribution**: Input field (`placeholder="e.g. Salary, Bonus, Pocket Money"`) allowing users to tag where the budget addition originated.
  - **Automatic Income Transaction Logging**: Budget allowance additions automatically create an `income` transaction under the `"Income"` category so top-ups are visible in Activity and Flow without skewing expense analytics.
- **Target Budget Management (Tab 2)**:
  - Customize the default daily spending target allowance at any time.

---

## 2. Dynamic Transaction & Custom Category System
- **Comprehensive Expense & Income Tracking**: Record transactions with custom titles, amounts, dates, timestamps, and glow color accents (`purple`, `blue`, `pink`, `gold`).
- **Built-in Smart Categories**: Curated categories (`Food`, `Shopping`, `Transport`, `Bills`, `Utilities`, `Health`, `Investments`, `Savings`, etc.) paired with Lucide icons and vibrant HSL color mappings.
- **Inline Custom Category Creation**:
  - Selecting **"Other"** in either the **Add Expense modal** or the **Flow screen category switcher** reveals an inline glassmorphic input box (`"New Custom Category"`).
  - Custom categories (e.g., `"Gym"`, `"Pets"`, `"Subscriptions"`) are permanently saved to the Zustand store, automatically trimmed, case-insensitively deduplicated, and assigned deterministic HSL colors and icons (`Tag`, `Sparkles`, `Bookmark`, `Gift`, `Wrench`, `Briefcase`).
- **Floating Category Switcher Overlay (`Flow.tsx`)**:
  - Tap any transaction category icon in the timeline to open a floating modal to re-assign categories or create new custom categories on the fly.
- **Swipe-to-Delete with Haptics**:
  - Intuitive horizontal swipe gesture on any transaction card to reveal the delete action, accompanied by native vibration feedback.

---

## 3. Multi-Account Management & Switcher
- **Multiple Saved Accounts (`savedAccounts`)**:
  - Store multiple user profiles on a single device and switch between accounts seamlessly without logging out.
- **Account Removal & Management**:
  - Clean account switcher interface with the ability to remove inactive or saved accounts (`removeSavedAccount`).
- **User Profile Personalization**:
  - Display name, avatar URL, age, gender, and contact customization.

---

## 4. Visualizations, Analytics & Timeline Flow
- **Home Dashboard (`Home.tsx`)**:
  - Real-time spending breakdown circle, quick action buttons (`Wallet`, `Cards`, `Budget`, `Goals`), and a **Recent Activity** feed displaying the latest transactions with color-coded sign indicators (`+` emerald for income, `-` for expense).
- **Timeline Flow (`Flow.tsx`)**:
  - Complete chronological transaction stream with date filtering, category badge icons, and instant total spent calculation.
- **Analytics & Insights (`Insights.tsx`)**:
  - **Weekly & Annual Views**: Switch between 7-day daily spending bars and 12-month annual spending trajectories.
  - **Dynamic Category Spending Breakdown**: Categorical aggregation showing percentage share and total spent per category with deterministic HSL colors.
  - **Pure Expense Filtering**: Automatically filters out `income` transactions from spending charts so burn-rate metrics and category breakdowns reflect true expenditures.

---

## 5. Wallet, Payment Cards & Savings Goals
- **coZify Wallet (`WalletModal.tsx`)**:
  - Centralized net worth and liquidity summary.
- **Virtual Payment Cards (`CardsModal.tsx`)**:
  - Add and manage custom credit/debit cards (`Visa`, `Mastercard`, `Amex`) with personalized cardholder names, expiry dates, and premium gradients.
- **Savings Goals (`GoalsModal.tsx`)**:
  - Create target savings milestones with visual progress bars, current/target amount tracking, and custom glow themes.

---

## 6. UI/UX Design System & Customization
- **7 Core Theme Paradigms**:
  - Switch between curated color themes: **Cyberpunk Pink**, **Neon Emerald**, **Deep Sapphire**, **Sunset Gold**, **Midnight Purple**, **Slate Minimal**, and **Arctic Blue**.
- **Dark Mode & Light Mode**:
  - Fully responsive color palettes supporting both premium dark glassmorphism and clean light editorial aesthetics.
- **Hardware-Accelerated Micro-Motion**:
  - Powered by Framer Motion for smooth spring animations, layout transitions, button tap scaling, and modal entrance/exit animations.
- **Sound & Haptic Engine**:
  - Subtle web audio effects and device vibration feedback (`navigator.vibrate`) for interactive tactile feedback.

---

## 7. Local-First Privacy, Cloud Backup & Export
- **100% Local-First Storage**:
  - All financial data, transactions, custom categories, and cards are stored locally on the user's device via Zustand persistence.
- **Optional Firebase Cloud Sync**:
  - One-tap Google authentication and Firebase Firestore synchronization for cross-device backup and restoration.
- **Data Portability (`PrivacyModal.tsx`)**:
  - Export full JSON backups (`cozify_backup_*.json`) or restore from offline backup files anytime.
