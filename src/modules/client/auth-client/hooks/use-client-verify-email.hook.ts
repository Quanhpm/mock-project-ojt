import { useState } from "react";
import { verifyEmail } from "@/apis/endpointsCLIENT";
import { useClientAuthStore } from "../stores/client-auth.store";
import { HttpError } from "@/apis";

export const useClientVerifyEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useClientAuthStore();

  const verify = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await verifyEmail(token);
      
      // Handle different response structures
      const userData = response.data?.data?.user || response.data?.user;
      const message = response.data?.message || "Email đã được xác thực thành công";
      
      if (userData) {
        // Set user in store after successful verification
        setUser(userData);
      }
      
      return {
        success: true,
        user: userData,
        message: message,
      };
    } catch (err) {
      const errorMessage =
        err instanceof HttpError
          ? err.message
          : "Xác thực email thất bại. Token có thể đã hết hạn.";
      
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
    verify,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
