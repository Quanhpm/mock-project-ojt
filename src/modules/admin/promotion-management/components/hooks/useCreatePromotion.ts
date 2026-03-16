import { useState } from "react";
import { promotionApi } from "@/apis/endpoints/promotion.api";
import type { PromotionCreatePayload } from "../promotion.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useCreatePromotion = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const createPromotion = async (
    data: PromotionCreatePayload,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsCreating(true);
    setError(null);

    try {
      await promotionApi.createPromotion(data);
      success("Tạo thành công", "Promotion đã được tạo mới.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể tạo promotion lúc này. Vui lòng thử lại!";
      setError(errorMessage);
      showErrorToast("Tạo thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return { createPromotion, isCreating, error };
};
