import { httpClient } from "@/apis/httpClient";
import type { SearchResponse } from "@/apis/http.types";

// ======================== Types ========================

export interface ProductFranchiseItem {
    id: string;
    franchise_id: string;
    product_id: string;
    product_name?: string;
    size: string;
    price_base: number;
    is_active?: boolean;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateProductFranchiseRequest {
    franchise_id: string;
    product_id: string;
    size: string;
    price_base: number;
}

export interface UpdateProductFranchiseRequest {
    size: string;
    price_base: number;
}

export interface SearchProductFranchisesRequest {
    searchCondition: {
        product_id?: string;
        franchise_id?: string;
        size?: string;
        price_from?: number | string;
        price_to?: number | string;
        is_active?: boolean | "";
        is_deleted?: boolean;
    };
    pageInfo: {
        pageNum: number;
        pageSize: number;
    };
}

export interface ProductFranchiseStatusPayload {
    is_active: boolean;
}

export interface ProductFranchiseStatusItem {
    value: string;
    label: string;
}

// ======================== API Endpoints ========================

export const createProductFranchise = (
    data: CreateProductFranchiseRequest,
): Promise<ProductFranchiseItem | null> => {
    return httpClient.post<ProductFranchiseItem, CreateProductFranchiseRequest>({
        url: "/product-franchises",
        data,
    });
};

export const searchProductFranchises = (
    data: SearchProductFranchisesRequest,
): Promise<SearchResponse<ProductFranchiseItem>> => {
    return httpClient.search<ProductFranchiseItem, SearchProductFranchisesRequest>({
        url: "/product-franchises/search",
        data,
    });
};

export const getProductFranchiseById = (
    itemId: string,
): Promise<ProductFranchiseItem | null> => {
    return httpClient.get<ProductFranchiseItem>({
        url: `/product-franchises/${itemId}`,
    });
};

export const updateProductFranchise = (
    itemId: string,
    data: UpdateProductFranchiseRequest,
): Promise<ProductFranchiseItem | null> => {
    return httpClient.put<ProductFranchiseItem, UpdateProductFranchiseRequest>({
        url: `/product-franchises/${itemId}`,
        data,
    });
};

export const deleteProductFranchise = (itemId: string): Promise<null> => {
    return httpClient.delete<null>({
        url: `/product-franchises/${itemId}`,
    });
};

export const restoreProductFranchise = (
    itemId: string,
): Promise<ProductFranchiseItem | null> => {
    return httpClient.patch<ProductFranchiseItem>({
        url: `/product-franchises/${itemId}/restore`,
    });
};

export const changeProductFranchiseStatus = (
    itemId: string,
    data: ProductFranchiseStatusPayload,
): Promise<null> => {
    return httpClient.patch<null, ProductFranchiseStatusPayload>({
        url: `/product-franchises/${itemId}/status`,
        data,
    });
};

export const getProductFranchiseStatuses = (): Promise<Array<string | Record<string, unknown>> | null> => {
    return httpClient.get<Array<string | Record<string, unknown>>>({
        url: "/product-franchises/status",
    });
};
