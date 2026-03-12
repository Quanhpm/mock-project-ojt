import { useState } from "react";
import { changePassword } from "@/apis/endpointsCLIENT";
import { useLoadingStore } from "@/stores/loading.store";
import { HttpError } from "@/apis";
import type { CustomerChangePasswordRequest } from "@/apis/endpointsCLIENT/customerAuth.api";

export const useClientChangePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { increment: incrementGlobalLoading, decrement: decrementGlobalLoading } = useLoadingStore();

  const updatePassword = async (data: CustomerChangePasswordRequest) => {
    setIsLoading(true);
    setError(null);
    incrementGlobalLoading();

    try {
      await changePassword(data);
      
      return {
        success: true,
        message: "Đổi mật khẩu thành công",
      };
    } catch (err) {
      const errorMessage =
        err instanceof HttpError
          ? err.message
          : "Đổi mật khẩu thất bại. Vui lòng thử lại.";
      
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
      decrementGlobalLoading();
    }
  };

  return {
    updatePassword,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
