import { httpClient } from '@/apis/httpClient'
import { API_ENDPOINTS } from '@/consts/api.const'
import type { UserWithRolesAndFranchises } from '@/mockdata'

export type UserListParams = Record<string, unknown> & {
	search?: string
	is_active?: boolean
	role_id?: number
	franchise_id?: number
	page?: number
	limit?: number
}

export interface CreateUserRequest {
	email: string
	password: string
	name: string
	phone?: string
	avatar_url?: string
	is_active?: boolean
}

export interface UpdateUserRequest {
	email?: string
	name?: string
	phone?: string
	avatar_url?: string
	is_active?: boolean
}

export interface UserEntity {
	id: number
	email: string
	name: string
	phone: string
	avatar_url: string
	is_active: boolean
	is_deleted: boolean
	created_at: string
	updated_at: string
}

export const getUsers = (
	params?: UserListParams,
): Promise<UserWithRolesAndFranchises[] | null> => {
	return httpClient.get<UserWithRolesAndFranchises[], UserListParams>({
		url: API_ENDPOINTS.USERS,
		params,
	})
}

export const getUserById = (userId: number): Promise<UserEntity | null> => {
	return httpClient.get<UserEntity>({
		url: `${API_ENDPOINTS.USERS}/${userId}`,
	})
}

export const createUser = (data: CreateUserRequest): Promise<UserEntity | null> => {
	return httpClient.post<UserEntity, CreateUserRequest>({
		url: API_ENDPOINTS.USERS,
		data,
	})
}

export const updateUser = (
	userId: number,
	data: UpdateUserRequest,
): Promise<UserEntity | null> => {
	return httpClient.patch<UserEntity, UpdateUserRequest>({
		url: `${API_ENDPOINTS.USERS}/${userId}`,
		data,
	})
}

export const deleteUser = (userId: number): Promise<null> => {
	return httpClient.delete<null>({
		url: `${API_ENDPOINTS.USERS}/${userId}`,
	})
}
