import { useState } from "react";
import { customerApi } from "@/apis";
import { useLoadingStore } from "@/stores/loading.store";
import { HttpError } from "@/apis";

export const useAdminForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { increment: incrementGlobalLoading, decrement: decrementGlobalLoading } = useLoadingStore();

  const sendResetEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);
    incrementGlobalLoading();

    try {
      await customerApi.forgotPassword({ email });

      return {
        success: true,
        message:
          "Mật khẩu mới đã được gửi về email. Vui lòng kiểm tra hộp thư!",
      };
    } catch (err) {
      const errorMessage =
        err instanceof HttpError
          ? err.message
          : "Gửi email thất bại. Vui lòng thử lại.";

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
    sendResetEmail,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
