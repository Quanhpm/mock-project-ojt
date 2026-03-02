import { httpClient } from "@/apis";
import type { Franchise } from "@/types";

// ======================== API Endpoints ========================
export const getFranchiseIdByCode = async (code: string) => {
    return httpClient.get<{ franchiseId: number }, { code: string }>({
        url: `/franchises/code/${code}`,
        params: { code },
    });
}