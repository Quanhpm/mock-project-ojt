import type { OrderDetail } from "../models/order.models";
import type { UpdateCartPayload } from "../models/request.models";
import { cartService } from "../services/cart.service";
import { orderService } from "../services/order.service";

export const checkoutCartUsecase = async (
  cartId: string,
  payload?: UpdateCartPayload,
): Promise<OrderDetail | null> => {
  if (payload) {
    await cartService.updateCart(cartId, payload);
  }

  await cartService.checkoutCart(cartId);
  return orderService.getOrderByCartId(cartId);
};
