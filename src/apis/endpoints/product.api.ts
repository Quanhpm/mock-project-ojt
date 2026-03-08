// Product API endpoints
import { httpClient } from "@/apis/httpClient";
import type { SearchResponse } from "@/apis/http.types";

export interface ProductItem {
    id: string;
    SKU: string;
    name: string;
    description?: string;
    content?: string;
    image_url?: string;
    images_url?: string[];
    min_price?: number;
    max_price?: number;
    is_active?: boolean;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateProductRequest {
    SKU: string;
    name: string;
    description?: string;
    content?: string;
    image_url?: string;
    images_url?: string[];
    min_price?: number;
    max_price?: number;
}

export type UpdateProductRequest = CreateProductRequest;

export interface SearchProductsRequest {
    searchCondition: {
        keyword?: string;
        min_price?: number | string;
        max_price?: number | string;
        is_active?: boolean | "";
        is_deleted?: boolean;
    };
    pageInfo: {
        pageNum: number;
        pageSize: number;
    };
}

// ======================== API Endpoints ========================

export const productApi = {
  /**
   * Search products with pagination
   */
  searchProducts: (
    data: SearchProductsRequest,
  ): Promise<SearchResponse<ProductItem>> => {
    return httpClient.search<ProductItem, SearchProductsRequest>({
      url: "/products/search",
      data,
    });
  },

  /**
   * Get single product by ID
   */
  getProductById: (
    productId: string,
  ): Promise<ProductItem | null> => {
    return httpClient.get<ProductItem>({
      url: `/products/${productId}`,
    });
  },

  /**
   * Create new product
   */
  createProduct: (
    data: CreateProductRequest,
  ): Promise<ProductItem | null> => {
    return httpClient.post<ProductItem, CreateProductRequest>({
      url: "/products",
      data,
    });
  },

  /**
   * Update product
   */
  updateProduct: (
    productId: string,
    data: UpdateProductRequest,
  ): Promise<ProductItem | null> => {
    return httpClient.put<ProductItem, UpdateProductRequest>({
      url: `/products/${productId}`,
      data,
    });
  },

  /**
   * Delete product
   */
  deleteProduct: (productId: string): Promise<null> => {
    return httpClient.delete<null>({
      url: `/products/${productId}`,
    });
  },

  /**
   * Restore deleted product
   */
  restoreProduct: (productId: string): Promise<ProductItem | null> => {
    return httpClient.patch<ProductItem>({
      url: `/products/${productId}/restore`,
    });
  },

  /**
   * Get products by franchise
   */
  getProductsByFranchise: async (franchiseId: number) => {
    return httpClient.get<ProductItem[], { franchiseId: number }>({
      url: `/products/franchise/${franchiseId}`,
      params: { franchiseId },
    });
  },

  /**
   * Get all products in franchise
   */
  getAllProductInFranchise: async (franchiseId: number) => {
    return httpClient.get<unknown, { franchiseId: number }>({
      url: `/franchises/${franchiseId}/products`,
      params: { franchiseId },
    });
  },

  /**
   * Get products by category
   */
  getProductsByCategory: async (categoryId: number) => {
    return httpClient.get<ProductItem[], { categoryId: number }>({
      url: `/products/category/${categoryId}`,
      params: { categoryId },
    });
  },

  /**
   * Toggle product status (active/inactive)
   */
  toggleProductStatus: (
    productId: string,
    payload: { is_active: boolean },
  ): Promise<ProductItem | null> => {
    return httpClient.patch<ProductItem, { is_active: boolean }>({
      url: `/products/${productId}/status`,
      data: payload,
    });
  },
};
