import { httpClient } from "@/apis/httpClient";
import type { PaymentDetail } from "../models/order.models";
import type {
  ConfirmPaymentPayload,
  RefundPaymentPayload,
} from "../models/request.models";

export const paymentService = {
  getPaymentByOrderId(orderId: string) {
    return httpClient.get<PaymentDetail>({
      url: `/payments/order/${orderId}`,
    });
  },

  getPaymentsByCustomerId(customerId: string) {
    return httpClient.get<PaymentDetail[]>({
      url: `/payments/customer/${customerId}`,
    });
  },

  confirmPayment(paymentId: string, payload: ConfirmPaymentPayload) {
    return httpClient.put<PaymentDetail, ConfirmPaymentPayload>({
      url: `/payments/${paymentId}/confirm`,
      data: payload,
    });
  },

  refundPayment(paymentId: string, payload: RefundPaymentPayload) {
    return httpClient.put<PaymentDetail, RefundPaymentPayload>({
      url: `/payments/${paymentId}/refund`,
      data: payload,
    });
  },
};
