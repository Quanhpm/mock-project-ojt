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
      success("Restored successfully", "Voucher has been restored.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to restore voucher at this time. Please try again!";
      setError(errorMessage);
      showErrorToast("Restoration failed", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsRestoring(false);
    }
  };

  return { restoreVoucher, isRestoring, error };
};
