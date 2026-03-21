// ============================================================
// Promotion Types - aligned with backend API response
// ============================================================

// ===== Core Entity =====

export type PromotionType = "FIXED" | "PERCENT";

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  franchise_id: string;
  franchise_name: string;
  product_franchise_id: string | null;
  product_id: string;
  product_name: string;
  type: PromotionType;
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

export interface PromotionCreatePayload {
  name: string;
  franchise_id: string;
  product_franchise_id?: string;
  type: PromotionType;
  value: number;
  quota_total: number;
  start_date: string;
  end_date: string;
}

export interface PromotionUpdatePayload {
  name: string;
  type: PromotionType;
  value: number;
  quota_total: number;
  start_date: string;
  end_date: string;
}

export interface PromotionSearchCondition {
  keyword?: string;
  code?: string;
  franchise_id?: string;
  product_franchise_id?: string;
  type?: PromotionType | "";
  is_active?: boolean | "";
  is_deleted?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface PromotionSearchPayload {
  searchCondition: PromotionSearchCondition;
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}

// ===== Responses =====

export interface PromotionSearchResponse {
  success: boolean;
  data: Promotion[];
  pageInfo: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface PromotionCreateResponse {
  success: true;
  data: Promotion;
  message: null;
}

export interface PromotionMutationSuccessResponse {
  success: true;
  data: null;
  message: null;
}

export interface PromotionMutationErrorResponse {
  success: false;
  message: string;
  code?: string | null;
  errors?: Array<{
    message: string;
    field?: string;
  }> | null;
}

export interface PromotionRestoreResponse {
  success: true;
  data: null;
  message: null;
}
