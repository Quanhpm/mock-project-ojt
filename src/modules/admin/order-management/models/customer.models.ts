export interface CustomerOption {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
}

export interface CustomerSearchPageInfo {
  pageNum: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
