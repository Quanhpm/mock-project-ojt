import { useState } from "react";
import { inventoryApi } from "@/apis/endpoints/inventory.api";
import type { LowStockItem } from "../inventory.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useGetLowStock = () => {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToast();

  const fetchLowStock = async (franchiseId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await inventoryApi.getLowStockByFranchise(franchiseId);
      setLowStockItems(data ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load low-stock items.";
      setError(message);
      showError("Load Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return { lowStockItems, isLoading, error, fetchLowStock };
};
