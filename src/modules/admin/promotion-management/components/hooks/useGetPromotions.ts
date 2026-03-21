import { useState, useEffect } from "react";
import { promotionApi } from "@/apis/endpoints/promotion.api";
import type { Promotion, PromotionSearchPayload } from "../promotion.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetPromotionsReturn {
  promotions: Promotion[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  totalItems: number;
  refetch: (payload: PromotionSearchPayload) => Promise<void>;
}

export const useGetPromotions = (skipInitialFetch = false): UseGetPromotionsReturn => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const { error: showError } = useToast();

  const refetch = async (payload: PromotionSearchPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await promotionApi.searchPromotion(payload);
      if (response.success && response.data) {
        setPromotions(response.data);
        setTotalPages(response.pageInfo?.totalPages || 0);
        setTotalItems(response.pageInfo?.totalItems || 0);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi tải danh sách promotion";
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

  return { promotions, isLoading, error, totalPages, totalItems, refetch };
};
