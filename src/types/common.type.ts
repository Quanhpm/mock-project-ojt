// Franchise type definition - aligned with DBML schema
export interface Franchise {
  id: number
  code: string
  name: string
  logo_url: string
  address: string
  opened_at: string
  closed_at: string | null
  google_map_script?: string | null
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Customer type definition - aligned with DBML schema
export interface Customer {
  id: number
  phone: string
  email: string | null
  name: string
  avatar_url: string
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Customer Franchise type definition - aligned with DBML schema
export interface CustomerFranchise {
  id: number
  customer_id: number
  franchise_id: number
  loyalty_point: number // default 0
  loyalty_tier: 'Silver' | 'Gold' | 'Platinum'
  first_order_at: string | null
  last_order_at: string | null
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Shift type definition - aligned with DBML schema
export interface Shift {
  id: number
  franchise_id: number
  name: string // Morning / Evening
  start_time: string // time format
  end_time: string // time format
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Shift Assignment type definition - aligned with DBML schema
export interface ShiftAssignment {
  id: number
  shift_id: number
  user_id: number
  work_date: string // date format
  assigned_by: number // Manager assign
  status: 'ASSIGNED' | 'COMPLETED' | 'ABSENT'
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Promotion type definition - aligned with DBML schema
export interface Promotion {
  id: number
  franchise_id: number // Promotion theo store
  product_franchise_id: number | null // nullable: NULL = áp dụng toàn store
  type: 'PERCENT' | 'FIXED'
  value: number // % or money
  start_time: string
  end_time: string
  created_by: number // Admin / Manager
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Loyalty Transaction type definition - aligned with DBML schema
export interface LoyaltyTransaction {
  id: number
  customer_franchise_id: number
  order_id: number | null
  type: 'EARN' | 'REDEEM' | 'ADJUST'
  point_change: number // + / -
  reason: string
  created_by: number | null // Staff / Manager
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Audit Log type definition - aligned with DBML schema
export interface AuditLog {
  id: number
  entity_type: string // order / product / user / …
  entity_id: number
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE'
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  changed_by: number
  note: string | null
  created_at: string
  updated_at: string
}