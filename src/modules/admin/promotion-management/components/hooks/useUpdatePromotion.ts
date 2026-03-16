import { useState } from "react";
import { promotionApi } from "@/apis/endpoints/promotion.api";
import type { PromotionUpdatePayload } from "../promotion.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useUpdatePromotion = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const updatePromotion = async (
    id: string,
    data: PromotionUpdatePayload,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsUpdating(true);
    setError(null);

    try {
      await promotionApi.updatePromotion(id, data);
      success("Cập nhật thành công", "Promotion đã được cập nhật.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể cập nhật promotion lúc này. Vui lòng thử lại!";
      setError(errorMessage);
      showErrorToast("Cập nhật thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return { updatePromotion, isUpdating, error };
};
