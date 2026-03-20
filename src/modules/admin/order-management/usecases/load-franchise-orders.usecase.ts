import type { OrderStatus } from "../models/order.models";
import { orderService } from "../services/order.service";

export const loadFranchiseOrdersUsecase = (
  franchiseId: string,
  status?: OrderStatus | "",
) => {
  return orderService.getOrdersByFranchise(franchiseId, status);
};
