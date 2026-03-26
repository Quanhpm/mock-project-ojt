export interface ProductFranchisePageInfo {
  pageNum: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ProductFranchiseSearchCondition {
  product_id: string;
  franchise_id: string;
  size: string;
  price_from: number | string;
  price_to: number | string;
  is_active: boolean | "";
  is_deleted: boolean;
}

export interface ProductFranchiseSearchRequest {
  searchCondition: ProductFranchiseSearchCondition;
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}

export interface ProductFranchiseDetail {
  id: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  product_id: string;
  franchise_id: string;
  size: string;
  price_base: number;
}

export interface ProductFranchiseSearchItem extends ProductFranchiseDetail {
  product_name?: string;
  product_sku?: string;
  franchise_name?: string;
  image_url?: string;
}

export type ProductFranchiseStatusFilterValue = "" | "active" | "inactive";

export interface ProductFranchiseCreateRequest {
  franchise_id: string;
  product_id: string;
  size: string;
  price_base: number;
}

export interface ProductFranchiseUpdateRequest {
  size: string;
  price_base: number;
}

export interface ProductFranchiseStatusRequest {
  is_active: boolean;
}

export interface ProductFranchiseSearchResponse {
  success: true;
  data: ProductFranchiseSearchItem[];
  pageInfo: ProductFranchisePageInfo;
}

export interface ProductFranchiseLocationState {
  franchiseName?: string;
  returnTo?: {
    pathname?: string;
    search?: string;
  };
}
