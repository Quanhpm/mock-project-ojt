export const DELIVERY_STATUS_VALUES = ["ASSIGNED", "PICKED_UP", "DELIVERED"] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUS_VALUES)[number];

export interface DeliverySearchPayload {
  franchise_id: string;
  staff_id: string;
  customer_id: string;
  status: DeliveryStatus | "";
}

export interface DeliverySearchItem {
  _id: string;
  order_id: string;
  customer_id: string;
  assigned_by: string;
  assigned_to: string;
  status: string;
  assigned_at?: string | null;
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  __v?: number;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  order_code?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  order_address?: string | null;
  order_phone?: string | null;
  order_message?: string | null;
  franchise_id?: string | null;
  franchise_name?: string | null;
  assigned_to_name?: string | null;
  assigned_to_email?: string | null;
  assigned_by_name?: string | null;
  assigned_by_email?: string | null;
}

export interface DeliverySearchResponse {
  success: boolean;
  data: DeliverySearchItem[];
}
