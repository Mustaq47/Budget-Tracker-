import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dinero, toDecimal, add } from 'dinero.js';
import { SavingsGoal, useBudgetStore } from './useBudgetStore';
import { getCurrencyObj, toSubunits } from '../utils/dineroUtils';

interface GoalsState {
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  deleteGoal: (id: string) => void;
  editGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
  setGoals: (goals: SavingsGoal[]) => void;
  wipeGoals: () => void;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goals: [],
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
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),
      editGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),
      contributeToGoal: (goalId, amount) => {
        set((state) => {
          const currency = useBudgetStore.getState().currency;
          const cObj = getCurrencyObj(currency);
          const updatedGoals = state.goals.map((g) => {
            if (g.id === goalId) {
              const currentDinero = dinero({ amount: toSubunits(g.currentAmount, cObj), currency: cObj });
              const addDinero = dinero({ amount: toSubunits(amount, cObj), currency: cObj });
              const totalDinero = add(currentDinero, addDinero);
              return { ...g, currentAmount: Number(toDecimal(totalDinero)) };
            }
            return g;
          });
          return {
            goals: updatedGoals,
          };
        });
      },
      setGoals: (goals) => set({ goals }),
      wipeGoals: () => set({ goals: [] }),
    }),
    {
      name: 'budtrack-goals-storage',
    }
  )
);

export const selectGoals = (state: GoalsState) => state.goals;
