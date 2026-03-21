import { create } from 'zustand';

export interface ClientUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
  address: string;
  is_active: boolean;
  is_deleted: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface ClientAuthState {
  user: ClientUser | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
  authLoading: boolean;

  setUser: (user: ClientUser | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setAuthLoading: (loading: boolean) => void;
  updateUser: (user: Partial<ClientUser>) => void;
  clearAuth: () => void;
}

/**
 * Client Authentication Store (Cookie-based, NO localStorage)
 * 
 * This store manages the client-side authentication state using cookies.
 * Authentication tokens are stored in httpOnly cookies by the backend,
 * so we don't persist any sensitive data in localStorage.
 */
export const useClientAuthStore = create<ClientAuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isInitialized: false,
  authLoading: false,

  setUser: (user) => {
    set({ user, isLoggedIn: !!user });
  },

  setIsLoggedIn: (isLoggedIn) => {
    set({ isLoggedIn });
  },

  setIsInitialized: (isInitialized) => {
    set({ isInitialized });
  },

  setAuthLoading: (loading) => {
    set({ authLoading: loading });
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },

  clearAuth: () => {
    set({ user: null, isLoggedIn: false });
  },
}));
