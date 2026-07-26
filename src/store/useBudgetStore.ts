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

export type QuickActionModal = 'wallet' | 'cards' | 'budget' | 'goals' | 'expense' | null;

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
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  setAuthLoading: (loading: boolean) => void;
  logoutUser: () => void;
  setActiveModal: (modal: QuickActionModal) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: string) => void;
  setDailyBudget: (budget: number) => void;
  addCard: (card: Omit<PaymentCard, 'id'>) => void;
  deleteCard: (id: string) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
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

      setActiveModal: (modal) => set({ activeModal: modal }),

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
      }),
    }
  )
);
