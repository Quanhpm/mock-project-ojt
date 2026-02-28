import { useState } from "react";
import { forgotPassword } from "@/apis/endpointsCLIENT";
import { HttpError } from "@/apis";

export const useClientForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendResetEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await forgotPassword(email);
      
      return {
        success: true,
        message:
          response.data.message ||
          "Email khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.",
      };
    } catch (err) {
      const errorMessage =
        err instanceof HttpError
          ? err.message
          : "Gửi email khôi phục thất bại. Vui lòng thử lại.";
      
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
    sendResetEmail,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
