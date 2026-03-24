import { useState } from "react";
import { customerApi } from "@/apis";

export const useRestoreCustomer = () => {
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const restoreCustomer = async (
    id: string,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsRestoring(true);
    setError(null);

    try {
      await customerApi.restoreCustomer(id);

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Lỗi khi khôi phục khách hàng:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Không thể khôi phục khách hàng lúc này. Vui lòng thử lại!";
      setError(errorMessage);

      if (onError) onError(errorMessage);
    } finally {
      setIsRestoring(false);
    }
  };

  return {
    restoreCustomer,
    isRestoring,
    error,
  };
};
