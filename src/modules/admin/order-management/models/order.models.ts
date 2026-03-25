export type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELED";

export interface DeliveryReference {
  _id?: string;
}

export interface DeliveryDetail {
  _id: string;
  order_id: string;
  customer_id: string;
  assigned_by?: string;
  assigned_to?: string;
  status?: string;
  assigned_at?: string;
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  __v?: number;
  order_code?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  franchise_id?: string;
  franchise_name?: string;
  assigned_to_name?: string;
  assigned_to_email?: string;
  assigned_by_name?: string;
  assigned_by_email?: string;
}

export interface OrderItemOption {
  quantity: number;
  product_franchise_id: string;
  price_snapshot: number;
  discount_amount: number;
  final_price: number;
  product_name: string;
  product_image_url: string;
}

export interface OrderItem {
  order_item_id: string;
  quantity: number;
  product_franchise_id: string;
  price_snapshot: number;
  discount_amount: number;
  line_total: number;
  final_line_total: number;
  options_hash: string;
  product_name: string;
  product_image_url: string;
  options: OrderItemOption[];
}

export interface OrderDetail {
  _id: string;
  customer_id: string;
  franchise_id: string;
  delivery_id?: string;
  delivery?: DeliveryReference | null;
  cart_id?: string;
  staff_id?: string;
  code: string;
  status: OrderStatus;
  address?: string;
  phone?: string;
  message?: string;
  promotion_discount: number;
  voucher_discount: number;
  loyalty_discount: number;
  subtotal_amount: number;
  final_amount: number;
  promotion_id?: string;
  promotion_type?: string;
  promotion_value?: number;
  voucher_type?: string;
  voucher_value?: number;
  loyalty_points_used?: number;
  failed_reason?: string;
  franchise_name?: string;
  customer_name?: string;
  staff_name?: string;
  staff_email?: string;
  order_items: OrderItem[];
  created_at?: string;
}

export interface FranchiseOrderListItem {
  _id: string;
  customer_id?: string;
  customer_name?: string;
  code: string;
  status: OrderStatus;
  phone: string;
  subtotal_amount: number;
  final_amount: number;
  created_at: string;
}

export interface StaffQueueOrder {
  _id: string;
  code: string;
  status: OrderStatus;
  customer_name?: string;
  phone?: string;
  franchise_id: string;
  franchise_name?: string;
  created_at: string;
  order_items: OrderItem[];
  detailLoadState?: "idle" | "loading" | "loaded" | "failed";
  detailLoadFailed?: boolean;
}

export type StaffQueueSortMode = "ALL" | "CONFIRMED" | "READY_TO_PICKUP";

export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED";

export interface PaymentDetail {
  _id: string;
  franchise_id: string;
  customer_id: string;
  order_id: string;
  code: string;
  method: string;
  status: PaymentStatus;
  amount: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  __v?: number;
}
