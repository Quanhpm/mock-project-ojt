import { create } from "zustand";
import { LOCAL_STORAGE } from "@/consts";
import { getItemInLocalStorage, setItemInLocalStorage, removeItemInLocalStorage } from "@/utils";
import type { UserAccount } from "@/models";

interface AuthState {
  user: UserAccount | null;
  isLoggedIn: boolean;
  isInitialized: boolean;

  login: (user: UserAccount) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isInitialized: false,

  login: (user) => {
    // TODO: chỉ dùng test layout, sau này không lưu storage
    setItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_ADMIN, user);
    set({ user, isLoggedIn: true });
  },

  logout: () => {
    removeItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_ADMIN);
    set({ user: null, isLoggedIn: false });
  },

  hydrate: () => {
    const user = getItemInLocalStorage<UserAccount>(LOCAL_STORAGE.ACCOUNT_ADMIN);
    if (user) {
      set({ user, isLoggedIn: true, isInitialized: true });
    } else {
      set({ isInitialized: true });
    }
  },
}));
