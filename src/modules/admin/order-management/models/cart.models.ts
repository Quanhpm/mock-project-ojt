export type CartStatus = "ACTIVE" | "CHECKED_OUT" | "CANCELED";

export interface CartProductSummary {
  name: string;
  image_url: string;
}

export interface CartItemOption {
  quantity: number;
  product_franchise_id: string;
  price_snapshot?: number;
  discount_amount?: number;
  final_price?: number;
  product_name?: string;
  product_image_url?: string;
  product?: CartProductSummary;
}

export interface CartItem {
  cart_item_id: string;
  quantity: number;
  product_franchise_id: string;
  product_cart_price: number;
  discount_amount: number;
  line_total: number;
  final_line_total: number;
  options_hash: string;
  note: string;
  product_name?: string;
  product_image_url?: string;
  product?: CartProductSummary;
  selected_size_label?: string;
  options: CartItemOption[];
}

export interface CartDetail {
  _id: string;
  customer_id: string;
  franchise_id: string;
  staff_id?: string;
  status: CartStatus;
  address?: string;
  phone?: string;
  message?: string;
  promotion_discount: number;
  promotion_type?: string;
  promotion_value?: number;
  voucher_discount: number;
  voucher_type?: string;
  voucher_value?: number;
  loyalty_points_used: number;
  loyalty_discount: number;
  subtotal_amount: number;
  final_amount: number;
  promotion_id?: string;
  voucher_id?: string;
  voucher_code?: string;
  franchise_name?: string;
  customer_name?: string;
  staff_name?: string;
  staff_email?: string;
  cart_items?: CartItem[];
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}
