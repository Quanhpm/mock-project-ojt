export interface CategoryFranchise {
  id: string;
  category_id: string;
  category_name: string; // From joined data
  franchise_id: string;
  franchise_name: string; // From joined data
  display_order: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryFranchiseSearchFilters {
  keyword: string;
  franchise_id?: string;
  category_id?: string;
  is_active?: boolean | string;
  is_deleted: boolean;
}

export interface CategoryFranchiseSearchPayload {
  searchCondition: {
    franchise_id?: string;
    category_id?: string;
    is_active?: boolean | string;
    is_deleted?: boolean;
  };
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}

export interface CategoryFranchiseSearchResponse {
  success: boolean;
  data: CategoryFranchise[];
  pageInfo: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CategoryFranchiseCreatePayload {
  franchise_id: string;
  category_id: string;
  display_order: number;
}

export interface CategoryFranchiseUpdateDisplayOrderPayload {
  display_order: number;
}

export interface CategoryFranchiseToggleStatusPayload {
  is_active: boolean;
}

// For master category dropdown
export interface CategorySelectItem {
  value: string;
  code: string;
  name: string;
}
