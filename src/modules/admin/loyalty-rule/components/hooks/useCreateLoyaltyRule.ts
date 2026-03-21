import { useState } from "react";
import { loyaltyRuleApi } from "@/apis/endpoints/loyalty-rule.api";
import type { LoyaltyRuleCreatePayload } from "../loyalty-rule.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useCreateLoyaltyRule = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const createLoyaltyRule = async (
    data: LoyaltyRuleCreatePayload,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsCreating(true);
    setError(null);

    try {
      await loyaltyRuleApi.createLoyaltyRule(data);
      success("Tao thanh cong", "Loyalty rule da duoc tao moi.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Khong the tao loyalty rule luc nay. Vui long thu lai!";
      setError(errorMessage);
      showErrorToast("Tao that bai", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return { createLoyaltyRule, isCreating, error };
};
