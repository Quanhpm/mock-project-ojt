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
      success("Updated successfully", "Promotion has been updated.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to update promotion at this time. Please try again!";
      setError(errorMessage);
      showErrorToast("Update failed", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return { updatePromotion, isUpdating, error };
};
