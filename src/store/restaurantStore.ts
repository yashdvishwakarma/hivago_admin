import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RestaurantState {
  activeRestaurantId: string | null;
  setActiveRestaurantId: (id: string) => void;
}

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set) => ({
      activeRestaurantId: null,
      setActiveRestaurantId: (id) => set({ activeRestaurantId: id }),
    }),
    {
      name: 'hivago-restaurant-storage',
    }
  )
);
