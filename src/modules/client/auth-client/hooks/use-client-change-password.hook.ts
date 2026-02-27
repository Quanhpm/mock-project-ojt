import { useState } from "react";
import { changePassword } from "@/apis/endpointsCLIENT";
import { HttpError } from "@/apis";
import type { CustomerChangePasswordRequest } from "@/apis/endpointsCLIENT/customerAuth.api";

export const useClientChangePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePassword = async (data: CustomerChangePasswordRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await changePassword(data);
      
      return {
        success: true,
        message: response.data.message || "Đổi mật khẩu thành công",
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
    }
  };

  return {
    updatePassword,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
