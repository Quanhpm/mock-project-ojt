import { useState, useCallback } from "react";
import { getCustomerProfile, logoutCustomer } from "@/apis/endpointsCLIENT";
import { useClientAuthStore } from "../stores/client-auth.store";
import { HttpError } from "@/apis";

export const useClientAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoggedIn, setUser, clearAuth, setIsInitialized } =
    useClientAuthStore();

  /**
   * Initialize auth by fetching user profile
   * Should be called on app mount
   */
  const initializeAuth = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getCustomerProfile();
      const userData = response.data?.data?.user || response.data?.user || response.data;
      setUser(userData);
      return true;
    } catch {
      // If profile fetch fails, user is not authenticated
      clearAuth();
      return false;
    } finally {
      setIsInitialized(true);
      setIsLoading(false);
    }
  }, [setUser, clearAuth, setIsInitialized]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await logoutCustomer();
      clearAuth();
      
      return {
        success: true,
        message: "Đăng xuất thành công",
      };
    } catch (err) {
      // Even if logout API fails, clear local state
      clearAuth();
      
      const errorMessage =
        err instanceof HttpError
          ? err.message
          : "Đăng xuất thất bại";
      
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [clearAuth]);

  /**
   * Refresh user profile
   */
  const refreshProfile = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getCustomerProfile();
      const userData = response.data?.data?.user || response.data?.user || response.data;
      setUser(userData);
      return {
        success: true,
        user: userData,
      };
    } catch {
      return {
        success: false,
        user: null,
      };
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  return {
    user,
    isLoggedIn,
    isLoading,
    initializeAuth,
    logout,
    refreshProfile,
  };
};
