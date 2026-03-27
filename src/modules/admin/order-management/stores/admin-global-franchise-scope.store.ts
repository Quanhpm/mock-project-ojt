import { create } from "zustand";
import type { AdminGlobalFranchiseScopeKey } from "../utils/admin-global-franchise-scope";

interface AdminGlobalFranchiseScopeState {
  selections: Partial<Record<AdminGlobalFranchiseScopeKey, string | null>>;
  setSelectedFranchiseId: (
    scopeKey: AdminGlobalFranchiseScopeKey,
    franchiseId: string | null,
  ) => void;
  clearSelectedFranchiseId: (scopeKey: AdminGlobalFranchiseScopeKey) => void;
  clearAllSelectedFranchiseIds: () => void;
}

export const useAdminGlobalFranchiseScopeStore = create<AdminGlobalFranchiseScopeState>((set) => ({
  selections: {},
  setSelectedFranchiseId: (scopeKey, franchiseId) =>
    set((state) => ({
      selections: {
        ...state.selections,
        [scopeKey]: franchiseId,
      },
    })),
  clearSelectedFranchiseId: (scopeKey) =>
    set((state) => ({
      selections: {
        ...state.selections,
        [scopeKey]: null,
      },
    })),
  clearAllSelectedFranchiseIds: () => set({ selections: {} }),
}));

export const resetAdminGlobalFranchiseScope = (scopeKey?: AdminGlobalFranchiseScopeKey) => {
  const store = useAdminGlobalFranchiseScopeStore.getState();

  if (scopeKey) {
    store.clearSelectedFranchiseId(scopeKey);
    return;
  }

  store.clearAllSelectedFranchiseIds();
};
