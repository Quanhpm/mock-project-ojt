import { useState } from "react";
import { promotionApi } from "@/apis/endpoints/promotion.api";
import type { Promotion } from "../promotion.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetPromotionByIdReturn {
  promotion: Promotion | null;
  isLoading: boolean;
  error: string | null;
  fetchById: (id: string) => Promise<void>;
}

export const useGetPromotionById = (): UseGetPromotionByIdReturn => {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToast();

  const fetchById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await promotionApi.getPromotionById(id);
      setPromotion(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi tải thông tin promotion";
      setError(errorMessage);
      showError("Lỗi", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { promotion, isLoading, error, fetchById };
};
