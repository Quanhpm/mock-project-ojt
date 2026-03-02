import { httpClient } from "@/apis";
import type { Franchise } from "@/types";

// ======================== API Endpoints ========================
export const getAllCategoriesInFranchise = async (franchiseId: number) => {
    return httpClient.get<Franchise, { franchiseId: number }>({
        url: `/franchises/${franchiseId}/categories`,
        params: { franchiseId },
    });
};

