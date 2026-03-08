import { httpClient } from "@/apis";
import type {
  InventoryItem,
  InventoryCreatePayload,
  InventoryAdjustPayload,
  InventorySearchPayload,
  InventorySearchResponse,
  LowStockItem,
  InventoryLog,
} from "./inventory.types";

// Search inventories with pagination
export const searchInventories = (
  payload: InventorySearchPayload
): Promise<InventorySearchResponse> => {
  return httpClient.search<InventoryItem, InventorySearchPayload>({
    url: "/inventories/search",
    data: payload,
  }) as Promise<InventorySearchResponse>;
};

// Get single inventory item by ID
export const getInventoryById = (id: string): Promise<InventoryItem | null> => {
  return httpClient.get<InventoryItem>({
    url: `/inventories/${id}`,
  });
};

// Create new inventory item
export const createInventory = (
  payload: InventoryCreatePayload
): Promise<InventoryItem | null> => {
  return httpClient.post<InventoryItem, InventoryCreatePayload>({
    url: "/inventories",
    data: payload,
  });
};

// Delete inventory item
export const deleteInventory = (id: string): Promise<null> => {
  return httpClient.delete<null>({
    url: `/inventories/${id}`,
  });
};

// Restore deleted inventory item
export const restoreInventory = (id: string): Promise<null> => {
  return httpClient.patch<null, { id: string }>({
    url: "/inventories/restore",
    data: { id },
  });
};

// Adjust inventory quantity
export const adjustInventory = (
  payload: InventoryAdjustPayload
): Promise<null> => {
  return httpClient.post<null, InventoryAdjustPayload>({
    url: "/inventories/adjust",
    data: payload,
  });
};

// Get low stock items by franchise
export const getLowStockByFranchise = (
  franchiseId: string
): Promise<LowStockItem[] | null> => {
  return httpClient.get<LowStockItem[]>({
    url: `/inventories/low-stock/franchise/${franchiseId}`,
  });
};

// Get inventory logs by inventory ID
export const getInventoryLogs = (
  inventoryId: string
): Promise<InventoryLog[] | null> => {
  return httpClient.get<InventoryLog[]>({
    url: `/inventories/logs/${inventoryId}`,
  });
};

// Bundle export (giống productApi pattern)
export const inventoryApi = {
  searchInventories,
  getInventoryById,
  createInventory,
  deleteInventory,
  restoreInventory,
  adjustInventory,
  getLowStockByFranchise,
  getInventoryLogs,
};
