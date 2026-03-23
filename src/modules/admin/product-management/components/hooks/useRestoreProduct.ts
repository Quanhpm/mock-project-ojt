import { useState } from "react";
import { productApi } from "../../../../../apis/endpoints/product.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useRestoreProduct = () => {
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const restoreProductAction = async (
    id: string,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsRestoring(true);
    setError(null);

    try {
      await productApi.restoreProduct(id);
      success("Product restored", "The product has been restored.");
      onSuccess?.();
    } catch (err: any) {
      console.error("Failed to restore product:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Unable to restore the product right now. Please try again.";
      setError(errorMessage);

      showErrorToast("Restore failed", errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsRestoring(false);
    }
  };

  return {
    restoreProduct: restoreProductAction,
    isRestoring,
    error,
  };
};
