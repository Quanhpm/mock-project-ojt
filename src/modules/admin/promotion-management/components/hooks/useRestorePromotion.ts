import { useState } from "react";
import { promotionApi } from "@/apis/endpoints/promotion.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useRestorePromotion = () => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const restorePromotion = async (
    id: string,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsRestoring(true);
    setError(null);

    try {
      await promotionApi.restorePromotion(id);
      success("Restored successfully", "Promotion has been restored.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to restore promotion at this time. Please try again!";
      setError(errorMessage);
      showErrorToast("Restoration failed", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsRestoring(false);
    }
  };

  return { restorePromotion, isRestoring, error };
};
