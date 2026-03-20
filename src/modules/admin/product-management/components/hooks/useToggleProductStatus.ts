import { useState } from "react";
import { productApi } from "../../../../../apis/endpoints/product.api";
import { useToast } from "@/hooks/use-toast.hook";

interface UseToggleProductStatusReturn {
  toggleStatus: (id: string, currentStatus: boolean, onSuccess?: () => void, onError?: () => void) => Promise<void>;
  isToggling: boolean;
  error: string | null;
}

export const useToggleProductStatus = (): UseToggleProductStatusReturn => {
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const toggleStatusAction = async (
    id: string,
    currentStatus: boolean,
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    setIsToggling(true);
    setError(null);

    // Flip status before sending to server.
    const newStatus = !currentStatus;

    console.log(
      `🔄 Toggling status for product ${id}: ${currentStatus} → ${newStatus}`
    );

    try {
      const response = await productApi.toggleProductStatus(id, {
        is_active: newStatus,
      });

      console.log("✅ Toggle status success:", response);

      // Success toast.
      success(
        "Status updated",
        `Product has been ${newStatus ? "activated" : "deactivated"}.`
      );

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("❌ Failed to update product status:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Unable to change status right now.";

      setError(errorMessage);
      showErrorToast("Status update failed", errorMessage);

      // On API failure, call rollback handler.
      if (onError) onError();
    } finally {
      setIsToggling(false);
    }
  };

  return { toggleStatus: toggleStatusAction, isToggling, error };
};
