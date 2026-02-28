// User API endpoints
import { httpClient } from '@/apis/httpClient'

// ======================== Types ========================

export interface CreateUserRequest {
    email: string
    password: string
    name: string
    phone: string
}

export interface CreateUserResponse {
    id: string
    email: string
    name: string
    phone: string
}

export interface AssignUserFranchiseRoleRequest {
    user_id: string
    role_id: string
    franchise_id: string | null
    note: string
}

export interface AssignUserFranchiseRoleResponse {
    _id: string
    user_id: string
    role_id: string
    franchise_id: string | null
}

export interface FranchiseSelectItem {
    value: string
    code: string
    name: string
}

// ======================== API Functions ========================

/** POST /api/users — Tạo user mới */
export const createUser = (
    data: CreateUserRequest,
): Promise<CreateUserResponse | null> => {
    return httpClient.post<CreateUserResponse, CreateUserRequest>({
        url: '/users',
        data,
    })
}

/** POST /api/user-franchise-roles — Gán role + franchise cho user */
export const assignUserFranchiseRole = (
    data: AssignUserFranchiseRoleRequest,
): Promise<AssignUserFranchiseRoleResponse | null> => {
    return httpClient.post<
        AssignUserFranchiseRoleResponse,
        AssignUserFranchiseRoleRequest
    >({
        url: '/user-franchise-roles',
        data,
    })
}

/** GET /api/franchises/select — Lấy danh sách franchise cho dropdown */
export const getFranchisesForSelect = (): Promise<
    FranchiseSelectItem[] | null
> => {
    return httpClient.get<FranchiseSelectItem[]>({
        url: '/franchises/select',
    })
}