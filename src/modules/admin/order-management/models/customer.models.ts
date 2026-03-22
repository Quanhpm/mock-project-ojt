export interface CustomerOption {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  avatar_url?: string;
  is_active: boolean;
  is_deleted?: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerSearchPageInfo {
  pageNum: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
