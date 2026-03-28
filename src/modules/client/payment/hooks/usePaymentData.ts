import { useState, useEffect } from "react";
import { getPaymentById } from "@/apis/endpointsCLIENT/payment.api";
import type { PaymentResponse } from "@/apis/endpointsCLIENT/payment.api";
import { getCustomerProfile } from "@/apis";
import type { CustomerUser } from "@/apis";
import { getOrderById } from "@/apis/endpointsCLIENT/payment.api";
import type { OrderResponse } from "@/apis/endpointsCLIENT/payment.api";

export function usePaymentData(paymentId: string) {
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [userInfo, setUserInfo] = useState<CustomerUser>();
  const [orderInfo, setOrderInfo] = useState<OrderResponse>();

  useEffect(() => {
    if (!paymentId) return;

    const fetchData = async () => {
      try {
        const paymentRes = await getPaymentById(paymentId);
        if (!paymentRes) return;

        setPaymentData(paymentRes);

        const userRes = await getCustomerProfile();
        if (userRes) setUserInfo(userRes);

        if (paymentRes.order_id) {
          const orderRes = await getOrderById(paymentRes.order_id);
          if (orderRes) setOrderInfo(orderRes);
        }
      } catch (error) {
        console.error("Fetch data failed:", error);
      }
    };

    fetchData();
  }, [paymentId]);

  return { paymentData, userInfo, orderInfo };
}
