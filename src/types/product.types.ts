// Product interface from API
export interface Product {
  id: string;
  SKU: string;
  name: string;
  description?: string;
  content?: string;
  image_url?: string;
  images_url?: string[];
  min_price?: number;
  max_price?: number;
  is_active?: boolean;
  is_deleted?: boolean;
  is_have_topping?: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductTableItem extends Product {
  tableRowId: string;
  masterProductId: string;
  displayPrice: number;
  franchiseName?: string;
  sizeLabel?: string;
  sourceType: "MASTER_PRODUCT" | "PRODUCT_FRANCHISE";
}

export interface ProductFranchise {
  id: string;
  franchise_id: string;
  product_id: string;
  size?: string;
  price_base?: number;
  is_active?: boolean;
  is_deleted?: boolean;
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
  searchCondition: {
    keyword?: string;
    franchise_id?: string;
    min_price?: number | string;
    max_price?: number | string;
    is_active?: boolean | "";
    is_deleted?: boolean;
  };
  pageInfo: {
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
