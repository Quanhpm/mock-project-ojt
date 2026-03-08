import type { Franchise } from "@/types";

// ============================================================================
// FRANCHISE SEARCH TYPES
// ============================================================================

export interface FranchiseSearchPayload {
  searchCondition: {
    keyword?: string;
    is_active?: boolean;
    is_deleted: boolean;
  };
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}

export interface PageInfo {
  pageNum: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface FranchiseSearchResponse {
  success: boolean;
  data: Franchise[];
  pageInfo?: PageInfo;
  message?: string;
}

export type { Franchise };
