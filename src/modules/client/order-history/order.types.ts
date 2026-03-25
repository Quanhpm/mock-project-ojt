
export interface OrderItemOptionData {
  id: string;
  name: string;
  quantity: number;
  priceSnapshot: number;
  finalLineTotal: number;
}

export interface OrderItemData {
  id: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  priceSnapshot: number;
  finalLineTotal: number;
  options: OrderItemOptionData[];
}

export interface OrderData {
  id: string | number;
  code: string;
  cartId?: string;
  failed_reason?: string;
  store: {
    id: string | number;
    name: string;
  };
  channel: string;
  status: {
    code: 'PREPARING' | 'COMPLETED' | 'CANCELLED' | 'CONFIRMED' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DRAFT';
    label: string;
    color: string;
  };
  pricing: {
    total: number;
    currency: string;
    subtotal?: number;
    promotionDiscount?: number;
    voucherDiscount?: number;
    finalAmount?: number;
  };
  meta: {
    items_count: number;
    created_at: string;
  };
  fail_reason?: string | null;
  message?: string | null;
  orderItems: OrderItemData[];
}

export interface OrdersResponse {
  success: boolean;
  data: {
    summary: {
      total_orders: number;
      completed_orders: number;
      cancelled_orders: number;
      preparing_orders: number;
      total_revenue: {
        value: number;
        currency: string;
      };
    };
    orders: OrderData[];
  };
}

export type FilterOption = 'all' | 'completed' | 'pending' | 'cancelled';
