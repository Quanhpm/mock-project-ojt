import { create } from "zustand";

interface AdminGlobalFranchiseScopeState {
  selectedFranchiseId: string | null;
  setSelectedFranchiseId: (franchiseId: string | null) => void;
  clearSelectedFranchiseId: () => void;
}

export const useAdminGlobalFranchiseScopeStore =
  create<AdminGlobalFranchiseScopeState>()((set) => ({
    selectedFranchiseId: null,
    setSelectedFranchiseId: (selectedFranchiseId) => set({ selectedFranchiseId }),
    clearSelectedFranchiseId: () => set({ selectedFranchiseId: null }),
  }));

export const resetAdminGlobalFranchiseScope = () => {
  useAdminGlobalFranchiseScopeStore.getState().clearSelectedFranchiseId();
};
