import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface MenuStoreState {
  franchiseId: string;
  setFranchiseId: (newFranchiseId: string) => void;
}

export const useStore = create<MenuStoreState>()(
  persist(
    (set) => ({
      franchiseId: '',
      setFranchiseId: (newFranchiseId) => set({ franchiseId: newFranchiseId }),
    }),
    {
      name: 'client-menu-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ franchiseId: state.franchiseId }),
    },
  ),
);