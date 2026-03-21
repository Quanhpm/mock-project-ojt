import { useState } from "react";
import { customerApi, HttpError } from "@/apis";
import type { ChangePasswordPayload } from "@/types/customer.types";

export const useChangePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = async (data: ChangePasswordPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      await customerApi.changePassword(data);

      return {
        success: true,
        message: "Đổi mật khẩu thành công!",
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
    changePassword,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
