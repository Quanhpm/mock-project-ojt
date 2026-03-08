import { useState } from "react";
import { inventoryApi } from "../inventory.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useRestoreInventory = () => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const restoreInventory = async (
    id: string,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsRestoring(true);
    setError(null);

    try {
      await inventoryApi.restoreInventory(id);
      success("Khôi phục thành công", "Inventory item đã được khôi phục.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Không thể khôi phục inventory lúc này. Vui lòng thử lại!";
      setError(errorMessage);
      showErrorToast("Khôi phục thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsRestoring(false);
    }
  };

  return { restoreInventory, isRestoring, error };
};
