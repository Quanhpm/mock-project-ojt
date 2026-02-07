// Order type definition - aligned with DBML schema
export interface Order {
  id: number
  code: string
  franchise_id: number
  customer_id: number
  type: 'POS' | 'ONLINE'
  status: 'DRAFT' | 'CONFIRMED' | 'PREPARING' | 'COMPLETED' | 'CANCELLED'
  total_amount: number // Tổng tiền snapshot, không tính lại từ product
  confirmed_at: string | null // Chốt đơn
  completed_at: string | null // Hoàn tất
  cancelled_at: string | null // Huỷ
  created_by: number | null // Staff tạo (POS)
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Order Item type definition - aligned with DBML schema
export interface OrderItem {
  id: number
  order_id: number
  product_franchise_id: number
  product_name_snapshot: string // Tên tại thời điểm mua
  price_snapshot: number // Giá tại thời điểm mua
  quantity: number
  line_total: number // price × quantity
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Order Status Log type definition - aligned with DBML schema
export interface OrderStatusLog {
  id: number
  order_id: number
  from_status: 'DRAFT' | 'CONFIRMED' | 'PREPARING' | 'COMPLETED' | 'CANCELLED'
  to_status: 'DRAFT' | 'CONFIRMED' | 'PREPARING' | 'COMPLETED' | 'CANCELLED'
  changed_by: number | null
  note: string | null
  created_at: string
  updated_at: string
}