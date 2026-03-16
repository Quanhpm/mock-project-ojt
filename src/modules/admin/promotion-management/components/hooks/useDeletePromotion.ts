import { useState } from "react";
import { promotionApi } from "@/apis/endpoints/promotion.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useDeletePromotion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const deletePromotion = async (
    id: string,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsDeleting(true);
    setError(null);

    try {
      await promotionApi.deletePromotion(id);
      success("Xóa thành công", "Promotion đã được xóa.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể xóa promotion lúc này. Vui lòng thử lại!";
      setError(errorMessage);
      showErrorToast("Xóa thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return { deletePromotion, isDeleting, error };
};
