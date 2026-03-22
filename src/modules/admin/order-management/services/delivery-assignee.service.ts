import { httpClient } from "@/apis/httpClient";
import type { DeliveryAssigneeOption } from "../models/delivery-assignee.models";

export const deliveryAssigneeService = {
  getAssignableStaffByFranchise(franchiseId: string) {
    return httpClient.get<DeliveryAssigneeOption[]>({
      url: `/user-franchise-roles/franchise/${franchiseId}`,
    });
  },
};
