import { httpClient } from "../httpClient";

export type ClientOrderStatusCode =
  | "PREPARING"
  | "COMPLETED"
  | "CANCELLED"
  | "CONFIRMED"
  | "DRAFT";

export interface ClientOrder {
  id: string | number;
  code: string;
  store: {
    id: string | number;
    name: string;
  };
  channel: string;
  status: {
    code: ClientOrderStatusCode;
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

export interface ClientOrdersSummary {
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  preparing_orders: number;
  total_revenue: {
    value: number;
    currency: string;
  };
}

export interface GetOrdersByCustomerIdResponse {
  summary?: ClientOrdersSummary;
  orders: ClientOrder[];
}

export const getOrdersByCustomerId = (
  customerId: string,
): Promise<GetOrdersByCustomerIdResponse | ClientOrder[] | null> => {
  return httpClient.get<GetOrdersByCustomerIdResponse | ClientOrder[]>({
    url: `/orders/customer/${customerId}`,
  });
};
