import { useState } from "react";
import { loginCustomer, getCustomerProfile } from "@/apis/endpointsCLIENT";
import { useClientAuthStore } from "../stores/client-auth.store";
import { HttpError } from "@/apis";
import type { CustomerLoginRequest } from "@/apis/endpointsCLIENT/customerAuth.api";

export const useClientLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setAuthLoading } = useClientAuthStore();

  const login = async (data: CustomerLoginRequest) => {
    setIsLoading(true);
    setAuthLoading(true);
    setError(null);

    try {
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
    }
  };

  return {
    login,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
