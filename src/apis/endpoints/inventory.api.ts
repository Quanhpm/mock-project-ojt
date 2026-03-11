import { httpClient } from "@/apis";
import { axiosClient } from "@/apis/axios.config";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  SearchResponse,
} from "@/apis/http.types";

// ======================== Types ========================

export interface InventoryItem {
  id: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  product_franchise_id: string;
  product_id: string;
  franchise_id: string;
  quantity: number;
  alert_threshold: number;
  product_name?: string;
  franchise_name?: string;
}

export interface LowStockItem {
  _id: string;
  product_franchise_id: string;
  quantity: number;
  reserved_quantity: number;
  alert_threshold: number;
  product_franchise: {
    product_id: string;
    franchise_id: string;
    price_base: number;
    size: string;
  };
}

export interface InventoryLog {
  _id: string;
  inventory_id: string;
  product_franchise_id: string;
  change: number;
  type: string;
  reference_type: string;
  created_by: string;
  created_at: string;
}

export interface InventoryCreatePayload {
  product_franchise_id: string;
  quantity: number;
  alert_threshold: number;
}

export interface InventoryAdjustPayload {
  product_franchise_id: string;
  change: number;
  reason: string;
}

export interface BulkAdjustItem {
  product_franchise_id: string;
  change: number;
  alert_threshold: number;
  reason: string;
}

export interface BulkAdjustPayload {
  items: BulkAdjustItem[];
}

export interface InventorySearchCondition {
  keyword?: string;
  product_franchise_id?: string;
  franchise_id?: string;
  product_id?: string;
  quantity?: number | "";
  is_active?: boolean | "";
  is_deleted?: boolean;
}

export interface InventorySearchPayload {
  searchCondition: InventorySearchCondition;
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}

export type InventorySearchResponse = SearchResponse<InventoryItem>;

export interface InventoryCreateResponse extends ApiSuccessResponse<InventoryItem> {
  message: null;
}

export interface InventoryMutationSuccessResponse extends ApiSuccessResponse<null> {
  message: null;
}

export interface InventoryMutationErrorResponse extends ApiErrorResponse {
  success: false;
  message: string;
}

export type InventoryCreateApiResponse =
  | InventoryCreateResponse
  | InventoryMutationErrorResponse;

export interface InventoryRestoreResponse extends ApiSuccessResponse<null> {
  message: null;
}

export type InventoryRestoreApiResponse =
  | InventoryRestoreResponse
  | InventoryMutationErrorResponse;

export type InventoryDeleteApiResponse =
  | InventoryMutationSuccessResponse
  | InventoryMutationErrorResponse;

export type InventoryAdjustApiResponse =
  | InventoryMutationSuccessResponse
  | InventoryMutationErrorResponse;

// ======================== API Endpoints ========================

export const inventoryApi = {
  /**
   * Search inventory items by conditions with pagination
   * POST /api/inventories/search
   */
  searchInventories: (
    data: InventorySearchPayload,
  ): Promise<InventorySearchResponse> => {
    return httpClient.search<InventoryItem, InventorySearchPayload>({
      url: "/inventories/search",
      data,
    });
  },

  /**
   * Get inventory item by ID
   * GET /api/inventories/:id
   */
  getInventoryById: (id: string): Promise<InventoryItem | null> => {
    return httpClient.get<InventoryItem>({
      url: `/inventories/${id}`,
    });
  },

  /**
   * Create new inventory item
   * POST /api/inventories
   */
  createInventory: async (
    data: InventoryCreatePayload,
  ): Promise<InventoryCreateResponse> => {
    const response = await axiosClient.post<InventoryCreateApiResponse>(
      "/inventories",
      data,
    );
    return response.data as InventoryCreateResponse;
  },

  /**
   * Delete inventory item
   * DELETE /api/inventories/:id
   */
  deleteInventory: async (id: string): Promise<InventoryMutationSuccessResponse> => {
    const response = await axiosClient.delete<InventoryDeleteApiResponse>(
      `/inventories/${id}`,
    );
    return response.data as InventoryMutationSuccessResponse;
  },

  /**
   * Restore inventory item
   * PATCH /api/inventories/:id/restore
   */
  restoreInventory: async (id: string): Promise<InventoryRestoreResponse> => {
    const response = await axiosClient.patch<InventoryRestoreApiResponse>(
      `/inventories/${id}/restore`,
    );
    return response.data as InventoryRestoreResponse;
  },

  /**
   * Adjust inventory quantity
   * POST /api/inventories/adjust
   */
  adjustInventory: async (
    data: InventoryAdjustPayload,
  ): Promise<InventoryMutationSuccessResponse> => {
    const response = await axiosClient.post<InventoryAdjustApiResponse>(
      "/inventories/adjust",
      data,
    );
    return response.data as InventoryMutationSuccessResponse;
  },

  /**
   * Bulk adjust multiple inventory items
   * POST /api/inventories/adjust/bulk
   */
  bulkAdjustInventory: async (
    data: BulkAdjustPayload,
  ): Promise<InventoryMutationSuccessResponse> => {
    const response = await axiosClient.post<InventoryAdjustApiResponse>(
      "/inventories/adjust/bulk",
      data,
    );
    return response.data as InventoryMutationSuccessResponse;
  },

  /**
   * Get low stock items by franchise
   * GET /api/inventories/low-stock/franchise/:franchiseId
   */
  getLowStockByFranchise: (
    franchiseId: string,
  ): Promise<LowStockItem[] | null> => {
    return httpClient.get<LowStockItem[]>({
      url: `/inventories/low-stock/franchise/${franchiseId}`,
    });
  },

  /**
   * Get inventory logs by inventory ID
   * GET /api/inventories/logs/:inventoryId
   */
  getInventoryLogs: (
    inventoryId: string,
  ): Promise<InventoryLog[] | null> => {
    return httpClient.get<InventoryLog[]>({
      url: `/inventories/logs/${inventoryId}`,
    });
  },
};
