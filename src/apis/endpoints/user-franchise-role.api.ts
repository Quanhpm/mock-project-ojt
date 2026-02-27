import { httpClient } from '@/apis/httpClient'
import { API_ENDPOINTS } from '@/consts/api.const'

export interface CreateUserFranchiseRoleRequest {
  user_id: number
  role_id: number
  franchise_id: number | null
}

export interface UserFranchiseRoleEntity {
  id: number
  user_id: number
  role_id: number
  franchise_id: number | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export const createUserFranchiseRole = (
  data: CreateUserFranchiseRoleRequest,
): Promise<UserFranchiseRoleEntity | null> => {
  return httpClient.post<UserFranchiseRoleEntity, CreateUserFranchiseRoleRequest>({
    url: API_ENDPOINTS.USER_FRANCHISE_ROLES,
    data,
  })
}

export const updateUserFranchiseRole = (
  userFranchiseRoleId: number,
  data: Partial<CreateUserFranchiseRoleRequest>,
): Promise<UserFranchiseRoleEntity | null> => {
  return httpClient.patch<UserFranchiseRoleEntity, Partial<CreateUserFranchiseRoleRequest>>({
    url: `${API_ENDPOINTS.USER_FRANCHISE_ROLES}/${userFranchiseRoleId}`,
    data,
  })
}

export const deleteUserFranchiseRole = (userFranchiseRoleId: number): Promise<null> => {
  return httpClient.delete<null>({
    url: `${API_ENDPOINTS.USER_FRANCHISE_ROLES}/${userFranchiseRoleId}`,
  })
}
