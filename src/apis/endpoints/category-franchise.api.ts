import { httpClient } from "@/apis";
import type { SearchResponse } from "@/apis/http.types";
import type { CategoryItem } from "./category.api";

// ======================== Types ========================

export interface CategoryFranchiseItem {
    id: string;
    franchise_id: string;
    category_id: string;
    display_order: number;
    is_active?: boolean;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateCategoryFranchiseRequest {
    franchise_id: string;
    category_id: string;
    display_order: number;
}

export interface SearchCategoryFranchisesRequest {
    searchCondition: {
        franchise_id?: string;
        category_id?: string;
        is_active?: boolean | "";
        is_deleted?: boolean;
    };
    pageInfo: {
        pageNum: number;
        pageSize: number;
    };
}

export interface CategoryFranchiseStatusPayload {
    is_active: boolean;
}

export interface CategoryFranchiseDisplayOrderPayload {
    display_order: number;
}

export interface FranchiseCategoryListItem {
    id: string;
    franchise_id: string;
    category_id: string;
    display_order: number;
    category?: CategoryItem;
}

// ======================== API Endpoints ========================

export const createCategoryFranchise = (
    data: CreateCategoryFranchiseRequest,
): Promise<CategoryFranchiseItem | null> => {
    return httpClient.post<CategoryFranchiseItem, CreateCategoryFranchiseRequest>({
        url: "/category-franchises",
        data,
    });
};

export const searchCategoryFranchises = (
    data: SearchCategoryFranchisesRequest,
): Promise<SearchResponse<CategoryFranchiseItem>> => {
    return httpClient.search<CategoryFranchiseItem, SearchCategoryFranchisesRequest>({
        url: "/category-franchises/search",
        data,
    });
};

export const getCategoryFranchiseById = (
    itemId: string,
): Promise<CategoryFranchiseItem | null> => {
    return httpClient.get<CategoryFranchiseItem>({
        url: `/category-franchises/${itemId}`,
    });
};

export const deleteCategoryFranchise = (itemId: string): Promise<null> => {
    return httpClient.delete<null>({
        url: `/category-franchises/${itemId}`,
    });
};

export const restoreCategoryFranchise = (
    itemId: string,
): Promise<CategoryFranchiseItem | null> => {
    return httpClient.patch<CategoryFranchiseItem>({
        url: `/category-franchises/${itemId}/restore`,
    });
};

export const changeCategoryFranchiseStatus = (
    itemId: string,
    data: CategoryFranchiseStatusPayload,
): Promise<null> => {
    return httpClient.patch<null, CategoryFranchiseStatusPayload>({
        url: `/category-franchises/${itemId}/status`,
        data,
    });
};

export const changeCategoryFranchiseDisplayOrder = (
    itemId: string,
    data: CategoryFranchiseDisplayOrderPayload,
): Promise<null> => {
    return httpClient.patch<null, CategoryFranchiseDisplayOrderPayload>({
        url: `/category-franchises/${itemId}/display-order`,
        data,
    });
};

export const getCategoriesByFranchise = (
    franchiseId: string,
    onlyActive?: boolean,
): Promise<FranchiseCategoryListItem[] | null> => {
    return httpClient.get<FranchiseCategoryListItem[], { onlyActive?: boolean }>({
        url: `/category-franchises/franchise/${franchiseId}`,
        params: { onlyActive },
    });
};
