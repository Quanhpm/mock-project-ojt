import { useState } from "react";
import { productApi } from "../../../../../apis/endpoints/product.api";
import type { Product } from "../../../../../types/product.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetProductByIdReturn {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  fetchProduct: (id: string) => Promise<void>;
}

export const useGetProductById = (): UseGetProductByIdReturn => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToast();

  const fetchProduct = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productApi.getProductById(id);
      if (response) {
        setProduct(response);
      } else {
        setError("Product not found");
        showError?.("Failed to load product details");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch product";
      setError(errorMessage);
      showError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    product,
    isLoading,
    error,
    fetchProduct,
  };
};
