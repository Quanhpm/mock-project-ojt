import { cartService } from "../services/cart.service";

export const getActiveCartUsecase = async (customerId: string, franchiseId?: string) => {
  const carts = await cartService.getCartsByCustomerId(customerId, "ACTIVE");

  if (!franchiseId) {
    return carts?.[0] ?? null;
  }

  const cartsInCurrentFranchise =
    carts?.filter((cart) => cart.franchise_id === franchiseId) ?? [];

  if (cartsInCurrentFranchise.length > 1) {
    console.warn("[OrderPOS] Customer has multiple active carts in the same franchise", {
      customerId,
      franchiseId,
      cartIds: cartsInCurrentFranchise.map((cart) => cart._id),
    });
  }

  return cartsInCurrentFranchise[0] ?? null;
};
