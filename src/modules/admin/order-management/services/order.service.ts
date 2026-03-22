import { httpClient } from "@/apis/httpClient";
import type { FranchiseOrderListItem, OrderDetail, OrderStatus } from "../models/order.models";
import type { ReadyForPickupPayload } from "../models/request.models";

export const orderService = {
  getOrderByCartId(cartId: string) {
    return httpClient.get<OrderDetail>({
      url: `/orders/cart/${cartId}`,
    });
  },

  getOrdersByFranchise(franchiseId: string, status?: OrderStatus | "") {
    return httpClient.get<FranchiseOrderListItem[], { status?: OrderStatus | "" }>({
      url: `/orders/franchise/${franchiseId}`,
      params: { status },
    });
  },

  getOrderById(orderId: string) {
    return httpClient.get<OrderDetail>({
      url: `/orders/${orderId}`,
    });
  },

  getOrderByCode(code: string) {
    return httpClient.get<OrderDetail, { code: string }>({
      url: "/orders/code",
      params: { code },
    });
  },

  markPreparing(orderId: string) {
    return httpClient.put<null>({
      url: `/orders/${orderId}/preparing`,
    });
  },

  markReadyForPickup(orderId: string, payload: ReadyForPickupPayload) {
    return httpClient.put<null, ReadyForPickupPayload>({
      url: `/orders/${orderId}/ready-for-pickup`,
      data: payload,
    });
  },
};
