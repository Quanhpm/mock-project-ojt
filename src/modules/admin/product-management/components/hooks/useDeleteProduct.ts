import { useState } from "react";
import { productApi } from "../../../../../apis/endpoints/product.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useDeleteProduct = () => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const deleteProduct = async (
    id: string,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsDeleting(true);
    setError(null);

    try {
      await productApi.deleteProduct(id);
      success("Product deleted", "The product has been deleted.");
      onSuccess?.();
    } catch (err: any) {
      console.error("Failed to delete product:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Unable to delete the product right now. Please try again.";
      setError(errorMessage);

      showErrorToast("Delete failed", errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteProduct,
    isDeleting,
    error,
  };
};
