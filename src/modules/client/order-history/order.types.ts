
export interface OrderData {
  id: number;
  code: string;
  store: {
    id: number;
    name: string;
  };
  channel: string;
  status: {
    code: 'PREPARING' | 'COMPLETED' | 'CANCELLED' | 'CONFIRMED' | 'DRAFT';
    label: string;
    color: string;
  };
  pricing: {
    total: number;
    currency: string;
  };
  meta: {
    items_count: number;
    created_at: string;
  };
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
