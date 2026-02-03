import { create } from "zustand";
import { LOCAL_STORAGE } from "@/consts";
import { getItemInLocalStorage, setItemInLocalStorage, removeItemInLocalStorage } from "@/utils";
import type { UserAccount } from "@/models";

interface AdminAuthState {
  admin: UserAccount | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  setAdmin: (admin: UserAccount) => void;
  setToken: (token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  token: null,
  isLoggedIn: false,
  isLoading: false,

  setAdmin: (admin) => {
    setItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_ADMIN, admin);
    set({ admin, isLoggedIn: true });
  },

  setToken: (token) => {
    set({ token });
  },

  logout: () => {
    removeItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_ADMIN);
    set({ admin: null, token: null, isLoggedIn: false });
  },

  hydrate: () => {
    const savedAdmin = getItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_ADMIN);
    if (savedAdmin) {
      set({ admin: savedAdmin, isLoggedIn: true });
    }
  },
}));
