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
  inventory_id?: string;
  alert_threshold?: number;
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

export interface InventoryCreateResponse {
  success: true;
  data: InventoryItem;
  message: null;
}

export interface InventoryMutationSuccessResponse {
  success: true;
  data: null;
  message: null;
}

export interface InventoryMutationErrorResponse {
  success: false;
  message: string;
  code?: string | null;
  errors?: Array<{
    message: string;
    field?: string;
  }> | null;
}

export interface InventoryRestoreResponse {
  success: true;
  data: null;
  message: null;
}

export type InventoryRestoreErrorResponse = InventoryMutationErrorResponse;

// ============================================================
// Bulk Adjust Types (API POST /inventories/adjust/bulk)
// ============================================================

/** Một item trong payload gửi lên API bulk adjust */
export interface BulkAdjustItem {
  product_franchise_id: string; // Key định danh
  change: number; // Delta: newQuantity - originalQuantity (có thể âm, dương, hoặc 0)
  alert_threshold: number; // Giá trị tuyệt đối (ghi đè)
  reason: string; // Lý do, có thể rỗng ""
}

/** Payload gửi lên POST /api/inventories/adjust/bulk */
export interface BulkAdjustPayload {
  items: BulkAdjustItem[];
}

// ============================================================
// Excel/CSV Export-Import Types
// ============================================================

/** Dữ liệu 1 dòng trong file Excel (flat, human-readable headers) */
export interface InventoryExcelRow {
  id: string; // Inventory ID — READ-ONLY, dùng để match
  product_name: string; // Tên sản phẩm — READ-ONLY
  franchise_name: string; // Tên franchise — READ-ONLY
  product_franchise_id: string; // PF ID — READ-ONLY, DÙNG LÀM KEY CHO API
  quantity: number; // ← EDITABLE
  alert_threshold: number; // ← EDITABLE
}

// ============================================================
// Table Row State (Local — dùng cho RHF useFieldArray)
// ============================================================

/** State cho mỗi row trên table — bao gồm data gốc + editable values + checkbox */
export interface InventoryTableRow extends InventoryItem {
  _selected: boolean; // Checkbox state
  _editQuantity: number; // Giá trị quantity trên input (có thể khác quantity gốc)
  _editAlertThreshold: number; // Giá trị alert_threshold trên input
  _originalQuantity: number; // Giá trị quantity GỐC từ server (để tính change)
  _originalAlertThreshold: number; // Giá trị alert_threshold GỐC từ server
}

// ============================================================
// Import Validation
// ============================================================

/** Một lỗi validation khi import */
export interface ImportValidationError {
  row: number; // Row index (bắt đầu từ 01)
  field: string; // "quantity" | "alert_threshold"
  message: string; // Mô tả lỗi chi tiết
  tableRowIndex?: number; // Dòng tương ứng trên bảng hiện tại (nếu match được)
}

// ============================================================
// Excel Header Mappings
// ============================================================

/** Map: Excel Header (hiển thị cho user) → Field key */
export const EXCEL_HEADER_MAP: Record<string, keyof InventoryExcelRow> = {
  "Inventory ID": "id",
  "Product Name": "product_name",
  "Franchise Name": "franchise_name",
  "Product Franchise ID": "product_franchise_id",
  Quantity: "quantity",
  "Alert Threshold": "alert_threshold",
};

/** Map ngược: Field key → Excel Header */
export const FIELD_TO_HEADER_MAP: Record<keyof InventoryExcelRow, string> = {
  id: "Inventory ID",
  product_name: "Product Name",
  franchise_name: "Franchise Name",
  product_franchise_id: "Product Franchise ID",
  quantity: "Quantity",
  alert_threshold: "Alert Threshold",
};

/** Các cột READ-ONLY */
export const READONLY_EXCEL_COLUMNS: (keyof InventoryExcelRow)[] = [
  "id",
  "product_name",
  "franchise_name",
  "product_franchise_id",
];

/** Các cột EDITABLE (user được sửa trên Excel VÀ trên Table) */
export const EDITABLE_EXCEL_COLUMNS: (keyof InventoryExcelRow)[] = [
  "quantity",
  "alert_threshold",
];
