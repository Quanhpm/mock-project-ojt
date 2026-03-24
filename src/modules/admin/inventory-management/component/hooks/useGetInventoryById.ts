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
        const message = "Inventory item not found.";
        setError(message);
        showError("Not Found", message);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load inventory details.";
      setError(message);
      showError("Load Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return { inventory, isLoading, error, fetchInventory };
};
