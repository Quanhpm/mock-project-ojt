import type { CartDetail, CartItem } from "../models/cart.models";
import { buildStaffCartItemInputsFromDraftItems } from "../services/pos-product-config.service";
import { addCartItemsUsecase } from "./add-cart-items.usecase";

export const persistDraftCartUsecase = async (
  customerId: string,
  franchiseId: string,
  draftItems: CartItem[],
): Promise<CartDetail | null> => {
  if (draftItems.length === 0) {
    return null;
  }

  return addCartItemsUsecase(
    customerId,
    franchiseId,
    buildStaffCartItemInputsFromDraftItems(draftItems),
  );
};
