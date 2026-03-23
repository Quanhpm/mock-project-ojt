import { httpClient } from "@/apis/httpClient";
import type { CartDetail, CartStatus } from "../models/cart.models";
import type {
  ApplyVoucherPayload,
  RemoveCartItemOptionPayload,
  ReplaceCartItemOptionsPayload,
  StaffBulkAddToCartRequest,
  UpdateCartItemOptionPayload,
  UpdateCartItemPayload,
  UpdateCartPayload,
} from "../models/request.models";

type CartMutationResponse =
  | CartDetail
  | {
      cart?: CartDetail | null;
    }
  | null;

const isCartDetail = (value: unknown): value is CartDetail => {
  return Boolean(
    value &&
      typeof value === "object" &&
      "_id" in value &&
      typeof (value as { _id?: unknown })._id === "string",
  );
};

const extractCartDetail = (response: CartMutationResponse): CartDetail | null => {
  if (isCartDetail(response)) {
    return response;
  }

  if (response && typeof response === "object" && "cart" in response) {
    const nestedCart = (response as { cart?: unknown }).cart;
    return isCartDetail(nestedCart) ? nestedCart : null;
  }

  return null;
};

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
      const response = await httpClient.patch<CartMutationResponse, UpdateCartItemPayload>({
        url: "/carts/items/update-cart-item",
        data: payload,
      });

      return extractCartDetail(response);
    } catch (error) {
      console.warn("[OrderPOS] PATCH update-cart-item failed, retrying with PUT", error);
      const response = await httpClient.put<CartMutationResponse, UpdateCartItemPayload>({
        url: "/carts/items/update-cart-item",
        data: payload,
      });

      return extractCartDetail(response);
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

  updateCartItemOption(payload: UpdateCartItemOptionPayload) {
    return httpClient.patch<null, UpdateCartItemOptionPayload>({
      url: "/carts/items/update-option",
      data: payload,
    });
  },

  removeCartItemOption(payload: RemoveCartItemOptionPayload) {
    return httpClient.patch<null, RemoveCartItemOptionPayload>({
      url: "/carts/items/remove-option",
      data: payload,
    });
  },

  async applyVoucher(cartId: string, payload: ApplyVoucherPayload) {
    const response = await httpClient.put<CartMutationResponse, ApplyVoucherPayload>({
      url: `/carts/${cartId}/apply-voucher`,
      data: payload,
    });

    return extractCartDetail(response) ?? this.getCartDetail(cartId);
  },

  async removeVoucher(cartId: string) {
    const response = await httpClient.delete<CartMutationResponse>({
      url: `/carts/${cartId}/remove-voucher`,
    });

    return extractCartDetail(response) ?? this.getCartDetail(cartId);
  },

  checkoutCart(cartId: string, payload?: UpdateCartPayload) {
    return httpClient.put<CartDetail, UpdateCartPayload | undefined>({
      url: `/carts/${cartId}/checkout`,
      data: payload,
    });
  },

  cancelCart(cartId: string) {
    return httpClient.put<null>({
      url: `/carts/${cartId}/cancel`,
    });
  },
};
