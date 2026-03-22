import type { CartDetail } from "../models/cart.models";
import type { StaffCartItemInput } from "../models/request.models";
import { cartService } from "../services/cart.service";
import { addCartItemsUsecase } from "./add-cart-items.usecase";

interface ReplaceCartItemWithRestoreInput {
  cartItemId: string;
  customerId: string;
  franchiseId: string;
  currentCartItemInput: StaffCartItemInput;
  nextCartItemInput: StaffCartItemInput;
}

export const replaceCartItemWithRestoreUsecase = async ({
  cartItemId,
  customerId,
  franchiseId,
  currentCartItemInput,
  nextCartItemInput,
}: ReplaceCartItemWithRestoreInput): Promise<CartDetail | null> => {
  let deletedOriginalItem = false;

  try {
    await cartService.deleteCartItem(cartItemId);
    deletedOriginalItem = true;

    return await addCartItemsUsecase(customerId, franchiseId, [nextCartItemInput]);
  } catch (error) {
    if (deletedOriginalItem) {
      try {
        await addCartItemsUsecase(customerId, franchiseId, [currentCartItemInput]);
      } catch (restoreError) {
        console.error("[OrderPOS] Failed to restore cart item after replace error", restoreError);
      }
    }

    throw error;
  }
};
