import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  time: string;
  date: string; // YYYY-MM-DD
  type: 'expense' | 'income';
  glow?: 'purple' | 'blue' | 'pink' | 'gold';
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

export interface PaymentCard {
  id: string;
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cardType: 'Visa' | 'Mastercard' | 'Amex';
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
  | 'cards' 
  | 'budget' 
  | 'goals' 
  | 'expense' 
  | 'profile-settings' 
  | 'notifications' 
  | 'privacy-security' 
  | 'language-region'
  | 'help-center'
  | 'privacy-policy'
  | 'terms-conditions'
  | 'report'
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
  cardsCount: number;
  cards: PaymentCard[];
  goals: SavingsGoal[];
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
  
  // Actions
  setHasAcceptedTerms: (accepted: boolean) => void;
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
  restoreCloudState: (payload: { dailyBudget: number; transactions: Transaction[]; cards: PaymentCard[]; goals: SavingsGoal[] }) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransactionCategory: (id: string, category: string) => void;
  setDailyBudget: (budget: number) => void;
  addCard: (card: Omit<PaymentCard, 'id'>) => void;
  deleteCard: (id: string) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
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
      cardsCount: 0,
      cards: [],
      goals: [],
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

      setHasAcceptedTerms: (hasAcceptedTerms) => set({ hasAcceptedTerms }),

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
        set({
          dailyBudget: payload.dailyBudget ?? 2000,
          transactions: Array.isArray(payload.transactions) ? payload.transactions : [],
          cards: Array.isArray(payload.cards) ? payload.cards : [],
          cardsCount: Array.isArray(payload.cards) ? payload.cards.length : 0,
          goals: Array.isArray(payload.goals) ? payload.goals : [],
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
              cardsCount: 0,
              cards: [],
              goals: [],
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
          cardsCount: 0,
          cards: [],
          goals: [],
          activeModal: null,
          isCloudBackupEnabled: false,
          lastBackupTime: null,
        });
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            window.localStorage.removeItem('budtrack-storage-v2');
          } catch (_) {}
        }
      },

      addTransaction: (tx) => {
        const todayISO = new Date().toISOString().split('T')[0];
        const newTransaction: Transaction = {
          ...tx,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
          date: todayISO,
        };

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

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

      addCard: (card) => {
        const newCard: PaymentCard = {
          ...card,
          id: 'card-' + Date.now(),
        };
        set((state) => ({
          cards: [...state.cards, newCard],
          cardsCount: state.cards.length + 1,
        }));
      },

      deleteCard: (id) => {
        set((state) => {
          const updatedCards = state.cards.filter((c) => c.id !== id);
          return {
            cards: updatedCards,
            cardsCount: updatedCards.length,
          };
        });
      },

      addGoal: (goal) => {
        const newGoal: SavingsGoal = {
          ...goal,
          id: 'goal-' + Date.now(),
          currentAmount: 0,
        };
        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },

      contributeToGoal: (goalId, amount) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        set((state) => {
          const updatedGoals = state.goals.map((g) =>
            g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
          );
          const goal = state.goals.find((g) => g.id === goalId);
          const title = goal ? `Goal: ${goal.title}` : 'Savings Contribution';

          // Automatically record as an expense transaction
          const newTx: Transaction = {
            id: 'tx-goal-' + Date.now(),
            title,
            amount,
            category: 'Savings',
            time: timeStr,
            date: now.toISOString().split('T')[0],
            type: 'expense',
            glow: 'gold',
          };

          return {
            goals: updatedGoals,
            transactions: [newTx, ...state.transactions],
          };
        });
      },

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
          cardsCount: 0,
          cards: [],
          goals: [],
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
        // ponytail: never persist isAuthenticated/user in localStorage; let Firebase Auth control session truth
        dailyBudget: state.dailyBudget,
        transactions: state.transactions,
        customCategories: state.customCategories,
        cards: state.cards,
        goals: state.goals,
        isCloudBackupEnabled: state.isCloudBackupEnabled,
        lastBackupTime: state.lastBackupTime,
        theme: state.theme,
        colorMode: state.colorMode,
        notificationSettings: state.notificationSettings,
        currency: state.currency,
        language: state.language,
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
export const selectCards = (state: BudgetState) => state.cards;
export const selectCardsCount = (state: BudgetState) => state.cards.length;
export const selectGoals = (state: BudgetState) => state.goals;

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

