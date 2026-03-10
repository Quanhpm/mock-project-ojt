import { useState } from "react";
import { inventoryApi } from "@/apis/endpoints/inventory.api";
import type { InventoryItem } from "../inventory.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetInventoryByIdReturn {
  inventory: InventoryItem | null;
  isLoading: boolean;
  error: string | null;
  fetchInventory: (id: string) => Promise<void>;
}

export const useGetInventoryById = (): UseGetInventoryByIdReturn => {
  const [inventory, setInventory] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToast();

  const fetchInventory = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getInventoryById(id);
      if (response) {
        setInventory(response);
      } else {
        setError("Inventory item not found");
        showError("Không tìm thấy", "Inventory item không tồn tại");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi tải thông tin inventory";
      setError(errorMessage);
      showError("Lỗi", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { inventory, isLoading, error, fetchInventory };
};
