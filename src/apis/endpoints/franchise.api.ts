import { httpClient } from "@/apis";
import type { SearchResponse } from "@/apis/http.types";

// ======================== Types ========================

export interface FranchiseItem {
    id: string;
    code: string;
    name: string;
    opened_at: string;
    closed_at: string;
    hotline: string;
    logo_url?: string;
    address?: string;
    is_active?: boolean;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateFranchiseRequest {
    code: string;
    name: string;
    opened_at: string;
    closed_at: string;
    hotline: string;
    logo_url?: string;
    address?: string;
}

export type UpdateFranchiseRequest = CreateFranchiseRequest;

export interface SearchFranchisesRequest {
    searchCondition: {
        keyword?: string;
        opened_at?: string;
        closed_at?: string;
        is_active?: boolean | "";
        is_deleted?: boolean;
    };
    pageInfo: {
        pageNum: number;
        pageSize: number;
    };
}

export interface FranchiseStatusPayload {
    is_active: boolean;
}

export interface FranchiseOptionItem {
    value: string;
    code: string;
    name: string;
}

// ======================== API Endpoints ========================

export const franchiseApi = {
  /**
   * Search franchises by conditions with pagination
   * POST /api/franchises/search
   */
  searchFranchises: (
    data: SearchFranchisesRequest,
  ): Promise<SearchResponse<FranchiseItem>> => {
    return httpClient.search<FranchiseItem, SearchFranchisesRequest>({
      url: "/franchises/search",
      data,
    });
  },

  /**
   * Get franchise by ID
   */
  getFranchiseById: (
    franchiseId: string,
  ): Promise<FranchiseItem | null> => {
    return httpClient.get<FranchiseItem>({
      url: `/franchises/${franchiseId}`,
    });
  },

  /**
   * Create new franchise
   */
  createFranchise: (
    data: CreateFranchiseRequest,
  ): Promise<FranchiseItem | null> => {
    return httpClient.post<FranchiseItem, CreateFranchiseRequest>({
      url: "/franchises",
      data,
    });
  },

  /**
   * Update franchise
   */
  updateFranchise: (
    franchiseId: string,
    data: UpdateFranchiseRequest,
  ): Promise<FranchiseItem | null> => {
    return httpClient.put<FranchiseItem, UpdateFranchiseRequest>({
      url: `/franchises/${franchiseId}`,
      data,
    });
  },

  /**
   * Delete franchise (soft delete)
   */
  deleteFranchise: (franchiseId: string | number): Promise<null> => {
    return httpClient.delete<null>({
      url: `/franchises/${franchiseId}`,
    });
  },

  /**
   * Toggle franchise status
   */
  toggleFranchiseStatus: (
    franchiseId: string | number,
    payload: FranchiseStatusPayload,
  ): Promise<FranchiseItem | null> => {
    return httpClient.patch<FranchiseItem, FranchiseStatusPayload>({
      url: `/franchises/${franchiseId}/status`,
      data: payload,
    });
  },

  /**
   * Restore deleted franchise
   */
  restoreFranchise: (franchiseId: string | number): Promise<FranchiseItem | null> => {
    return httpClient.patch<FranchiseItem>({
      url: `/franchises/${franchiseId}/restore`,
    });
  },
};

export const getFranchisesSelect = (): Promise<FranchiseOptionItem[] | null> => {
    return httpClient.get<FranchiseOptionItem[]>({
        url: "/franchises/select",
    });
};

export const getFranchiseIdByCode = async (code: string) => {
    return httpClient.get<{ franchiseId: number }, { code: string }>({
        url: `/franchises/code/${code}`,
        params: { code },
    });
};
