// User API endpoints
import { httpClient } from "@/apis/httpClient";

// ======================== Types ========================

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
}

export interface UpdateUserRequest {
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
}

export interface UpdateUserResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
}

export interface AssignUserFranchiseRoleRequest {
  user_id: string;
  role_id: string;
  franchise_id: string | null;
  note: string;
}

export interface AssignUserFranchiseRoleResponse {
  _id: string;
  user_id: string;
  role_id: string;
  franchise_id: string | null;
}

export interface UserFranchiseRoleDetail {
  _id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  franchise_id: string;
  franchise_name: string;
  role_id: string;
  role_name: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignUserFranchiseRoleResponse {
  _id: string;
  user_id: string;
  role_id: string;
  franchise_id: string | null;
}

export interface FranchiseSelectItem {
  value: string;
  code: string;
  name: string;
}

export interface UserStatusPayload {
  is_active: boolean;
}

// User interface from API
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
  is_active: boolean;
  is_verified: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// Search payload (USER-02)
export interface UserSearchPayload {
  searchCondition?: {
    keyword?: string; // Search in username, email, full_name, phone
    role_id?: string; // Filter by role
    is_active?: string | boolean;
    is_deleted?: string | boolean;
  };
  pageInfo?: {
    pageNum: number;
    pageSize: number;
  };
}

// Search response
export interface UserSearchResponse {
  success: boolean;
  data: User[];
  pageInfo?: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  message?: string;
}

// ======================== API Functions ========================

/** POST /api/users/search — Tìm kiếm users với pagination (USER-02) */
export const searchUsers = (
  payload: UserSearchPayload,
): Promise<UserSearchResponse> => {
  return httpClient.search<User, UserSearchPayload>({
    url: "/users/search",
    data: payload,
  }) as Promise<UserSearchResponse>;
};

/** POST /api/users — Tạo user mới */
export const createUser = (
  data: CreateUserRequest,
): Promise<CreateUserResponse | null> => {
  return httpClient.post<CreateUserResponse, CreateUserRequest>({
    url: "/users",
    data,
  });
};

/** PUT /api/users/:id — Cập nhật thông tin user */
export const updateUser = (
  userId: string,
  data: UpdateUserRequest,
): Promise<UpdateUserResponse | null> => {
  return httpClient.put<UpdateUserResponse, UpdateUserRequest>({
    url: `/users/${userId}`,
    data,
  });
};

/** DELETE /api/users/:id — Xoá user */
export const deleteUser = (userId: string): Promise<null> => {
  return httpClient.delete<null>({
    url: `/users/${userId}`,
  });
};

/** PATCH /api/users/:id/status — Thay đổi trạng thái Active/Inactive của user (USER-07) */
export const changeUserStatus = (
  userId: string,
  data: UserStatusPayload,
): Promise<null> => {
  return httpClient.patch<null, UserStatusPayload>({
    url: `/users/${userId}/status`,
    data,
  });
};

/** GET /api/user-franchise-roles/user/:userId — Lấy danh sách role + franchise của user */
export const getUserFranchiseRoles = (
  userId: string,
): Promise<UserFranchiseRoleDetail[] | null> => {
  return httpClient.get<UserFranchiseRoleDetail[]>({
    url: `/user-franchise-roles/user/${userId}`,
  });
};

/** POST /api/user-franchise-roles — Gán role + franchise cho user */
export const assignUserFranchiseRole = (
  data: AssignUserFranchiseRoleRequest,
): Promise<AssignUserFranchiseRoleResponse | null> => {
  return httpClient.post<
    AssignUserFranchiseRoleResponse,
    AssignUserFranchiseRoleRequest
  >({
    url: "/user-franchise-roles",
    data,
  });
};

/** GET /api/franchises/select — Lấy danh sách franchise cho dropdown */
export const getFranchisesForSelect = (): Promise<
  FranchiseSelectItem[] | null
> => {
  return httpClient.get<FranchiseSelectItem[]>({
    url: "/franchises/select",
  });
};
