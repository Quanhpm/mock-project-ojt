import { useState } from "react";
import { inventoryApi } from "@/apis/endpoints/inventory.api";
import type { InventoryCreatePayload, InventoryItem } from "../inventory.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useCreateInventory = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const createInventory = async (
    payload: InventoryCreatePayload,
    onSuccess?: (item: InventoryItem) => void,
    onError?: () => void
  ) => {
    setIsCreating(true);
    setError(null);
    try {
      const result = await inventoryApi.createInventory(payload);
      success("Tạo thành công", "Inventory item đã được tạo.");
      if (onSuccess && result.data) onSuccess(result.data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Không thể tạo inventory item";
      setError(msg);
      showError("Tạo thất bại", msg);
      if (onError) onError();
    } finally {
      setIsCreating(false);
    }
  };

  return { createInventory, isCreating, error };
};
