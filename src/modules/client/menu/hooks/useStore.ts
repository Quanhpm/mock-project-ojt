import { create } from 'zustand'

export interface Store {
    franchiseId: string | "";
    setFranchiseId: (newFranchiseId: string) => void
}

export const useStore = create<Store>((set) => ({
    franchiseId: "",
    setFranchiseId: (newFranchiseId) => set({ franchiseId: newFranchiseId }),
}))