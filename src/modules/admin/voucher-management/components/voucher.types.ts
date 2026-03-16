// ============================================================
// Voucher Types - aligned with backend API response
// ============================================================

// ===== Core Entity =====

export type VoucherType = "FIXED" | "PERCENT";

export interface Voucher {
  id: string;
  code: string;
  name: string;
  description: string;
  franchise_id: string;
  franchise_name: string;
  product_franchise_id: string | null;
  product_id: string;
  product_name: string;
  type: VoucherType;
  value: number;
  quota_total: number;
  quota_used: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// ===== Payloads =====

export interface VoucherCreatePayload {
  name: string;
  franchise_id: string;
  product_franchise_id?: string;
  type: VoucherType;
  value: number;
  quota_total: number;
  start_date: string;
  end_date: string;
}

export interface VoucherUpdatePayload {
  name: string;
  type: VoucherType;
  value: number;
  quota_total: number;
  start_date: string;
  end_date: string;
}

export interface VoucherSearchCondition {
  keyword?: string;
  code?: string;
  franchise_id?: string;
  product_franchise_id?: string;
  type?: VoucherType | "";
  is_active?: boolean | "";
  is_deleted?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface VoucherSearchPayload {
  searchCondition: VoucherSearchCondition;
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}

// ===== Responses =====

export interface VoucherSearchResponse {
  success: boolean;
  data: Voucher[];
  pageInfo: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface VoucherCreateResponse {
  success: true;
  data: Voucher;
  message: null;
}

export interface VoucherMutationSuccessResponse {
  success: true;
  data: null;
  message: null;
}

export interface VoucherMutationErrorResponse {
  success: false;
  message: string;
  code?: string | null;
  errors?: Array<{
    message: string;
    field?: string;
  }> | null;
}

export interface VoucherRestoreResponse {
  success: true;
  data: null;
  message: null;
}
