import { useState, useCallback } from "react";
import { getCustomerProfile, logoutCustomer } from "@/apis/endpointsCLIENT";
import { useClientAuthStore } from "../stores/client-auth.store";
import { useLoadingStore } from "@/stores/loading.store";
import { HttpError } from "@/apis";
import { isAuthRedirecting } from "@/apis/axios.config";

export const useClientAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoggedIn, setUser, clearAuth, setIsInitialized } =
    useClientAuthStore();
  const { increment: incrementGlobalLoading, decrement: decrementGlobalLoading } = useLoadingStore();

  /**
   * Initialize auth by fetching user profile
   * Should be called on app mount
   */
  const initializeAuth = useCallback(async () => {
    if (isAuthRedirecting()) {
      clearAuth();
      setIsInitialized(true);
      return false;
    }

    setIsLoading(true);
    incrementGlobalLoading();

    try {
      const user = await getCustomerProfile();
      setUser(user);
      return true;
    } catch (error) {
      if (
        error instanceof HttpError &&
        (error.code === "REFRESH_TOKEN_FAILED" || error.code === "TOKEN_REVOKED")
      ) {
        clearAuth();
        return false;
      }

      clearAuth();
      return false;
    } finally {
      setIsInitialized(true);
      setIsLoading(false);
      decrementGlobalLoading();
    }
  }, [setUser, clearAuth, setIsInitialized, incrementGlobalLoading, decrementGlobalLoading]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    incrementGlobalLoading();

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
      decrementGlobalLoading();
    }
  }, [clearAuth, incrementGlobalLoading, decrementGlobalLoading]);

  /**
   * Refresh user profile
   */
  const refreshProfile = useCallback(async () => {
    setIsLoading(true);

    try {
      const user = await getCustomerProfile();
      setUser(user);
      return {
        success: true,
        user,
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
