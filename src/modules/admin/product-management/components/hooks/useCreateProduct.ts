import { useState } from "react";
import { productApi } from "../../../../../apis/endpoints/product.api";
import type {
  Product,
  ProductCreatePayload,
} from "../../../../../types/product.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useCreateProduct = () => {
  const { success, error: showErrorToast } = useToast();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createProductAction = async (
    payload: ProductCreatePayload,
    onSuccess?: (newProduct: Product) => void,
  ) => {
    setIsCreating(true);
    setError(null);

    try {
      const newProduct = await productApi.createProduct(payload);

      success("Product created", "The product has been created successfully.");

      if (onSuccess && newProduct) {
        onSuccess(newProduct as Product);
      }

      return newProduct;
    } catch (err: any) {
      console.error("Failed to create product:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.data ||
        "Unable to create the product right now. Please try again.";
      setError(errorMessage);

      showErrorToast("Create failed", errorMessage);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createProduct: createProductAction,
    isCreating,
    error,
    setError,
  };
};
