import { useState } from "react";
import { voucherApi } from "@/apis/endpoints/voucher.api";
import type { VoucherCreatePayload } from "../voucher.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useCreateVoucher = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const createVoucher = async (
    data: VoucherCreatePayload,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsCreating(true);
    setError(null);

    try {
      await voucherApi.createVoucher(data);
      success("Tạo thành công", "Voucher đã được tạo mới.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể tạo voucher lúc này. Vui lòng thử lại!";
      setError(errorMessage);
      showErrorToast("Tạo thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return { createVoucher, isCreating, error };
};
