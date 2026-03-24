import { useEffect, useState } from "react";
import { getOrderById, getOrderbyCartId, getPaymentByOrderId } from "@/apis/endpointsCLIENT/payment.api";
import type { OrderResponse } from "@/apis/endpointsCLIENT/payment.api";

interface UseOrderDataParams {
  cartId?: string;
  orderId?: string;
}

export function useOrderData({
  cartId = "",
  orderId = "",
}: UseOrderDataParams) {
  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [paymentId, setPaymentId] = useState<string | undefined>();

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = cartId
          ? await getOrderbyCartId(cartId)
          : orderId
            ? await getOrderById(orderId)
            : null;

        if (response) setOrderData(response);
      } catch (error) {
        console.error("Failed to fetch order data:", error);
      }
    };

    if (cartId || orderId) {
      void fetchOrderData();
    }
  }, [cartId, orderId]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      const targetOrderId = orderId || orderData?._id;
      if (!targetOrderId) return;

      try {
        const response = await getPaymentByOrderId(targetOrderId);
        if (response?._id) {
          setPaymentId(response._id);
        }
      } catch (error) {
        console.error("Failed to fetch payment data:", error);
      }
    };

    void fetchPaymentData();
  }, [orderData, orderId]);

  return { orderData, paymentId };
}
