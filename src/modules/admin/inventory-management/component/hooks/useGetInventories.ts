import { useCallback, useEffect, useRef, useState } from "react";
import { inventoryApi } from "@/apis/endpoints/inventory.api";
import type { InventoryItem, InventorySearchPayload } from "../inventory.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetInventoriesReturn {
  inventories: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  totalItems: number;
  refetch: (
    payload: InventorySearchPayload,
    options?: { force?: boolean }
  ) => Promise<void>;
  updateItem: (updated: InventoryItem) => void;
}

const inFlightInventorySearches = new Map<string, Promise<Awaited<ReturnType<typeof inventoryApi.searchInventories>>>>();

const buildSearchCacheKey = (payload: InventorySearchPayload) =>
  JSON.stringify(payload);

const searchInventoriesDeduped = async (payload: InventorySearchPayload) => {
  const cacheKey = buildSearchCacheKey(payload);
  const existingRequest = inFlightInventorySearches.get(cacheKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = inventoryApi.searchInventories(payload).finally(() => {
    inFlightInventorySearches.delete(cacheKey);
  });

  inFlightInventorySearches.set(cacheKey, request);
  return request;
};

export const useGetInventories = (skipInitialFetch = false): UseGetInventoriesReturn => {
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const { error: showError } = useToast();
  const requestSequenceRef = useRef(0);
  const showErrorRef = useRef(showError);

  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  const refetch = useCallback(async (
    payload: InventorySearchPayload,
    options?: { force?: boolean }
  ) => {
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    setIsLoading(true);
    setError(null);

    try {
      const response = options?.force
        ? await inventoryApi.searchInventories(payload)
        : await searchInventoriesDeduped(payload);
      if (requestId !== requestSequenceRef.current) {
        return;
      }

      if (response.success && response.data) {
        setInventories(response.data);
        setTotalPages(response.pageInfo?.totalPages || 0);
        setTotalItems(response.pageInfo?.totalItems || 0);
      }
    } catch (err) {
      if (requestId !== requestSequenceRef.current) {
        return;
      }

      const errorMessage =
        err instanceof Error ? err.message : "Failed to load inventory list.";
      setError(errorMessage);
      showErrorRef.current("Error", errorMessage);
    } finally {
      if (requestId === requestSequenceRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!skipInitialFetch) {
      void refetch({
        searchCondition: { is_deleted: false },
        pageInfo: { pageNum: 1, pageSize: 10 },
      });
    }
  }, [refetch, skipInitialFetch]);

  const updateItem = useCallback((updated: InventoryItem) => {
    setInventories((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  }, []);

  return { inventories, isLoading, error, totalPages, totalItems, refetch, updateItem };
};
