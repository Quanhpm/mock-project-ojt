import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ClientUser {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

interface ClientAuthState {
  user: ClientUser | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
  authLoading: boolean;

  login: (user: ClientUser) => void;
  logout: () => void;
  hydrate: () => void;
  updateUser: (user: Partial<ClientUser>) => void;
  setAuthLoading: (loading: boolean) => void;
}

export const useClientAuthStore = create<ClientAuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isInitialized: false,
      authLoading: false,

      login: (user) => {
        set({ user, isLoggedIn: true });
      },

      logout: () => {
        set({ user: null, isLoggedIn: false });
      },

      hydrate: () => {
        set({ isInitialized: true });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      setAuthLoading: (loading) => {
        set({ authLoading: loading });
      },
    }),
    {
      name: 'client-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
