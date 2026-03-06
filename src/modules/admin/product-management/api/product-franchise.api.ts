import { httpClient } from "@/apis/httpClient";
import { axiosClient } from "@/apis/axios.config";

// ============================================================================
// TYPES
// ============================================================================

export interface ProductFranchise {
  id: string;
  franchise_id: string;
  product_id: string;
  size: string;
  price_base: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Flattened fields from joins (for search results)
  franchise_name?: string;
  product_name?: string;
  product_sku?: string;
}

export interface ProductFranchiseCreatePayload {
  franchise_id: string;
  product_id: string;
  size: string;
  price_base: number;
}

export interface ProductFranchiseUpdatePayload {
  size?: string;
  price_base?: number;
}

export interface ProductFranchiseSearchPayload {
  searchCondition: {
    franchise_id?: string;
    product_id?: string;
    size?: string;
    price_from?: number;
    price_to?: number;
    is_active?: boolean | string;
    is_deleted?: boolean;
  };
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}

export interface ProductFranchiseSearchResponse {
  success: boolean;
  data: ProductFranchise[];
  pageInfo: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * PRODUCT-FRANCHISE-01: Create Product Franchise
 * Activate a master product for a specific franchise
 */
export const createProductFranchise = async (
  payload: ProductFranchiseCreatePayload
): Promise<ProductFranchise> => {
  const data = await httpClient.post<ProductFranchise>({
    url: "/product-franchises",
    data: payload,
  });
  return data!;
};

/**
 * PRODUCT-FRANCHISE-02: Search Product Franchises
 */
export const searchProductFranchises = async (
  payload: ProductFranchiseSearchPayload
): Promise<ProductFranchiseSearchResponse> => {
  const response = await axiosClient.post<ProductFranchiseSearchResponse>(
    "/product-franchises/search",
    payload
  );
  return response.data;
};

/**
 * PRODUCT-FRANCHISE-03: Get Product Franchise by ID
 */
export const getProductFranchiseById = async (
  id: string
): Promise<ProductFranchise> => {
  const data = await httpClient.get<ProductFranchise>({
    url: `/product-franchises/${id}`,
  });
  return data!;
};

/**
 * PRODUCT-FRANCHISE-04: Update Product Franchise
 */
export const updateProductFranchise = async (
  id: string,
  payload: ProductFranchiseUpdatePayload
): Promise<ProductFranchise> => {
  const data = await httpClient.put<ProductFranchise>({
    url: `/product-franchises/${id}`,
    data: payload,
  });
  return data!;
};

/**
 * PRODUCT-FRANCHISE-05: Delete Product Franchise
 */
export const deleteProductFranchise = async (id: string): Promise<void> => {
  await httpClient.delete({
    url: `/product-franchises/${id}`,
  });
};

/**
 * PRODUCT-FRANCHISE-06: Restore Product Franchise
 */
export const restoreProductFranchise = async (
  id: string
): Promise<ProductFranchise> => {
  const data = await httpClient.patch<ProductFranchise>({
    url: `/product-franchises/${id}/restore`,
  });
  return data!;
};

/**
 * PRODUCT-FRANCHISE-07: Toggle Product Franchise Status
 */
export const toggleProductFranchiseStatus = async (
  id: string,
  payload: { is_active: boolean }
): Promise<ProductFranchise> => {
  const data = await httpClient.patch<ProductFranchise>({
    url: `/product-franchises/${id}/status`,
    data: payload,
  });
  return data!;
};
