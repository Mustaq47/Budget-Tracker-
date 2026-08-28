import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dinero, toDecimal, add, subtract } from 'dinero.js';
import * as currencies from 'dinero.js/currencies';

const getCurrencyObj = (cCode: string) => {
  return (currencies as any)[cCode] || (currencies as any).USD;
};
const toSubunits = (amount: number, currencyObj: any) => {
  const factor = currencyObj.base ** currencyObj.exponent;
  return Math.round(amount * factor);
};

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  time: string;
  date: string; // YYYY-MM-DD
  type: 'expense' | 'income';
  glow?: 'purple' | 'blue' | 'pink' | 'gold';
  tripId?: string;
  goalId?: string;
}

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  age?: number | null;
  gender?: string | null;
}

export interface Trip {
  id: string;
  title: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  gradient: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  glow: 'purple' | 'blue' | 'pink' | 'gold';
}

export type QuickActionModal =
  | 'wallet'
  | 'trips'
  | 'budget'
  | 'goals'
  | 'expense'
  | 'safe-to-spend'
  | 'profile-settings'
  | 'notifications'
  | 'privacy-security'
  | 'language-region'
  | 'help-center'
  | 'privacy-policy'
  | 'terms-conditions'
  | 'feedback'
  | 'report'
  | 'app-version'
  | null;
export type AppTheme =
  | 'material-design'
  | 'glassmorphism'
  | 'neumorphism'
  | 'minimalist-theme'
  | 'gradient-theme';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';
export type LanguageCode = 'en' | 'te' | 'hi' | 'ar' | 'zh' | 'kw' | 'cs' | 'nl' | 'fr' | 'de' | 'el' | 'he' | 'it' | 'ja' | 'kk' | 'ko' | 'pl' | 'pt' | 'ru' | 'es' | 'tl' | 'vi';

export const currencySymbols: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

interface BudgetState {
  user: UserProfile | null;
  lastUserUid: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  dailyBudget: number;
  transactions: Transaction[];
  activeModal: QuickActionModal;
  isCloudBackupEnabled: boolean;
  lastBackupTime: string | null;
  theme: AppTheme;
  colorMode: 'dark' | 'light';
  notificationSettings: {
    dailyReminder: boolean;
    budgetAlerts: boolean;
    weeklySummary: boolean;
  };
  currency: CurrencyCode;
  language: LanguageCode;
  hasAcceptedTerms: boolean;
  currentStreak: number;
  bestStreak: number;
  hasCompletedOnboarding: boolean;
  lastBudgetSetMonth: string | null;
  budgetViewMode: 'daily' | 'monthly';
  appVersion: string;
  autoCheckUpdates: boolean;

  // Actions
  setAppVersion: (version: string) => void;
  setAutoCheckUpdates: (val: boolean) => void;
  setBudgetViewMode: (mode: 'daily' | 'monthly') => void;
  setHasAcceptedTerms: (accepted: boolean) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setLastBudgetSetMonth: (month: string) => void;
  setStreaks: (current: number, best: number) => void;
  setUser: (user: UserProfile | null) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setLanguage: (language: LanguageCode) => void;
  setAuthLoading: (loading: boolean) => void;
  logoutUser: () => void;
  setActiveModal: (modal: QuickActionModal) => void;
  setTheme: (theme: AppTheme) => void;
  setColorMode: (mode: 'dark' | 'light') => void;
  toggleColorMode: () => void;
  setCloudBackupEnabled: (enabled: boolean) => void;
  setLastBackupTime: (time: string | null) => void;
  restoreCloudState: (payload: { dailyBudget: number; transactions: Transaction[]; customCategories: string[] }) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransactionCategory: (id: string, category: string) => void;
  setDailyBudget: (budget: number) => void;
  updateNotificationSettings: (settings: Partial<BudgetState['notificationSettings']>) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  wipeAllData: () => void;
  savedAccounts: UserProfile[];
  addSavedAccount: (profile: UserProfile) => void;
  switchAccount: (uid: string) => void;
  removeSavedAccount: (uid: string) => void;
  customCategories: string[];
  addCustomCategory: (categoryName: string) => void;
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      user: null,
      lastUserUid: null,
      savedAccounts: [],
      isAuthenticated: false,
      authLoading: true,
      _hasHydrated: false,
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
      dailyBudget: 2000,
      transactions: [],
      customCategories: [],
      activeModal: null,
      isCloudBackupEnabled: false,
      lastBackupTime: null,
      theme: 'material-design',
      colorMode: 'light',
      notificationSettings: {
        dailyReminder: false,
        budgetAlerts: true,
        weeklySummary: false,
      },
      currency: 'INR',
      language: 'en',
      hasAcceptedTerms: true,
      currentStreak: 0,
      bestStreak: 0,
      hasCompletedOnboarding: false,
      lastBudgetSetMonth: null,
      budgetViewMode: 'daily',
      appVersion: '1.0.4',
      autoCheckUpdates: true,

