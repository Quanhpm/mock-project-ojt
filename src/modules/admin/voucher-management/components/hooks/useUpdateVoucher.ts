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
      success("Updated successfully", "Voucher has been updated.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to update voucher at this time. Please try again!";
      setError(errorMessage);
      showErrorToast("Update failed", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateVoucher, isUpdating, error };
};
