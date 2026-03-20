import { httpClient } from "@/apis/httpClient";
import type { PaymentDetail } from "../models/order.models";

export const paymentService = {
  getPaymentByOrderId(orderId: string) {
    return httpClient.get<PaymentDetail>({
      url: `/payments/order/${orderId}`,
    });
  },
};
