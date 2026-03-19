import { useState } from "react";
import { loyaltyRuleApi } from "@/apis/endpoints/loyalty-rule.api";
import type { LoyaltyRuleUpdatePayload } from "../loyalty-rule.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useUpdateLoyaltyRule = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const updateLoyaltyRule = async (
    id: string,
    data: LoyaltyRuleUpdatePayload,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsUpdating(true);
    setError(null);

    try {
      await loyaltyRuleApi.updateLoyaltyRule(id, data);
      success("Cap nhat thanh cong", "Loyalty rule da duoc cap nhat.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Khong the cap nhat loyalty rule luc nay. Vui long thu lai!";
      setError(errorMessage);
      showErrorToast("Cap nhat that bai", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateLoyaltyRule, isUpdating, error };
};
