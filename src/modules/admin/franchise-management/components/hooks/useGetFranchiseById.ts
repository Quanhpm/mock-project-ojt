import { useState } from "react";
import { franchiseApi } from "../../../../../apis/endpoints/franchise.api";
import type { Franchise } from "../../../../../types/franchise.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetFranchiseByIdReturn {
  franchise: Franchise | null;
  isLoading: boolean;
  error: string | null;
  fetchFranchise: (id: number) => Promise<void>;
}

export const useGetFranchiseById = (): UseGetFranchiseByIdReturn => {
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToast();

  const fetchFranchise = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await franchiseApi.getFranchiseById(id);
      if (response) {
        setFranchise(response);
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
