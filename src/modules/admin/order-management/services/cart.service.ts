import { httpClient } from "@/apis/httpClient";
import type { CartDetail, CartStatus } from "../models/cart.models";
import type {
  ReplaceCartItemOptionsPayload,
  StaffBulkAddToCartRequest,
  UpdateCartItemPayload,
  UpdateCartPayload,
} from "../models/request.models";

export const cartService = {
  getCartsByCustomerId(customerId: string, status?: CartStatus) {
    return httpClient.get<CartDetail[], { status?: CartStatus }>({
      url: `/carts/customer/${customerId}`,
      params: { status },
    });
  },

  getCartDetail(cartId: string) {
    return httpClient.get<CartDetail>({
      url: `/carts/${cartId}`,
    });
  },

  addItemsByStaff(payload: StaffBulkAddToCartRequest) {
    return httpClient.post<CartDetail, StaffBulkAddToCartRequest>({
      url: "/carts/items/staff-bulk",
      data: payload,
    });
  },

  updateCart(cartId: string, payload: UpdateCartPayload) {
    return httpClient.put<CartDetail, UpdateCartPayload>({
      url: `/carts/${cartId}`,
      data: payload,
    });
  },

  async updateCartItem(payload: UpdateCartItemPayload) {
    try {
      return await httpClient.patch<CartDetail, UpdateCartItemPayload>({
        url: "/carts/items/update-cart-item",
        data: payload,
      });
    } catch (error) {
      console.warn("[OrderPOS] PATCH update-cart-item failed, retrying with PUT", error);
      return httpClient.put<CartDetail, UpdateCartItemPayload>({
        url: "/carts/items/update-cart-item",
        data: payload,
      });
    }
  },

  deleteCartItem(cartItemId: string) {
    return httpClient.delete<null>({
      url: `/carts/items/${cartItemId}`,
    });
  },

  replaceCartItemOptions(payload: ReplaceCartItemOptionsPayload) {
    return httpClient.put<null, ReplaceCartItemOptionsPayload>({
      url: "/carts/items/update-options-cart-item",
      data: payload,
    });
  },

  checkoutCart(cartId: string) {
    return httpClient.put<CartDetail>({
      url: `/carts/${cartId}/checkout`,
    });
  },
};
