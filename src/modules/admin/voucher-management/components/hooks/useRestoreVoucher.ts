import { useState } from "react";
import { voucherApi } from "@/apis/endpoints/voucher.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useRestoreVoucher = () => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const restoreVoucher = async (
    id: string,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsRestoring(true);
    setError(null);

    try {
      await voucherApi.restoreVoucher(id);
      success("Khôi phục thành công", "Voucher đã được khôi phục.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể khôi phục voucher lúc này. Vui lòng thử lại!";
      setError(errorMessage);
      showErrorToast("Khôi phục thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsRestoring(false);
    }
  };

  return { restoreVoucher, isRestoring, error };
};
