import { useState, useEffect } from "react"
import { getPaymentByOrderId, getOrderbyId } from "@/apis/endpointsCLIENT/payment.api";
import type { PaymentResponse, OrderResponse } from "@/apis/endpointsCLIENT/payment.api";

export function usePaymentData(orderId: string) {
    const [orderData, setOrderData] = useState<OrderResponse>();
      const fetchOrderData = async () => {
        try {
          const response = await getOrderbyId(orderId);
          if (response) setOrderData(response)
        }
        catch (error) {
          console.error("Failed to fetch order data:", error)
        }
      }
      const [paymentData, setPaymentData] = useState<PaymentResponse>()
      const fetchPaymentData = async () => {
        try {
          const response = await getPaymentByOrderId(orderId);
          if (response) setPaymentData(response)
        }
        catch (error) {
          console.error("Failed to fetch payment data:", error)
        }
      }
      useEffect(() => {
        const fetch = async () => {
          await fetchOrderData();
          await fetchPaymentData();
        }
        fetch();
      }, [])

      return { orderData, paymentData }
}