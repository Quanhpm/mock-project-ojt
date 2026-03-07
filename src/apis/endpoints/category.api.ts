import { httpClient } from "@/apis";
import type { SearchResponse } from "@/apis/http.types";

// ======================== Types ========================

export interface CategoryItem {
    id: string;
    code: string;
    name: string;
    description?: string;
    parent_id?: string | null;
    is_active?: boolean;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateCategoryRequest {
    code: string;
    name: string;
    description?: string;
    parent_id?: string | null;
}

export type UpdateCategoryRequest = CreateCategoryRequest;

export interface SearchCategoriesRequest {
    searchCondition: {
        keyword?: string;
        parent_id?: string;
        is_active?: boolean | "";
        is_deleted?: boolean;
    };
    pageInfo: {
        pageNum: number;
        pageSize: number;
    };
}

export interface CategorySelectItem {
    value: string;
    code: string;
    name: string;
}

// ======================== API Endpoints ========================
export const getAllCategoriesInFranchise = async (franchiseId: number) => {
    return httpClient.get<unknown, { franchiseId: number }>({
        url: `/franchises/${franchiseId}/categories`,
        params: { franchiseId },
    });
};

export const createCategory = (
    data: CreateCategoryRequest,
): Promise<CategoryItem | null> => {
    return httpClient.post<CategoryItem, CreateCategoryRequest>({
        url: "/categories",
        data,
    });
};

export const searchCategories = (
    data: SearchCategoriesRequest,
): Promise<SearchResponse<CategoryItem>> => {
    return httpClient.search<CategoryItem, SearchCategoriesRequest>({
        url: "/categories/search",
        data,
    });
};

export const getCategoryById = (categoryId: string): Promise<CategoryItem | null> => {
    return httpClient.get<CategoryItem>({
        url: `/categories/${categoryId}`,
    });
};

export const updateCategory = (
    categoryId: string,
    data: UpdateCategoryRequest,
): Promise<CategoryItem | null> => {
    return httpClient.put<CategoryItem, UpdateCategoryRequest>({
        url: `/categories/${categoryId}`,
        data,
    });
};

export const deleteCategory = (categoryId: string): Promise<null> => {
    return httpClient.delete<null>({
        url: `/categories/${categoryId}`,
    });
};

export const restoreCategory = (categoryId: string): Promise<CategoryItem | null> => {
    return httpClient.patch<CategoryItem>({
        url: `/categories/${categoryId}/restore`,
    });
};

export const getCategoriesSelect = (): Promise<CategorySelectItem[] | null> => {
    return httpClient.get<CategorySelectItem[]>({
        url: "/categories/select",
    });
};

