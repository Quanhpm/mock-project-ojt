import { httpClient } from "@/apis/httpClient";
import type { OrderFranchiseOption } from "../models/franchise.models";

interface FranchiseSelectItem {
  value: string;
  code: string;
  name: string;
}

export const franchiseService = {
  async getFranchisesForPosSelect(): Promise<OrderFranchiseOption[]> {
    const response = await httpClient.get<FranchiseSelectItem[]>({
      url: "/franchises/select",
    });

    return (response ?? []).map((item) => ({
      id: item.value,
      code: item.code,
      name: item.name,
      role: "ADMIN",
    }));
  },
};
