import { useState } from "react";
import { inventoryApi } from "../inventory.api";
import type { InventoryAdjustPayload } from "../inventory.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useAdjustInventory = () => {
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const adjustInventory = async (
    payload: InventoryAdjustPayload,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsAdjusting(true);
    setError(null);

    try {
      await inventoryApi.adjustInventory(payload);
      success(
        "Điều chỉnh thành công",
        `Số lượng đã được ${payload.change > 0 ? "tăng" : "giảm"} ${Math.abs(payload.change)}.`,
      );
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Không thể điều chỉnh số lượng lúc này. Vui lòng thử lại!";
      setError(errorMessage);
      showErrorToast("Điều chỉnh thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsAdjusting(false);
    }
  };

  return { adjustInventory, isAdjusting, error };
};
