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
      success("Deleted successfully", "Voucher has been deleted.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to delete voucher at this time. Please try again!";
      setError(errorMessage);
      showErrorToast("Deletion failed", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteVoucher, isDeleting, error };
};
