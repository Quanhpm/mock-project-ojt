// Product type definition - aligned with DBML schema
export interface Product {
  id: number
  SKU: string
  name: string
  description: string
  content: string
  min_price: number
  max_price: number
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Product Franchise type definition - aligned with DBML schema
export interface ProductFranchise {
  id: number
  franchise_id: number
  product_id: number
  price_base: number // product.min_price ≤ price_base ≤ product.max_price
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Category type definition - aligned with DBML schema
export interface Category {
  id: number
  code: string
  name: string
  description: string
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Category Franchise type definition - aligned with DBML schema
export interface CategoryFranchise {
  id: number
  category_id: number
  franchise_id: number
  display_order: number
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Product Category Franchise type definition - aligned with DBML schema
export interface ProductCategoryFranchise {
  id: number
  category_franchise_id: number
  product_franchise_id: number
  display_order: number
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Inventory type definition - aligned with DBML schema
export interface Inventory {
  id: number
  product_franchise_id: number
  quantity: number
  alert_threshold: number
  is_active: boolean // true -> AVAILABLE / OUT_OF_STOCK
  is_deleted: boolean
  created_at: string
  updated_at: string
}