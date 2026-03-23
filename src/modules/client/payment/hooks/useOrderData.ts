import { useState, useEffect } from "react";
import { getPaymentByOrderId, getOrderbyCartId } from "@/apis/endpointsCLIENT/payment.api";
import type { OrderResponse } from "@/apis/endpointsCLIENT/payment.api";

export function useOrderData(cartId: string) {
  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [paymentId, setPaymentId] = useState<string | undefined>();

  // 1. Fetch order
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await getOrderbyCartId(cartId);
        if (response) setOrderData(response);
      } catch (error) {
        console.error("Failed to fetch order data:", error);
      }
    };

    if (cartId) fetchOrderData();
  }, [cartId]);

  // 2. Fetch payment (khi đã có orderData)
  useEffect(() => {
    console.log("cart id: ", cartId)
    const fetchPaymentData = async () => {
      if (!orderData?._id) return;

      try {
        const response = await getPaymentByOrderId(orderData._id);
        if (response) setPaymentId(response._id);
      } catch (error) {
        console.error("Failed to fetch payment data:", error);
      }
    };

    fetchPaymentData();
  }, [orderData]);

  return { orderData, paymentId };
}