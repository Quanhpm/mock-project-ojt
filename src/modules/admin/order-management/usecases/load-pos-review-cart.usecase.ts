import type { CartDetail } from "../models/cart.models";
import { cartService } from "../services/cart.service";
import { getActiveCartUsecase } from "./get-active-cart.usecase";

interface LoadPosReviewCartUsecaseInput {
  cartId?: string | null;
  activeCartId?: string | null;
  customerId?: string | null;
  franchiseId?: string | null;
  selectedAdminFranchiseId?: string | null;
}

export const loadPosReviewCartUsecase = async ({
  cartId,
  activeCartId,
  customerId,
  franchiseId,
  selectedAdminFranchiseId,
}: LoadPosReviewCartUsecaseInput): Promise<CartDetail | null> => {
  if (cartId) {
    return cartService.getCartDetail(cartId);
  }

  if (activeCartId) {
    return cartService.getCartDetail(activeCartId);
  }

  if (customerId) {
    return getActiveCartUsecase(customerId, franchiseId ?? selectedAdminFranchiseId ?? undefined);
  }

  return null;
};
