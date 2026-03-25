export const PAYMENT_HISTORY_STATUSES = ["PENDING", "PAID", "REFUNDED"] as const;

export type PaymentHistoryStatus = (typeof PAYMENT_HISTORY_STATUSES)[number];

export interface PaymentHistoryFranchiseRef {
  _id: string;
  name: string;
}

export interface PaymentHistoryCustomerRef {
  _id: string;
  name: string;
}

export interface PaymentHistoryOrderRef {
  _id: string;
  code: string;
}

export interface PaymentHistoryItem {
  _id: string;
  franchise_id: PaymentHistoryFranchiseRef | null;
  customer_id: PaymentHistoryCustomerRef | null;
  order_id: PaymentHistoryOrderRef | null;
  code: string;
  method: string;
  status: PaymentHistoryStatus;
  amount: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  paid_at?: string | null;
}

export interface PaymentHistoryFilters {
  status: PaymentHistoryStatus | "";
  dateFrom: string;
  dateTo: string;
}
