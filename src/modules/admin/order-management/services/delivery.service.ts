import { httpClient } from "@/apis/httpClient";
import type { DeliveryDetail } from "../models/order.models";

export const deliveryService = {
  getDeliveryByOrderId(orderId: string) {
    return httpClient.get<DeliveryDetail>({
      url: `/deliveries/order/${orderId}`,
    });
  },

  markPickup(deliveryId: string) {
    return httpClient.put<null>({
      url: `/deliveries/${deliveryId}/pickup`,
    });
  },

  markComplete(deliveryId: string) {
    return httpClient.put<null>({
      url: `/deliveries/${deliveryId}/complete`,
    });
  },
};
