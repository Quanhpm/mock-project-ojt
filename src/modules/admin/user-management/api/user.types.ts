// ============================================================================
// USER TYPES
// ============================================================================

export interface UserItem {
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

// ============================================================================
// SEARCH TYPES
// ============================================================================

export interface UserSearchFilters {
  keyword: string;
  is_active?: string;
  is_deleted: boolean;
}

export interface UserSearchPayload {
  searchCondition: {
    keyword?: string;
    is_active?: boolean;
    is_deleted?: boolean;
  };
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}

export interface UserSearchResponse {
  success: boolean;
  data: UserItem[];
  pageInfo?: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  message?: string;
}

// ============================================================================
// CRUD TYPES
// ============================================================================

export interface UserCreatePayload {
  email: string;
  name: string;
  phone: string;
  password: string;
  avatar_url?: string;
}

export interface UserUpdatePayload extends Partial<UserCreatePayload> {}

export interface UserStatusPayload {
  is_active: boolean;
}
