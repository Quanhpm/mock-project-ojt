import { useState, useEffect } from "react";
import { voucherApi } from "@/apis/endpoints/voucher.api";
import type { Voucher, VoucherSearchPayload } from "../voucher.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetVouchersReturn {
  vouchers: Voucher[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  totalItems: number;
  refetch: (payload: VoucherSearchPayload) => Promise<void>;
}

export const useGetVouchers = (skipInitialFetch = false): UseGetVouchersReturn => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const { error: showError } = useToast();

  const refetch = async (payload: VoucherSearchPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await voucherApi.searchVouchers(payload);
      if (response.success && response.data) {
        setVouchers(response.data);
        setTotalPages(response.pageInfo?.totalPages || 0);
        setTotalItems(response.pageInfo?.totalItems || 0);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi tải danh sách voucher";
      setError(errorMessage);
      showError("Lỗi", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!skipInitialFetch) {
      refetch({
        searchCondition: { is_deleted: false },
        pageInfo: { pageNum: 1, pageSize: 10 },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { vouchers, isLoading, error, totalPages, totalItems, refetch };
};
