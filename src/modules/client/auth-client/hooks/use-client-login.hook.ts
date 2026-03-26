import { useState } from "react";
import { loginCustomer, getCustomerProfile } from "@/apis/endpointsCLIENT";
import { useClientAuthStore } from "../stores/client-auth.store";
import { useLoadingStore } from "@/stores/loading.store";
import { HttpError } from "@/apis";
import { resetAuthRedirecting } from "@/apis/axios.config";
import type { CustomerLoginRequest } from "@/apis/endpointsCLIENT/customerAuth.api";

export const useClientLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setAuthLoading } = useClientAuthStore();
  const { increment: incrementGlobalLoading, decrement: decrementGlobalLoading } = useLoadingStore();

  const login = async (data: CustomerLoginRequest) => {
    setIsLoading(true);
    setAuthLoading(true);
    incrementGlobalLoading();
    setError(null);

    try {
      resetAuthRedirecting();

      // httpClient throw error nếu thất bại — không cần check success
      await loginCustomer(data);

      const userData = await getCustomerProfile();

      // Set user in store
      setUser(userData);

      return {
        success: true,
        user: userData,
        message: "Đăng nhập thành công",
      };
    } catch (err) {
      console.error("❌ Login Error:", err);
      
      const errorMessage =
        err instanceof HttpError
          ? err.message
          : "Đăng nhập thất bại. Vui lòng thử lại.";
      
      setError(errorMessage);
      
      return {
        success: false,
        user: null,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
      setAuthLoading(false);
      decrementGlobalLoading();
    }
  };

  return {
    login,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
