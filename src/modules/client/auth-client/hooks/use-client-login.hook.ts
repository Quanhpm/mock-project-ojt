import { useState } from "react";
import { loginCustomer } from "@/apis/endpointsCLIENT";
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
      const response = await loginCustomer(data);
      
      // Handle different response structures
      const userData = response.data?.data?.user || response.data?.user || response.data;
      const message = response.data?.message || "Đăng nhập thành công";
      
      if (!userData) {
        throw new Error("Invalid response structure from server");
      }
      
      // Set user in store
      setUser(userData);
      
      return {
        success: true,
        user: userData,
        message: message,
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
