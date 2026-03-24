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
    onError?: () => void,
  ) => {
    setIsAdjusting(true);
    setError(null);

    try {
      await inventoryApi.adjustInventory(payload);
      success(
        "Adjusted",
        `Quantity has been ${payload.change > 0 ? "increased" : "decreased"} by ${Math.abs(payload.change)}.`,
      );
      if (onSuccess) onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to adjust the quantity.";
      setError(message);
      showError("Adjustment Failed", message);
      if (onError) onError();
    } finally {
      setIsAdjusting(false);
    }
  };

  return { adjustQuantity, isAdjusting, error };
};
