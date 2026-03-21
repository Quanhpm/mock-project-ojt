import { httpClient } from "@/apis/httpClient";
import type { SearchResponse } from "@/apis/http.types";

// ======================== Types ========================

export interface ProductCategoryFranchiseItem {
    id: string;
    category_franchise_id: string;
    product_franchise_id: string;
    display_order: number;
    category_id?: string;
    category_name?: string;
    franchise_id?: string;
    franchise_name?: string;
    franchise_code?: string;
    product_id?: string;
    product_name?: string;
    product_sku?: string;
    size?: string;
    price_base?: number;
    is_active?: boolean;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ProductCategoryRef {
    category_id: string;
    category_name: string;
}

export interface ProductWithCategoriesApiItem {
    id: string;
    product_franchise_id: string;
    product_id: string;
    product_name: string;
    product_sku: string;
    size: string;
    price_base: number;
    franchise_id: string;
    franchise_name: string;
    franchise_code: string;
    is_active: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    categories: ProductCategoryRef[];
}

export interface AddProductToCategoryFranchiseRequest {
    category_franchise_id: string;
    product_franchise_id: string;
    display_order: number;
}

export interface SearchProductCategoryFranchisesRequest {
    searchCondition: {
        franchise_id?: string;
        category_id?: string;
        product_id?: string;
        is_active?: boolean | "";
        is_deleted?: boolean;
    };
    pageInfo: {
        pageNum: number;
        pageSize: number;
    };
}

export interface ProductCategoryFranchiseStatusPayload {
    is_active: boolean;
}

export interface ReorderProductCategoryFranchiseRequest {
    category_franchise_id: string;
    item_id: string;
    new_position: number;
}

// ======================== API Endpoints ========================

export const addProductToCategoryFranchise = (
    data: AddProductToCategoryFranchiseRequest,
): Promise<ProductCategoryFranchiseItem | null> => {
    return httpClient.post<
        ProductCategoryFranchiseItem,
        AddProductToCategoryFranchiseRequest
    >({
        url: "/product-category-franchises",
        data,
    });
};

export const searchProductCategoryFranchises = (
    data: SearchProductCategoryFranchisesRequest,
): Promise<SearchResponse<ProductCategoryFranchiseItem>> => {
    return httpClient.search<
        ProductCategoryFranchiseItem,
        SearchProductCategoryFranchisesRequest
    >({
        url: "/product-category-franchises/search",
        data,
    });
};

export const getProductCategoryFranchiseById = (
    itemId: string,
): Promise<ProductCategoryFranchiseItem | null> => {
    return httpClient.get<ProductCategoryFranchiseItem>({
        url: `/product-category-franchises/${itemId}`,
    });
};

export const getProductsByFranchiseWithCategory = (
    franchiseId: string,
): Promise<ProductWithCategoriesApiItem[] | null> => {
    return httpClient.get<ProductWithCategoriesApiItem[]>({
        url: `/product-category-franchises/franchise/${franchiseId}`,
    });
};

export const deleteProductCategoryFranchise = (itemId: string): Promise<null> => {
    return httpClient.delete<null>({
        url: `/product-category-franchises/${itemId}`,
    });
};

export const restoreProductCategoryFranchise = (
    itemId: string,
): Promise<ProductCategoryFranchiseItem | null> => {
    return httpClient.patch<ProductCategoryFranchiseItem>({
        url: `/product-category-franchises/${itemId}/restore`,
    });
};

export const changeProductCategoryFranchiseStatus = (
    itemId: string,
    data: ProductCategoryFranchiseStatusPayload,
): Promise<null> => {
    return httpClient.patch<null, ProductCategoryFranchiseStatusPayload>({
        url: `/product-category-franchises/${itemId}/status`,
        data,
    });
};

export const reorderProductCategoryFranchises = (
    data: ReorderProductCategoryFranchiseRequest,
): Promise<null> => {
    return httpClient.put<null, ReorderProductCategoryFranchiseRequest>({
        url: "/product-category-franchises/reorder",
        data,
    });
};
