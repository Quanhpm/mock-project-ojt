import { useState } from "react";
import { inventoryApi } from "@/apis/endpoints/inventory.api";
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
      success("Restored", "Inventory item has been restored.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to restore inventory right now. Please try again.";
      setError(errorMessage);
      showErrorToast("Restore Failed", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsRestoring(false);
    }
  };

  return { restoreInventory, isRestoring, error };
};
