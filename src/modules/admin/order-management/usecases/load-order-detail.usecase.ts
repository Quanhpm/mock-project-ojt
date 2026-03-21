import { orderService } from "../services/order.service";
import { paymentService } from "../services/payment.service";

export const loadOrderDetailUsecase = async (orderId: string) => {
  const [order, payment] = await Promise.all([
    orderService.getOrderById(orderId),
    paymentService.getPaymentByOrderId(orderId).catch(() => null),
  ]);

  return {
    order,
    payment,
  };
};
