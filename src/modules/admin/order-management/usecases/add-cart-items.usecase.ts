import type { CartDetail } from "../models/cart.models";
import type { StaffBulkAddToCartRequest, StaffCartItemInput } from "../models/request.models";
import { cartService } from "../services/cart.service";

export const addCartItemsUsecase = async (
  customerId: string,
  franchiseId: string,
  items: StaffCartItemInput[],
): Promise<CartDetail | null> => {
  const payload: StaffBulkAddToCartRequest = {
    customer_id: customerId,
    franchise_id: franchiseId,
    items,
  };

  return cartService.addItemsByStaff(payload);
};
