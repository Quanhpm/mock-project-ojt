import { useState } from "react";
import { franchiseApi } from "../../../../../apis/endpoints/franchise.api";
import type { Franchise } from "../../../../../types/franchise.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetFranchiseByIdReturn {
  franchise: Franchise | null;
  isLoading: boolean;
  error: string | null;
  fetchFranchise: (id: string | number) => Promise<void>;
}

export const useGetFranchiseById = (): UseGetFranchiseByIdReturn => {
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToast();

  const fetchFranchise = async (id: number | string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await franchiseApi.getFranchiseById(String(id));
      if (response) {
        // Set franchise data - use type assertion since API returns FranchiseItem with string id
        setFranchise({
          ...response,
          logo_url: response.logo_url || '',
          address: response.address || '',
          is_active: response.is_active ?? false,
          is_deleted: response.is_deleted ?? false,
          created_at: response.created_at || '',
          updated_at: response.updated_at || '',
        } as unknown as Franchise);
      } else {
        setError("Franchise not found");
        showError?.("Failed to load franchise details");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch franchise";
      setError(errorMessage);
      showError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    franchise,
    isLoading,
    error,
    fetchFranchise,
  };
};
