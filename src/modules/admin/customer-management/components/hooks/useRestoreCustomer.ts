import { useState } from "react";
import { customerApi, HttpError } from "@/apis";
import { useToast } from "@/hooks/use-toast.hook";

export const useRestoreCustomer = () => {
  const { success, error: showErrorToast } = useToast();
  const [isRestoring, setIsRestoring] = useState(false);
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
      success("Đã khôi phục khách hàng", "Đã khôi phục khách hàng thành công!");
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        err instanceof HttpError
          ? err.message
          : "Không thể khôi phục khách hàng lúc này. Vui lòng thử lại!";
      setError(message);
      showErrorToast("Khôi phục thất bại", message);
      onError?.(message);
    } finally {
      setIsRestoring(false);
    }
  };

  return { restoreCustomer, isRestoring, error };
};
