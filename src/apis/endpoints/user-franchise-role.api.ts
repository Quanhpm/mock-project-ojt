import { httpClient } from "@/apis/httpClient";
import type { SearchResponse } from "@/apis/http.types";

// ======================== Types ========================

export interface UserFranchiseRoleItem {
    id: string;
    user_id: string;
    role_id: string;
    franchise_id?: string | null;
    franchise_code?: string;
    franchise_name?: string;
    role_code?: string;
    role_name?: string;
    user_name?: string;
    user_email?: string;
    is_active?: boolean;
    note?: string;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateUserFranchiseRoleRequest {
    user_id: string;
    role_id: string;
    franchise_id?: string | null;
    note?: string;
}

export interface UpdateUserFranchiseRoleRequest {
    role_id: string;
    note?: string;
}

export interface SearchUserFranchiseRolesRequest {
    searchCondition: {
        user_id?: string;
        franchise_id?: string;
        role_id?: string;
        is_deleted?: boolean;
    };
    pageInfo: {
        pageNum: number;
        pageSize: number;
    };
}

export interface GetRolesByUserParams extends Record<string, unknown> {
    franchise_id?: string;
}

// ======================== API Endpoints ========================

export const createUserFranchiseRole = (
    data: CreateUserFranchiseRoleRequest,
): Promise<UserFranchiseRoleItem | null> => {
    return httpClient.post<UserFranchiseRoleItem, CreateUserFranchiseRoleRequest>({
        url: "/user-franchise-roles",
        data,
    });
};

export const searchUserFranchiseRoles = (
    data: SearchUserFranchiseRolesRequest,
): Promise<SearchResponse<UserFranchiseRoleItem>> => {
    return httpClient.search<UserFranchiseRoleItem, SearchUserFranchiseRolesRequest>({
        url: "/user-franchise-roles/search",
        data,
    });
};

export const getUserFranchiseRoleItemById = (
    itemId: string,
): Promise<UserFranchiseRoleItem | null> => {
    return httpClient.get<UserFranchiseRoleItem>({
        url: `/user-franchise-roles/${itemId}`,
    });
};

export const updateUserFranchiseRole = (
    itemId: string,
    data: UpdateUserFranchiseRoleRequest,
): Promise<UserFranchiseRoleItem | null> => {
    return httpClient.put<UserFranchiseRoleItem, UpdateUserFranchiseRoleRequest>({
        url: `/user-franchise-roles/${itemId}`,
        data,
    });
};

export const deleteUserFranchiseRole = (itemId: string): Promise<null> => {
    return httpClient.delete<null>({
        url: `/user-franchise-roles/${itemId}`,
    });
};

export const restoreUserFranchiseRole = (
    itemId: string,
): Promise<UserFranchiseRoleItem | null> => {
    return httpClient.patch<UserFranchiseRoleItem>({
        url: `/user-franchise-roles/${itemId}/restore`,
    });
};

export const getAllRolesByUserId = (
    userId: string,
    params?: GetRolesByUserParams,
): Promise<UserFranchiseRoleItem[] | null> => {
    return httpClient.get<UserFranchiseRoleItem[], GetRolesByUserParams>({
        url: `/user-franchise-roles/user/${userId}`,
        params,
    });
};
