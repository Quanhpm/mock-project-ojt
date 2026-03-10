import { useState } from "react";
import { inventoryApi } from "@/apis/endpoints/inventory.api";
import type { InventoryAdjustPayload } from "../inventory.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useAdjustQuantity = () => {
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const adjustQuantity = async (
    payload: InventoryAdjustPayload,
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    setIsAdjusting(true);
    setError(null);
    try {
      await inventoryApi.adjustInventory(payload);
      success(
        "Điều chỉnh thành công",
        `Số lượng đã được ${payload.change > 0 ? "tăng" : "giảm"} ${Math.abs(payload.change)}.`
      );
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Không thể điều chỉnh số lượng";
      setError(msg);
      showError("Điều chỉnh thất bại", msg);
      if (onError) onError();
    } finally {
      setIsAdjusting(false);
    }
  };

  return { adjustQuantity, isAdjusting, error };
};
