import { useState } from "react";
import { registerCustomer } from "@/apis/endpointsCLIENT";
import { HttpError } from "@/apis";
import type { CustomerRegisterRequest } from "@/apis/endpointsCLIENT/customerAuth.api";

export const useClientRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: CustomerRegisterRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerCustomer(data);
      
      // Handle different response structures
      const userData = response.data?.data?.user || response.data?.user || response.data;
      const message = response.data?.message || "Đăng ký thành công";
      
      return {
        success: true,
        user: userData,
        message: message,
      };
    } catch (err) {
      const errorMessage =
        err instanceof HttpError
          ? err.message
          : "Đăng ký thất bại. Vui lòng thử lại.";
      
      setError(errorMessage);
      
      return {
        success: false,
        user: null,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
