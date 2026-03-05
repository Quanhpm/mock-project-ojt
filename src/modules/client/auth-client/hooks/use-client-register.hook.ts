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
      const userData = await registerCustomer(data);
      
      return {
        success: true,
        user: userData,
        message: "Đăng ký thành công",
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
