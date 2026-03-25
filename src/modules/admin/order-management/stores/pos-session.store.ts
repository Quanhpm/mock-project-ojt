import { create } from "zustand";
import type { CustomerOption } from "../models/customer.models";

interface PosSessionState {
  selectedCustomer: CustomerOption | null;
  activeCartId: string | null;
  selectedCategory: string;
  searchQuery: string;
  customerKeyword: string;
  setSelectedCustomer: (customer: CustomerOption | null) => void;
  setActiveCartId: (cartId: string | null) => void;
  setSelectedCategory: (categoryId: string) => void;
  setSearchQuery: (query: string) => void;
  setCustomerKeyword: (keyword: string) => void;
  resetSession: () => void;
}

const createDefaultSessionState = () => ({
  selectedCustomer: null,
  activeCartId: null,
  selectedCategory: "all",
  searchQuery: "",
  customerKeyword: "",
});

export const usePosSessionStore = create<PosSessionState>()((set) => ({
  ...createDefaultSessionState(),
  setSelectedCustomer: (selectedCustomer) => set({ selectedCustomer }),
  setActiveCartId: (activeCartId) => set({ activeCartId }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCustomerKeyword: (customerKeyword) => set({ customerKeyword }),
  resetSession: () =>
    set({
      ...createDefaultSessionState(),
    }),
}));
