import { cartService } from "../services/cart.service";

export const getActiveCartUsecase = async (customerId: string) => {
  const carts = await cartService.getCartsByCustomerId(customerId, "ACTIVE");
  return carts?.[0] ?? null;
};
