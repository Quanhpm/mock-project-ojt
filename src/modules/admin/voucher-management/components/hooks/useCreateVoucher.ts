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
      success("Created successfully", "Voucher has been created.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to create voucher at this time. Please try again!";
      setError(errorMessage);
      showErrorToast("Creation failed", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return { createVoucher, isCreating, error };
};
