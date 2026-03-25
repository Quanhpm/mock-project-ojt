import { httpClient } from "@/apis/httpClient";
import type {
  PaymentHistoryItem,
  PaymentHistoryStatus,
} from "../models/payment-history.models";

interface GetPaymentsByFranchiseParams {
  [key: string]: unknown;
  status?: PaymentHistoryStatus | "";
}

export const paymentHistoryService = {
  async getPaymentsByFranchise(
    franchiseId: string,
    status?: PaymentHistoryStatus | "",
  ): Promise<PaymentHistoryItem[]> {
    const response = await httpClient.get<
      PaymentHistoryItem[],
      GetPaymentsByFranchiseParams
    >({
      url: `/payments/franchise/${franchiseId}`,
      params: status ? { status } : undefined,
    });

    return response ?? [];
  },
};
