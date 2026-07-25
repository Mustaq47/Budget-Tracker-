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

interface BudgetState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  dailyBudget: number;
  transactions: Transaction[];
  cardsCount: number;
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  setAuthLoading: (loading: boolean) => void;
  logoutUser: () => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: string) => void;
  setDailyBudget: (budget: number) => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      authLoading: true,
      dailyBudget: 2000,
      transactions: [],
      cardsCount: 1,

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
    }),
    {
      name: 'budtrack-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        dailyBudget: state.dailyBudget,
        transactions: state.transactions,
        cardsCount: state.cardsCount,
      }),
    }
  )
);
