import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CustomerOption } from "../models/customer.models";

interface PosSessionState {
  sessionFranchiseId: string | null;
  selectedCustomer: CustomerOption | null;
  activeCartId: string | null;
  selectedCategory: string;
  searchQuery: string;
  customerKeyword: string;
  setSessionFranchiseId: (franchiseId: string | null) => void;
  setSelectedCustomer: (customer: CustomerOption | null) => void;
  setActiveCartId: (cartId: string | null) => void;
  setSelectedCategory: (categoryId: string) => void;
  setSearchQuery: (query: string) => void;
  setCustomerKeyword: (keyword: string) => void;
  resetSession: () => void;
}

const createDefaultSessionState = () => ({
  sessionFranchiseId: null,
  selectedCustomer: null,
  activeCartId: null,
  selectedCategory: "all",
  searchQuery: "",
  customerKeyword: "",
});

export const usePosSessionStore = create<PosSessionState>()(
  persist(
    (set) => ({
      ...createDefaultSessionState(),
      setSessionFranchiseId: (sessionFranchiseId) => set({ sessionFranchiseId }),
      setSelectedCustomer: (selectedCustomer) => set({ selectedCustomer }),
      setActiveCartId: (activeCartId) => set({ activeCartId }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setCustomerKeyword: (customerKeyword) => set({ customerKeyword }),
      resetSession: () =>
        set({
          ...createDefaultSessionState(),
        }),
    }),
    {
      name: "admin-order-pos-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        sessionFranchiseId: state.sessionFranchiseId,
        selectedCustomer: state.selectedCustomer,
        activeCartId: state.activeCartId,
        selectedCategory: state.selectedCategory,
        searchQuery: state.searchQuery,
        customerKeyword: state.customerKeyword,
      }),
    },
  ),
);

export const resetPosSession = () => {
  usePosSessionStore.getState().resetSession();
};
