import { useState, useEffect, useCallback } from "react";
import {
  searchProductFranchises,
  type ProductFranchise,
} from "../api/product-franchise.api";

interface UseProductFranchiseAssignmentsReturn {
  assignments: ProductFranchise[];
  isLoading: boolean;
  refresh: () => void;
}

/**
 * Fetches all franchise assignments for a given product_id.
 * Uses searchProductFranchises with product_id filter and a large page size
 * to get all records at once.
 */
export const useProductFranchiseAssignments = (
  productId: string | undefined,
): UseProductFranchiseAssignmentsReturn => {
  const [assignments, setAssignments] = useState<ProductFranchise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    if (!productId) {
      setAssignments([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchProductFranchises({
        searchCondition: {
          product_id: productId,
          is_deleted: false,
        },
        pageInfo: { pageNum: 1, pageSize: 100 },
      });

      if (response.success && response.data) {
        setAssignments(response.data);
      } else {
        setAssignments([]);
      }
    } catch {
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return { assignments, isLoading, refresh: fetchAssignments };
};
