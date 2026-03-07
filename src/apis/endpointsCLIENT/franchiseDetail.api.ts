import { httpClient } from "../httpClient";

export interface FranchiseDetailResponse {
    _id: string;
    code: string;
    name: string;
    hotline: string;
    logo_url: string;
    address: string;
    google_map_script: string;
    opened_at: string;
    closed_at: string;
    is_active: boolean;
}

export const getFranchiseDetail = async (franchiseId: string): Promise<FranchiseDetailResponse | null> => {
    return httpClient.get<FranchiseDetailResponse>({
        url: `clients/franchises/${franchiseId}`,
    });
}
