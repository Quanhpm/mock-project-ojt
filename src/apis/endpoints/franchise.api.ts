import { httpClient } from "@/apis";
import type {
  Franchise,
  FranchiseSearchPayload,
  FranchiseSearchResponse,
} from "../../types/franchise.types";

// ============================================================================
// FRANCHISE MANAGEMENT APIS (Dành cho Admin)
// ============================================================================

export const franchiseApi = {
  /**
   * Search franchises by conditions with pagination
   * POST /api/franchises/search
   */
  searchFranchises: (
    payload: FranchiseSearchPayload,
  ): Promise<FranchiseSearchResponse> => {
    return httpClient.search<Franchise, FranchiseSearchPayload>({
      url: "/franchises/search",
      data: payload,
    }) as Promise<FranchiseSearchResponse>;
  },

  /**
   * Get franchise by ID
   */
  getFranchiseById: async (id: number): Promise<Franchise> => {
    const data = await httpClient.get<Franchise>({
      url: `/franchises/${id}`,
    });
    return data!;
  },

  /**
   * Create new franchise
   */
  createFranchise: async (
    payload: Omit<Franchise, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Franchise> => {
    const data = await httpClient.post<Franchise>({
      url: "/franchises",
      data: payload,
    });
    return data!;
  },

  /**
   * Update franchise
   */
  updateFranchise: async (
    id: number,
    payload: Partial<Omit<Franchise, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<Franchise> => {
    const data = await httpClient.put<Franchise>({
      url: `/franchises/${id}`,
      data: payload,
    });
    return data!;
  },

  /**
   * Delete franchise (soft delete)
   */
  deleteFranchise: async (id: number): Promise<void> => {
    await httpClient.delete({
      url: `/franchises/${id}`,
    });
  },

  /**
   * Toggle franchise status
   */
  toggleFranchiseStatus: async (
    id: number,
    payload: { is_active: boolean },
  ): Promise<Franchise> => {
    const data = await httpClient.patch<Franchise>({
      url: `/franchises/${id}/status`,
      data: payload,
    });
    return data!;
  },

  /**
   * Restore deleted franchise
   */
  restoreFranchise: async (id: number): Promise<Franchise> => {
    const data = await httpClient.patch<Franchise>({
      url: `/franchises/${id}/restore`,
      data: {},
    });
    return data!;
  },
};
