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
    onError?: () => void,
  ) => {
    setIsCreating(true);
    setError(null);

    try {
      const result = await inventoryApi.createInventory(payload);
      success("Created", "The inventory item has been created.");
      if (onSuccess && result.data) onSuccess(result.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create the inventory item.";
      setError(message);
      showError("Create Failed", message);
      if (onError) onError();
    } finally {
      setIsCreating(false);
    }
  };

  return { createInventory, isCreating, error };
};
