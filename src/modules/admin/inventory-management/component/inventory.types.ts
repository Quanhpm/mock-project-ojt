// ============================================================
// Inventory Types - aligned with backend API response
// ============================================================

// ===== Core Entity =====

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
  // Joined fields (from search response)
  product_name?: string;
  franchise_name?: string;
}

// ===== Low Stock =====

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

// ===== Inventory Log =====

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

// ===== Payloads =====

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

export interface InventorySearchCondition {
  keyword?: string;
  product_franchise_id?: string;
  franchise_id?: string;
  product_id?: string;
  quantity?: number;
  is_active?: boolean;
  is_deleted?: boolean;
}

export interface InventorySearchPayload {
  searchCondition: InventorySearchCondition;
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}

// ===== Responses =====

export interface InventorySearchResponse {
  success: boolean;
  data: InventoryItem[];
  pageInfo: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