      setAppVersion: (appVersion) => set({ appVersion }),
      setAutoCheckUpdates: (autoCheckUpdates) => set({ autoCheckUpdates }),
      setBudgetViewMode: (budgetViewMode) => set({ budgetViewMode }),
      setHasAcceptedTerms: (hasAcceptedTerms) => set({ hasAcceptedTerms }),
      setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
      setLastBudgetSetMonth: (lastBudgetSetMonth) => set({ lastBudgetSetMonth }),
      setStreaks: (currentStreak, bestStreak) => set({ currentStreak, bestStreak }),

      setActiveModal: (modal) => set({ activeModal: modal }),

      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),

      setTheme: (theme) => set({ theme }),

      setColorMode: (colorMode) => set({ colorMode }),

      toggleColorMode: () =>
        set((state) => ({ colorMode: state.colorMode === 'dark' ? 'light' : 'dark' })),

      setCloudBackupEnabled: (isCloudBackupEnabled) => set({ isCloudBackupEnabled }),

      setLastBackupTime: (lastBackupTime) => set({ lastBackupTime }),

      restoreCloudState: (payload) =>
        set((state) => {
          const prefs = (payload as any).preferences || {};

          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

          // 1. Keep local transactions older than 90 days
          const localOlder = (state.transactions || []).filter((t) => {
            const txDate = new Date(t.date);
            return txDate < ninetyDaysAgo;
          });

          // 2. Format cloud transactions and restore title if missing
          const cloudTx = (Array.isArray(payload.transactions) ? payload.transactions : []).map((t) => {
            const defaultLabel = t.type === "income" ? "Income" : "Expense";
            return {
              ...t,
              title: t.title || (t.category === defaultLabel ? t.category : `${t.category} ${defaultLabel}`),
            };
          });

          // 3. Merge and deduplicate
          const seenIds = new Set(cloudTx.map((t) => t.id));
          const filteredLocalOlder = localOlder.filter((t) => !seenIds.has(t.id));

          const merged = [...cloudTx, ...filteredLocalOlder];
          merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          return {
            dailyBudget: payload.dailyBudget ?? 2000,
            transactions: merged,
            customCategories: Array.isArray(payload.customCategories) ? payload.customCategories : [],
            ...(prefs.currency ? { currency: prefs.currency } : {}),
            ...(prefs.language ? { language: prefs.language } : {}),
            ...(prefs.budgetViewMode ? { budgetViewMode: prefs.budgetViewMode } : {}),
            ...(prefs.appVersion ? { appVersion: prefs.appVersion } : {}),
          };
        }),

      setUser: (user) =>
        set((state) => {
          const existingSaved = state.savedAccounts || [];
          const updatedSavedAccounts = user
            ? [
              user,
              ...existingSaved.filter((acc) => acc.uid !== user.uid),
            ]
            : existingSaved;

          if (user && state.lastUserUid && state.lastUserUid !== user.uid) {
            return {
              user,
              lastUserUid: user.uid,
              isAuthenticated: true,
              authLoading: false,
              dailyBudget: 2000,
              transactions: [],
              activeModal: null,
              isCloudBackupEnabled: false,
              lastBackupTime: null,
              savedAccounts: updatedSavedAccounts,
            };
          }
          return {
            user,
            lastUserUid: user?.uid || state.lastUserUid || null,
            isAuthenticated: !!user,
            authLoading: false,
            savedAccounts: updatedSavedAccounts,
          };
        }),

      addSavedAccount: (profile) =>
        set((state) => {
          const existing = (state.savedAccounts || []).filter((acc) => acc.uid !== profile.uid);
          const newAccounts = [profile, ...existing];
          return {
            savedAccounts: newAccounts,
            user: profile,
            lastUserUid: profile.uid,
            isAuthenticated: true,
          };
        }),

      switchAccount: (uid) =>
        set((state) => {
          const target = (state.savedAccounts || []).find((acc) => acc.uid === uid);
          if (!target) return state;
          return {
            user: target,
            lastUserUid: target.uid,
            isAuthenticated: true,
          };
        }),

      removeSavedAccount: (uid) =>
        set((state) => {
          const remaining = (state.savedAccounts || []).filter((acc) => acc.uid !== uid);
          let newActiveUser = state.user;
          let newIsAuthenticated = state.isAuthenticated;
          if (state.user?.uid === uid) {
            newActiveUser = remaining.length > 0 ? remaining[0] : null;
            newIsAuthenticated = remaining.length > 0;
          }
          return {
            savedAccounts: remaining,
            user: newActiveUser,
            lastUserUid: newActiveUser?.uid || null,
            isAuthenticated: newIsAuthenticated,
          };
        }),

      setAuthLoading: (authLoading) => set({ authLoading }),

      logoutUser: () => {
        set({
          user: null,
          lastUserUid: null,
          isAuthenticated: false,
          authLoading: false,
          dailyBudget: 2000,
          transactions: [],
          activeModal: null,
          isCloudBackupEnabled: false,
          lastBackupTime: null,
        });
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            window.localStorage.removeItem('budtrack-storage-v2');
            window.localStorage.removeItem('cozify_iam_role_assignments');
            window.localStorage.removeItem('cozify_support_tickets_cache');
          } catch (_) { }
        }
      },

      addTransaction: (tx) => {
        const _d = new Date();
        const todayLocal = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`;
        const newTransaction: Transaction = {
          ...tx,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
          date: todayLocal,
        };

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      deleteTransaction: (id) =>
        set((state) => {
          const tx = state.transactions.find((t) => t.id === id);
          let newDailyBudget = state.dailyBudget;

          if (tx) {
            if (tx.tripId) {
              import('./useTripsStore').then(({ useTripsStore }) => {
                useTripsStore.getState().updateTripSpent(tx.tripId!, -tx.amount);
              });
            } else if (tx.goalId) {
              import('./useGoalsStore').then(({ useGoalsStore }) => {
                useGoalsStore.getState().contributeToGoal(tx.goalId!, -tx.amount);
              });
            }

            // Restore daily budget if an income is deleted
            if (tx.type === "income" && tx.category === "Income") {
              const cObj = getCurrencyObj(state.currency);
              const currentDinero = dinero({ amount: toSubunits(state.dailyBudget, cObj), currency: cObj });
              const subDinero = dinero({ amount: toSubunits(tx.amount, cObj), currency: cObj });
              let newTotal = subtract(currentDinero, subDinero);
              
              if (Number(toDecimal(newTotal)) < 0) {
                newTotal = dinero({ amount: 0, currency: cObj });
              }
              newDailyBudget = Number(toDecimal(newTotal));
            }
          }
          
          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            dailyBudget: newDailyBudget,
          };
        }),

      updateTransactionCategory: (id, category) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? {
                ...t,
                category,
                title: `${category} ${t.type === "income" ? "Income" : "Expense"}`,
              }
              : t
          ),
        })),

      setDailyBudget: (dailyBudget) => set({ dailyBudget }),





      updateNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        })),

      updateUserProfile: (profile) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...profile } : null,
        })),

      addCustomCategory: (categoryName) => {
        const trimmed = categoryName.trim();
        if (!trimmed) return;
        set((state) => {
          const exists = state.customCategories.some(
            (c) => c.toLowerCase() === trimmed.toLowerCase()
          );
          if (exists) return state;
          return {
            customCategories: [...state.customCategories, trimmed],
          };
        });
      },

      wipeAllData: () => {
        set({
          user: null,
          isAuthenticated: false,
          dailyBudget: 2000,
          transactions: [],
          customCategories: [],
          activeModal: null,
          isCloudBackupEnabled: false,
          lastBackupTime: null,
          theme: 'material-design',
          colorMode: 'light',
          notificationSettings: {
            dailyReminder: false,
            budgetAlerts: true,
            weeklySummary: false,
          },
          currency: 'INR',
          language: 'en',
        });
      },
    }),
    {
      name: 'budtrack-storage-v2',
      partialize: (state) => ({
        lastUserUid: state.lastUserUid,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        dailyBudget: state.dailyBudget,
        transactions: state.transactions,
        customCategories: state.customCategories,
        isCloudBackupEnabled: state.isCloudBackupEnabled,
        lastBackupTime: state.lastBackupTime,
        theme: state.theme,
        colorMode: state.colorMode,
        notificationSettings: state.notificationSettings,
        currency: state.currency,
        language: state.language,
        lastBudgetSetMonth: state.lastBudgetSetMonth,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        budgetViewMode: state.budgetViewMode,
        appVersion: state.appVersion,
      }),
      migrate: (persistedState: any) => {
        if (persistedState && persistedState.theme) {
          const legacyThemes = ['cyber-neon', 'dark-theme', 'light-theme'];
          if (legacyThemes.includes(persistedState.theme)) {
            persistedState.theme = 'material-design';
          }
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

// Atomic Selectors for minimal subscription re-renders
export const selectUserAuth = (state: BudgetState) => ({
  user: state.user,
  lastUserUid: state.lastUserUid,
  savedAccounts: state.savedAccounts,
  isAuthenticated: state.isAuthenticated,
  authLoading: state.authLoading,
  _hasHydrated: state._hasHydrated,
});

export const selectTransactions = (state: BudgetState) => state.transactions;
export const selectDailyBudget = (state: BudgetState) => state.dailyBudget;

export const selectThemeSettings = (state: BudgetState) => ({
  theme: state.theme,
  colorMode: state.colorMode,
  currency: state.currency,
  language: state.language,
});

export const selectBackupState = (state: BudgetState) => ({
  isCloudBackupEnabled: state.isCloudBackupEnabled,
  lastBackupTime: state.lastBackupTime,
});
