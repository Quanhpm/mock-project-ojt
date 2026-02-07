import { create } from "zustand";
import { LOCAL_STORAGE } from "@/consts";
import { getItemInLocalStorage, setItemInLocalStorage, removeItemInLocalStorage } from "@/utils";
import type { UserAccount } from "@/types";
import { getRoleCode, getFranchiseId } from '../utils/auth-helpers';

interface AdminAuthState {
  admin: UserAccount | null;
  roleCode: string | null;        // ✨ ADD
  franchiseId: number | null;     // ✨ ADD
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
  roleCode: null,                 // ✨ ADD
  franchiseId: null,              // ✨ ADD
  token: null,
  isLoggedIn: false,
  isLoading: false,

  setAdmin: (admin) => {
    const roleCode = getRoleCode(admin.id);          // ✨ ADD
    const franchiseId = getFranchiseId(admin.id);    // ✨ ADD
    
    setItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_ADMIN, admin);
    set({ 
      admin, 
      roleCode,        // ✨ ADD
      franchiseId,     // ✨ ADD
      isLoggedIn: true 
    });
  },

  setToken: (token) => {
    set({ token });
  },

  logout: () => {
    removeItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_ADMIN);
    set({ 
      admin: null, 
      roleCode: null,      // ✨ ADD
      franchiseId: null,   // ✨ ADD
      token: null, 
      isLoggedIn: false 
    });
  },

  hydrate: () => {
    const savedAdmin = getItemInLocalStorage<UserAccount>(LOCAL_STORAGE.ACCOUNT_ADMIN);
    if (savedAdmin) {
      const roleCode = getRoleCode(savedAdmin.id);       // ✨ ADD
      const franchiseId = getFranchiseId(savedAdmin.id); // ✨ ADD
      
      set({ 
        admin: savedAdmin, 
        roleCode,        // ✨ ADD
        franchiseId,     // ✨ ADD
        isLoggedIn: true 
      });
    }
  },
}));