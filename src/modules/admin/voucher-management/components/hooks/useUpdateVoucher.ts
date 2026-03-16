import { useState } from "react";
import { voucherApi } from "@/apis/endpoints/voucher.api";
import type { VoucherUpdatePayload } from "../voucher.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useUpdateVoucher = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const updateVoucher = async (
    id: string,
    data: VoucherUpdatePayload,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsUpdating(true);
    setError(null);

    try {
      await voucherApi.updateVoucher(id, data);
      success("Cập nhật thành công", "Voucher đã được cập nhật.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể cập nhật voucher lúc này. Vui lòng thử lại!";
      setError(errorMessage);
      showErrorToast("Cập nhật thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateVoucher, isUpdating, error };
};
