import { useState } from "react";
import { voucherApi } from "@/apis/endpoints/voucher.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useDeleteVoucher = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const deleteVoucher = async (
    id: string,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsDeleting(true);
    setError(null);

    try {
      await voucherApi.deleteVoucher(id);
      success("Xóa thành công", "Voucher đã được xóa.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể xóa voucher lúc này. Vui lòng thử lại!";
      setError(errorMessage);
      showErrorToast("Xóa thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteVoucher, isDeleting, error };
};
