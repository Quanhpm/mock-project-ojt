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
      success("Khôi phục thành công", "Promotion đã được khôi phục.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể khôi phục promotion lúc này. Vui lòng thử lại!";
      setError(errorMessage);
      showErrorToast("Khôi phục thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsRestoring(false);
    }
  };

  return { restorePromotion, isRestoring, error };
};
