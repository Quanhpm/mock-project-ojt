import { useState, useEffect } from "react";
import { productApi } from "../../../../../apis/endpoints/product.api";
import type { Product, ProductSearchPayload } from "../../../../../types/product.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  totalItems: number;
  refetch: (payload: ProductSearchPayload) => Promise<void>;
}

export const useGetProducts = (): UseGetProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const { error: showError } = useToast();

  const refetch = async (payload: ProductSearchPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productApi.searchProducts(payload);
      if (response.success && response.data) {
        setProducts(response.data);
        setTotalPages(response.pageInfo?.totalPages || 0);
        setTotalItems(response.pageInfo?.totalItems || 0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi tải dữ liệu sản phẩm";
      setError(errorMessage);
      showError("Lỗi", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial products on mount
  useEffect(() => {
    refetch({
      searchCondition: {
        is_deleted: false,
      },
      pageInfo: {
        pageNum: 1,
        pageSize: 10,
      },
    });
  }, []);

  return { products, isLoading, error, totalPages, totalItems, refetch };
};
