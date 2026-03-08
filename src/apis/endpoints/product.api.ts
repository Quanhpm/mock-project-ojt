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

export const getProductsByFranchise = async (franchiseId: number) => {
        return httpClient.get<ProductItem[], { franchiseId: number }>({
        url: `/products/franchise/${franchiseId}`,
        params: { franchiseId },
    });
};

export const getAllProductInFranchise = async (franchiseId: number) => {
        return httpClient.get<unknown, { franchiseId: number }>({
        url: `/franchises/${franchiseId}/products`,
        params: { franchiseId },
    });
};

export const getProductsByCategory = async (categoryId: number) => {
        return httpClient.get<ProductItem[], { categoryId: number }>({
        url: `/products/category/${categoryId}`,
        params: { categoryId },
    });
};

export const getProductById = async (productId: number) => {
        return httpClient.get<ProductItem, { productId: number }>({
        url: `/products/${productId}`,
        params: { productId },
    });
};

export const createProduct = (
    data: CreateProductRequest,
): Promise<ProductItem | null> => {
    return httpClient.post<ProductItem, CreateProductRequest>({
        url: "/products",
        data,
    });
};

export const searchProducts = (
    data: SearchProductsRequest,
): Promise<SearchResponse<ProductItem>> => {
    return httpClient.search<ProductItem, SearchProductsRequest>({
        url: "/products/search",
        data,
    });
};

export const getProductItemById = (
    productId: string,
): Promise<ProductItem | null> => {
    return httpClient.get<ProductItem>({
        url: `/products/${productId}`,
    });
};

export const updateProduct = (
    productId: string,
    data: UpdateProductRequest,
): Promise<ProductItem | null> => {
    return httpClient.put<ProductItem, UpdateProductRequest>({
        url: `/products/${productId}`,
        data,
    });
};

export const deleteProduct = (productId: string): Promise<null> => {
    return httpClient.delete<null>({
        url: `/products/${productId}`,
    });
};

export const restoreProduct = (productId: string): Promise<ProductItem | null> => {
    return httpClient.patch<ProductItem>({
        url: `/products/${productId}/restore`,
    });
};
