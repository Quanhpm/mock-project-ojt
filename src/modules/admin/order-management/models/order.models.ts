export type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELED";

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
  franchise_name?: string;
  customer_name?: string;
  staff_name?: string;
  staff_email?: string;
  order_items: OrderItem[];
  created_at?: string;
}

export interface FranchiseOrderListItem {
  _id: string;
  code: string;
  status: OrderStatus;
  phone: string;
  subtotal_amount: number;
  final_amount: number;
  created_at: string;
}

export interface PaymentDetail {
  _id: string;
  franchise_id: string;
  customer_id: string;
  order_id: string;
  code: string;
  method: string;
  status: "PENDING" | "PAID" | "REFUNDED";
  amount: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}
