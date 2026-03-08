// Product interface from API
export interface Product {
  id: string;
  SKU: string;
  name: string;
  description: string;
  content: string;
  image_url: string;
  images_url: string[];
  min_price: number;
  max_price: number;
  is_active: boolean;
  is_deleted: boolean;
  is_have_topping: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Create product payload
export interface ProductCreatePayload {
  SKU: string;
  name: string;
  description: string;
  content: string;
  image_url: string;
  images_url?: string[];
  min_price: number;
  max_price: number;
  is_have_topping?: boolean;
}

// Update product payload
export interface ProductUpdatePayload extends Partial<ProductCreatePayload> {}

// Search payload
export interface ProductSearchPayload {
  searchCondition?: {
    keyword?: string;
    min_price?: number;
    max_price?: number;
    is_active?: boolean;
    is_deleted?: boolean;
  };
  pageInfo?: {
    pageNum: number;
    pageSize: number;
  };
}

// Status payload
export interface ProductStatusPayload {
  is_active: boolean;
}

// Search response
export interface ProductSearchResponse {
  success: boolean;
  data: Product[];
  pageInfo?: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  message?: string;
}

// Single product response
export interface ProductResponse {
  success: boolean;
  data: Product;
  message?: string;
}

// Product select item (for dropdowns)
export interface ProductSelectItem {
  value: string;
  label: string;
  SKU: string;
  min_price: number;
  max_price: number;
}
