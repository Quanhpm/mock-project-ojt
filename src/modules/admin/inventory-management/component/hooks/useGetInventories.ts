import { useState, useEffect } from "react";
import { inventoryApi } from "../inventory.api";
import type { InventoryItem, InventorySearchPayload } from "../inventory.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetInventoriesReturn {
  inventories: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  totalItems: number;
  refetch: (payload: InventorySearchPayload) => Promise<void>;
  updateItem: (updated: InventoryItem) => void;
}

export const useGetInventories = (): UseGetInventoriesReturn => {
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const { error: showError } = useToast();

  const refetch = async (payload: InventorySearchPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.searchInventories(payload);
      if (response.success && response.data) {
        setInventories(response.data);
        setTotalPages(response.pageInfo?.totalPages || 0);
        setTotalItems(response.pageInfo?.totalItems || 0);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi tải danh sách inventory";
      setError(errorMessage);
      showError("Lỗi", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch({
      searchCondition: { is_deleted: false },
      pageInfo: { pageNum: 1, pageSize: 10 },
    });
  }, []);

  const updateItem = (updated: InventoryItem) => {
    setInventories((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  return { inventories, isLoading, error, totalPages, totalItems, refetch, updateItem };
};
