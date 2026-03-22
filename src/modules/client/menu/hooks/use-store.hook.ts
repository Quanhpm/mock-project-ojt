import { create } from 'zustand';

export interface MenuStoreState {
  franchiseId: string;
  setFranchiseId: (newFranchiseId: string) => void;
}

export const useStore = create<MenuStoreState>((set) => ({
  franchiseId: '',
  setFranchiseId: (newFranchiseId) => set({ franchiseId: newFranchiseId }),
}));