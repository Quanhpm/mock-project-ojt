import { axiosClient } from "@/apis/axios.config";
import { httpClient } from "@/apis/httpClient";
import type {
  DeliverySearchItem,
  DeliverySearchPayload,
  DeliverySearchResponse,
} from "../models/delivery-management.models";

export const deliveryManagementService = {
  async searchDeliveries(payload: DeliverySearchPayload): Promise<DeliverySearchItem[]> {
    const response = await axiosClient.post<DeliverySearchResponse>("/deliveries/search", payload);

    return response.data.data ?? [];
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
