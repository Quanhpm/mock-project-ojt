import { httpClient } from "@/apis";
import { axiosClient } from "@/apis/axios.config";
import type { SearchResponse } from "@/apis/http.types";
import type {
  Promotion,
  PromotionCreatePayload,
  PromotionUpdatePayload,
  PromotionSearchPayload,
  PromotionCreateResponse,
  PromotionMutationSuccessResponse,
  PromotionMutationErrorResponse,
  PromotionRestoreResponse,
} from "@/modules/admin/promotion-management/components/promotion.types";

export type PromotionSearchResponse = SearchResponse<Promotion>;

type PromotionCreateApiResponse = PromotionCreateResponse | PromotionMutationErrorResponse;
type PromotionMutateApiResponse = PromotionMutationSuccessResponse | PromotionMutationErrorResponse;
type PromotionRestoreApiResponse = PromotionRestoreResponse | PromotionMutationErrorResponse;

export const promotionApi = {
  /**
   * Search Promotion by conditions with pagination
   * POST /api/Promotion/search
   */
  searchPromotion: (data: PromotionSearchPayload): Promise<PromotionSearchResponse> => {
    return httpClient.search<Promotion, PromotionSearchPayload>({
      url: "/promotions/search",
      data,
    });
  },

  /**
   * Get promotion by ID
   * GET /api/promotion/:id
   */
  getPromotionById: (id: string): Promise<Promotion | null> => {
    return httpClient.get<Promotion>({ url: `/promotions/${id}` });
  },

  /**
   * Create new promotion
   * POST /api/promotion
   */
  createPromotion: async (data: PromotionCreatePayload): Promise<PromotionCreateResponse> => {
    const response = await axiosClient.post<PromotionCreateApiResponse>("/promotions", data);
    return response.data as PromotionCreateResponse;
  },

  /**
   * Update promotion
   * PUT /api/promotions/:id
   */
  updatePromotion: async (id: string, data: PromotionUpdatePayload): Promise<PromotionMutationSuccessResponse> => {
    const response = await axiosClient.put<PromotionMutateApiResponse>(`/promotions/${id}`, data);
    return response.data as PromotionMutationSuccessResponse;
  },

  /**
   * Soft-delete promotion
   * DELETE /api/promotions/:id
   */
  deletePromotion: async (id: string): Promise<PromotionMutationSuccessResponse> => {
    const response = await axiosClient.delete<PromotionMutateApiResponse>(`/promotions/${id}`);
    return response.data as PromotionMutationSuccessResponse;
  },

  /**
   * Restore soft-deleted promotion
   * PATCH /api/promotions/:id/restore
   */
  restorePromotion: async (id: string): Promise<PromotionRestoreResponse> => {
    const response = await axiosClient.patch<PromotionRestoreApiResponse>(`/promotions/${id}/restore`);
    return response.data as PromotionRestoreResponse;
  },
};
