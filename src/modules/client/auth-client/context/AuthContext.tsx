import React, { createContext, useEffect } from "react";
import { useClientAuth } from "../hooks/use-client-auth.hook";
import type { ClientUser } from "../stores/client-auth.store";

export interface AuthContextValue {
  user: ClientUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  logout: () => Promise<{ success: boolean; message: string }>;
  refreshProfile: () => Promise<{ success: boolean; user: ClientUser | null }>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider - Manages global authentication state
 * 
 * - Automatically fetches user profile on mount
 * - Provides auth context to all child components
 * - Uses cookie-based authentication (no localStorage)
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, isLoggedIn, isLoading, initializeAuth, logout, refreshProfile } =
    useClientAuth();
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    // Initialize auth on app mount
    initializeAuth().finally(() => {
      setIsInitialized(true);
    });
  }, [initializeAuth]);

  const value: AuthContextValue = {
    user,
    isLoggedIn,
    isLoading,
    isInitialized,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
