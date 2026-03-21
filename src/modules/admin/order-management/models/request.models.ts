import type { OrderStatus } from "./order.models";

export interface SearchCustomersRequest {
  searchCondition: {
    keyword: string;
    is_active?: boolean | null;
    is_deleted?: boolean;
  };
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}

export interface CartItemOptionInput {
  product_franchise_id: string;
  quantity: number;
}

export interface StaffCartItemInput {
  product_franchise_id: string;
  quantity: number;
  note?: string;
  options?: CartItemOptionInput[];
}

export interface StaffBulkAddToCartRequest {
  customer_id: string;
  franchise_id: string;
  items: StaffCartItemInput[];
}

export interface UpdateCartPayload {
  address?: string;
  phone?: string;
  message?: string;
}

export interface ReplaceCartItemOptionsPayload {
  cart_item_id: string;
  options: CartItemOptionInput[];
}

export interface UpdateCartItemPayload {
  cart_item_id: string;
  quantity: number;
}

export interface SearchFranchiseOrdersParams {
  franchiseId: string;
  status?: OrderStatus | "";
}
