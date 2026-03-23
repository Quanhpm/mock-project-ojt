import type { OrderDetail } from "../models/order.models";
import type { UpdateCartPayload } from "../models/request.models";
import { cartService } from "../services/cart.service";
import { orderService } from "../services/order.service";

const ORDER_LOOKUP_RETRY_COUNT = 5;
const ORDER_LOOKUP_RETRY_DELAY_MS = 800;

const wait = async (ms: number) => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
};

export const checkoutCartUsecase = async (
  cartId: string,
  payload?: UpdateCartPayload,
): Promise<OrderDetail | null> => {
  await cartService.checkoutCart(cartId, payload);

  for (let attempt = 0; attempt < ORDER_LOOKUP_RETRY_COUNT; attempt += 1) {
    try {
      const order = await orderService.getOrderByCartId(cartId);

      if (order?._id) {
        return order;
      }
    } catch (error) {
      if (attempt === ORDER_LOOKUP_RETRY_COUNT - 1) {
        console.warn("[OrderPOS] Checkout succeeded but order detail is not ready yet", {
          cartId,
          attempts: ORDER_LOOKUP_RETRY_COUNT,
          error,
        });
      }
    }

    if (attempt < ORDER_LOOKUP_RETRY_COUNT - 1) {
      await wait(ORDER_LOOKUP_RETRY_DELAY_MS);
    }
  }

  return null;
};
