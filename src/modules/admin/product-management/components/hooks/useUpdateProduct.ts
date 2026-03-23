import { useState } from "react";
import { productApi } from "../../../../../apis/endpoints/product.api";
import type {
  Product,
  ProductUpdatePayload,
} from "../../../../../types/product.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useUpdateProduct = () => {
  const { success, error: showErrorToast } = useToast();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateProductAction = async (
    id: string,
    payload: ProductUpdatePayload,
    onSuccess?: (updatedProduct: Product) => void,
  ) => {
    setIsUpdating(true);
    setError(null);

    try {
      const updatedProduct = await productApi.updateProduct(
        id,
        payload as Parameters<typeof productApi.updateProduct>[1],
      );

      success("Product updated", "The product details have been saved.");

      if (onSuccess && updatedProduct) {
        onSuccess(updatedProduct as Product);
      }

      return updatedProduct;
    } catch (err: any) {
      console.error("Failed to update product:", err);
      console.error("Update response payload:", err?.response?.data);

      const errorMessage =
        err.response?.data?.message ||
        (typeof err.response?.data?.data === "string"
          ? err.response?.data?.data
          : err.response?.data?.data?.message) ||
        err.response?.data?.data ||
        "Unable to update the product right now. Please try again.";
      setError(errorMessage);
      showErrorToast("Update failed", errorMessage);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateProduct: updateProductAction,
    isUpdating,
    error,
    setError,
  };
};
