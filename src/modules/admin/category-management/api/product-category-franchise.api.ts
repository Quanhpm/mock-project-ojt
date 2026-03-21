import { httpClient } from "@/apis/httpClient";
import { axiosClient } from "@/apis/axios.config";

export interface ProductCategoryFranchise {
  id: string;
  category_franchise_id: string;
  product_franchise_id: string;
  display_order: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Flattened fields from joined tables
  franchise_id: string;
  franchise_name: string;
  category_id: string;
  category_name: string;
  product_id: string;
  product_name: string;
  size: string;
  price_base: number;
}

export interface SearchProductCategoryPayload {
  searchCondition: {
    franchise_id?: string;
    category_id?: string;
    product_id?: string;
    is_active?: boolean | string;
    is_deleted?: boolean;
  };
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}

export interface SearchProductCategoryResponse {
  success: boolean;
  data: ProductCategoryFranchise[];
  pageInfo: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * PRODUCT-CATEGORY-FRANCHISE-01: Add Product to Category Franchise
 */
export const addProductToCategoryFranchise = async (payload: {
  category_franchise_id: string;
  product_franchise_id: string;
  display_order: number;
}): Promise<ProductCategoryFranchise> => {
  const data = await httpClient.post<ProductCategoryFranchise>({
    url: "/product-category-franchises",
    data: payload,
  });
  return data!;
};

/**
 * PRODUCT-CATEGORY-FRANCHISE-02: Search Items by Conditions
 */
export const searchProductCategoryFranchises = async (
  payload: SearchProductCategoryPayload
): Promise<SearchProductCategoryResponse> => {
  const response = await axiosClient.post<SearchProductCategoryResponse>(
    "/product-category-franchises/search",
    payload
  );
  return response.data;
};

/**
 * PRODUCT-CATEGORY-FRANCHISE-03: Get Item by ID
 */
export const getProductCategoryFranchiseById = async (
  id: string
): Promise<ProductCategoryFranchise> => {
  const data = await httpClient.get<ProductCategoryFranchise>({
    url: `/product-category-franchises/${id}`,
  });
  return data!;
};

/**
 * PRODUCT-CATEGORY-FRANCHISE-04: Delete Item
 */
export const deleteProductCategoryFranchise = async (
  id: string
): Promise<void> => {
  await httpClient.delete({
    url: `/product-category-franchises/${id}`,
  });
};

/**
 * PRODUCT-CATEGORY-FRANCHISE-05: Restore Item
 */
export const restoreProductCategoryFranchise = async (
  id: string
): Promise<ProductCategoryFranchise> => {
  const data = await httpClient.patch<ProductCategoryFranchise>({
    url: `/product-category-franchises/${id}/restore`,
  });
  return data!;
};

/**
 * PRODUCT-CATEGORY-FRANCHISE-06: Change Status Item
 */
export const toggleProductCategoryStatus = async (
  id: string,
  payload: { is_active: boolean }
): Promise<ProductCategoryFranchise> => {
  const data = await httpClient.patch<ProductCategoryFranchise>({
    url: `/product-category-franchises/${id}/status`,
    data: payload,
  });
  return data!;
};

/**
 * PRODUCT-CATEGORY-FRANCHISE-07: Change Display Order Item
 */
export const reorderProductCategory = async (
  id: string,
  payload: { display_order: number }
): Promise<ProductCategoryFranchise> => {
  const data = await httpClient.patch<ProductCategoryFranchise>({
    url: `/product-category-franchises/${id}/reorder`,
    data: payload,
  });
  return data!;
};
