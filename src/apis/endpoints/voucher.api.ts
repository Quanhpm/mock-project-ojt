import { httpClient } from "@/apis";
import { axiosClient } from "@/apis/axios.config";
import type { SearchResponse } from "@/apis/http.types";
import type {
  Voucher,
  VoucherCreatePayload,
  VoucherUpdatePayload,
  VoucherSearchPayload,
  VoucherCreateResponse,
  VoucherMutationSuccessResponse,
  VoucherMutationErrorResponse,
  VoucherRestoreResponse,
} from "@/modules/admin/voucher-management/components/voucher.types";

export type VoucherSearchResponse = SearchResponse<Voucher>;

type VoucherCreateApiResponse = VoucherCreateResponse | VoucherMutationErrorResponse;
type VoucherMutateApiResponse = VoucherMutationSuccessResponse | VoucherMutationErrorResponse;
type VoucherRestoreApiResponse = VoucherRestoreResponse | VoucherMutationErrorResponse;

export const voucherApi = {
  /**
   * Search vouchers by conditions with pagination
   * POST /api/vouchers/search
   */
  searchVouchers: (data: VoucherSearchPayload): Promise<VoucherSearchResponse> => {
    return httpClient.search<Voucher, VoucherSearchPayload>({
      url: "/vouchers/search",
      data,
    });
  },

  /**
   * Get voucher by ID
   * GET /api/vouchers/:id
   */
  getVoucherById: (id: string): Promise<Voucher | null> => {
    return httpClient.get<Voucher>({ url: `/vouchers/${id}` });
  },

  /**
   * Create new voucher
   * POST /api/vouchers
   */
  createVoucher: async (data: VoucherCreatePayload): Promise<VoucherCreateResponse> => {
    const response = await axiosClient.post<VoucherCreateApiResponse>("/vouchers", data);
    return response.data as VoucherCreateResponse;
  },

  /**
   * Update voucher
   * PUT /api/vouchers/:id
   */
  updateVoucher: async (id: string, data: VoucherUpdatePayload): Promise<VoucherMutationSuccessResponse> => {
    const response = await axiosClient.put<VoucherMutateApiResponse>(`/vouchers/${id}`, data);
    return response.data as VoucherMutationSuccessResponse;
  },

  /**
   * Soft-delete voucher
   * DELETE /api/vouchers/:id
   */
  deleteVoucher: async (id: string): Promise<VoucherMutationSuccessResponse> => {
    const response = await axiosClient.delete<VoucherMutateApiResponse>(`/vouchers/${id}`);
    return response.data as VoucherMutationSuccessResponse;
  },

  /**
   * Restore soft-deleted voucher
   * PATCH /api/vouchers/:id/restore
   */
  restoreVoucher: async (id: string): Promise<VoucherRestoreResponse> => {
    const response = await axiosClient.patch<VoucherRestoreApiResponse>(`/vouchers/${id}/restore`);
    return response.data as VoucherRestoreResponse;
  },
};
