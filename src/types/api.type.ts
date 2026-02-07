// Generic API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface ApiError {
  success: false
  message: string
  errors?: string[]
  statusCode: number
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Filter types
export interface BaseFilter {
  search?: string
  is_active?: boolean
  is_deleted?: boolean
  created_at_from?: string
  created_at_to?: string
}

export interface ProductFilter extends BaseFilter {
  franchise_id?: number
  category_id?: number
  min_price?: number
  max_price?: number
}

export interface OrderFilter extends BaseFilter {
  franchise_id?: number
  customer_id?: number
  status?: string
  type?: string
  date_from?: string
  date_to?: string
}

export interface UserFilter extends BaseFilter {
  role_id?: number
  franchise_id?: number
}

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request config
export interface RequestConfig {
  method: HttpMethod
  url: string
  params?: Record<string, unknown>
  data?: unknown
  headers?: Record<string, string>
}