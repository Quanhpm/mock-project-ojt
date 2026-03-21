import { httpClient } from "@/apis/httpClient";
import type { PosCategory, PosProduct } from "../models/menu.models";

export const menuService = {
  getCategoriesByFranchise(franchiseId: string) {
    return httpClient.get<PosCategory[]>({
      url: `/clients/franchises/${franchiseId}/categories`,
    });
  },

  getProductsByFranchise(franchiseId: string, categoryId?: string) {
    return httpClient.get<PosProduct[], { franchiseId: string; categoryId?: string }>({
      url: "/clients/products",
      params: { franchiseId, categoryId },
    });
  },
};
