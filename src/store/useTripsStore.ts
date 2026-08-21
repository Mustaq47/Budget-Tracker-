import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dinero, toDecimal, add } from 'dinero.js';
import { Trip, useBudgetStore } from './useBudgetStore';
import * as currencies from 'dinero.js/currencies';

const getCurrencyObj = (cCode: string) => {
  return (currencies as any)[cCode] || (currencies as any).USD;
};
const toSubunits = (amount: number, currencyObj: any) => {
  const factor = currencyObj.base ** currencyObj.exponent;
  return Math.round(amount * factor);
};

interface TripsState {
  trips: Trip[];
  tripsCount: number;
  addTrip: (trip: Omit<Trip, 'id' | 'spent'>) => void;
  removeTrip: (id: string) => void;
  updateTripSpent: (id: string, amount: number) => void;
  editTrip: (id: string, updates: Partial<Trip>) => void;
  setTrips: (trips: Trip[]) => void;
  wipeTrips: () => void;
}

export const useTripsStore = create<TripsState>()(
  persist(
    (set) => ({
      trips: [],
      tripsCount: 0,
      addTrip: (trip) => {
        const newTrip: Trip = {
          ...trip,
          id: 'trip-' + Date.now(),
          spent: 0,
        };
        set((state) => ({
          trips: [...state.trips, newTrip],
          tripsCount: state.trips.length + 1,
        }));
      },
      removeTrip: (id) => {
        set((state) => {
          const updatedTrips = state.trips.filter((c) => c.id !== id);
          return {
            trips: updatedTrips,
            tripsCount: updatedTrips.length,
          };
        });
      },
      updateTripSpent: (id, amount) => {
        set((state) => {
          const currency = useBudgetStore.getState().currency;
          const cObj = getCurrencyObj(currency);
          return {
            trips: state.trips.map((trip) => {
              if (trip.id === id) {
                const spentDinero = dinero({ amount: toSubunits(trip.spent, cObj), currency: cObj });
                const addDinero = dinero({ amount: toSubunits(amount, cObj), currency: cObj });
                const totalDinero = add(spentDinero, addDinero);
                return { ...trip, spent: Number(toDecimal(totalDinero)) };
              }
              return trip;
            })
          };
        });
      },
      editTrip: (id, updates) =>
        set((state) => ({
          trips: state.trips.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      setTrips: (trips) => set({ trips, tripsCount: trips.length }),
      wipeTrips: () => set({ trips: [], tripsCount: 0 }),
    }),
    {
      name: 'budtrack-trips-storage',
    }
  )
);

export const selectTrips = (state: TripsState) => state.trips;
export const selectTripsCount = (state: TripsState) => state.tripsCount;
