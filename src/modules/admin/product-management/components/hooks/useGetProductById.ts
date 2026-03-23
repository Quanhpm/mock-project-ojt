import { useCallback, useRef, useState } from "react";
import { productApi } from "../../../../../apis/endpoints/product.api";
import type { Product } from "../../../../../types/product.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetProductByIdReturn {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  fetchProduct: (id: string) => Promise<void>;
  clearProduct: () => void;
}

export const useGetProductById = (): UseGetProductByIdReturn => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToast();
  const requestIdRef = useRef(0);

  const clearProduct = useCallback(() => {
    requestIdRef.current += 1;
    setProduct(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const fetchProduct = useCallback(
    async (id: string) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setProduct(null);
      setIsLoading(true);
      setError(null);

      try {
        const response = await productApi.getProductById(id);

        if (requestId !== requestIdRef.current) {
          return;
        }

        if (response) {
          setProduct(response as Product);
          return;
        }

        setProduct(null);
        setError("Product not found.");
        showError?.("Failed to load product details", "Product not found.");
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch the product.";
        setProduct(null);
        setError(errorMessage);
        showError?.("Failed to load product details", errorMessage);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [showError],
  );

  return {
    product,
    isLoading,
    error,
    fetchProduct,
    clearProduct,
  };
};
