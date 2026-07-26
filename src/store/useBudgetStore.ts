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
  | null;
export type AppTheme = 
  | 'material-design' 
  | 'glassmorphism' 
  | 'neumorphism' 
  | 'minimalist-theme' 
  | 'gradient-theme';

interface BudgetState {
  user: UserProfile | null;
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
  
  // Actions
  setUser: (user: UserProfile | null) => void;
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
  setDailyBudget: (budget: number) => void;
  addCard: (card: Omit<PaymentCard, 'id'>) => void;
  deleteCard: (id: string) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
  updateNotificationSettings: (settings: Partial<BudgetState['notificationSettings']>) => void;
  updateUserProfile: (profile: { displayName?: string | null; photoURL?: string | null }) => void;
  wipeAllData: () => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      authLoading: true,
      dailyBudget: 2000,
      transactions: [],
      cardsCount: 0,
      cards: [],
      goals: [],
      activeModal: null,
      isCloudBackupEnabled: false,
      lastBackupTime: null,
      theme: 'material-design',
      colorMode: 'dark',
      notificationSettings: {
        dailyReminder: false,
        budgetAlerts: true,
        weeklySummary: false,
      },

      setActiveModal: (modal) => set({ activeModal: modal }),

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
        set({
          user,
          isAuthenticated: !!user,
          authLoading: false,
        }),

      setAuthLoading: (authLoading) => set({ authLoading }),

      logoutUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          authLoading: false,
        }),

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

      wipeAllData: () => {
        set({
          user: null,
          isAuthenticated: false,
          dailyBudget: 2000,
          transactions: [],
          cardsCount: 0,
          cards: [],
          goals: [],
          activeModal: null,
          isCloudBackupEnabled: false,
          lastBackupTime: null,
          theme: 'material-design',
          colorMode: 'dark',
          notificationSettings: {
            dailyReminder: false,
            budgetAlerts: true,
            weeklySummary: false,
          },
        });
      },
    }),
    {
      name: 'budtrack-storage-v2',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        dailyBudget: state.dailyBudget,
        transactions: state.transactions,
        cardsCount: state.cardsCount,
        cards: state.cards,
        goals: state.goals,
        isCloudBackupEnabled: state.isCloudBackupEnabled,
        lastBackupTime: state.lastBackupTime,
        theme: state.theme,
        colorMode: state.colorMode,
        notificationSettings: state.notificationSettings,
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
    }
  )
);
