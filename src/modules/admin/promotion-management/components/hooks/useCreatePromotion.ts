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
      success("Created successfully", "Promotion has been created.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to create promotion at this time. Please try again!";
      setError(errorMessage);
      showErrorToast("Creation failed", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return { createPromotion, isCreating, error };
};
