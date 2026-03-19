import { useCallback, useEffect, useRef, useState } from "react";
import { loyaltyRuleApi } from "@/apis/endpoints/loyalty-rule.api";
import type { LoyaltyRule } from "../loyalty-rule.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetLoyaltyRuleByIdReturn {
  loyaltyRule: LoyaltyRule | null;
  isLoading: boolean;
  error: string | null;
  fetchById: (id: string) => Promise<void>;
}

export const useGetLoyaltyRuleById = (): UseGetLoyaltyRuleByIdReturn => {
  const [loyaltyRule, setLoyaltyRule] = useState<LoyaltyRule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToast();
  const showErrorRef = useRef(showError);

  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  const fetchById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loyaltyRuleApi.getLoyaltyRuleById(id);
      setLoyaltyRule(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Loi tai thong tin loyalty rule";
      setError(errorMessage);
      showErrorRef.current("Loi", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { loyaltyRule, isLoading, error, fetchById };
};
