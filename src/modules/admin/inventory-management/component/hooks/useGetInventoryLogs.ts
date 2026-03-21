import { useState } from "react";
import { inventoryApi } from "@/apis/endpoints/inventory.api";
import type { InventoryLog } from "../inventory.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetInventoryLogsReturn {
  logs: InventoryLog[];
  isLoading: boolean;
  error: string | null;
  fetchLogs: (inventoryId: string) => Promise<void>;
}

export const useGetInventoryLogs = (): UseGetInventoryLogsReturn => {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToast();

  const fetchLogs = async (inventoryId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getInventoryLogs(inventoryId);
      setLogs(response ?? []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi tải lịch sử inventory";
      setError(errorMessage);
      showError("Lỗi", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { logs, isLoading, error, fetchLogs };
};
