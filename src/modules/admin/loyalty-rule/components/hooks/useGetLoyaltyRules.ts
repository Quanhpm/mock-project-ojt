import { useCallback, useState } from "react";
import { loyaltyRuleApi } from "@/apis/endpoints/loyalty-rule.api";
import type { LoyaltyRule, LoyaltyRuleSearchPayload } from "../loyalty-rule.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetLoyaltyRulesReturn {
  loyaltyRules: LoyaltyRule[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  totalItems: number;
  refetch: (payload: LoyaltyRuleSearchPayload) => Promise<void>;
}

export const useGetLoyaltyRules = (): UseGetLoyaltyRulesReturn => {
  const [loyaltyRules, setLoyaltyRules] = useState<LoyaltyRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const { error: showError } = useToast();

  const refetch = useCallback(async (payload: LoyaltyRuleSearchPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loyaltyRuleApi.searchLoyaltyRules(payload);
      if (response.success && response.data) {
        setLoyaltyRules(response.data);
        setTotalPages(response.pageInfo?.totalPages || 0);
        setTotalItems(response.pageInfo?.totalItems || 0);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Loi tai danh sach loyalty rule";
      setError(errorMessage);
      showError("Loi", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  return { loyaltyRules, isLoading, error, totalPages, totalItems, refetch };
};
