import { useState } from "react";
import { inventoryApi } from "@/apis/endpoints/inventory.api";
import type { InventoryAdjustPayload } from "../inventory.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useAdjustInventory = () => {
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const getErrorMessage = (err: unknown): string => {
    if (typeof err === "object" && err !== null) {
      const maybeErr = err as {
        message?: string;
        response?: {
          data?: {
            message?: string;
            errors?: Array<{ message?: string }>;
          };
        };
      };

      const serverMessage =
        maybeErr.response?.data?.message ||
        maybeErr.response?.data?.errors?.[0]?.message;

      if (serverMessage) return serverMessage;
      if (maybeErr.message) return maybeErr.message;
    }

    return "Unable to adjust quantity right now. Please try again.";
  };

  const adjustInventory = async (
    payload: InventoryAdjustPayload,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsAdjusting(true);
    setError(null);

    try {
      await inventoryApi.adjustInventory(payload);
      success(
        "Adjusted",
        `Quantity has been ${payload.change > 0 ? "increased" : "decreased"} by ${Math.abs(payload.change)}.`,
      );
      if (onSuccess) onSuccess();
    } catch (err) {
      // Fallback: nhiều môi trường không mở endpoint /adjust nhưng vẫn hỗ trợ /adjust/bulk.
      if (typeof payload.alert_threshold === "number") {
        try {
          await inventoryApi.bulkAdjustInventory({
            items: [
              {
                product_franchise_id: payload.product_franchise_id,
                change: payload.change,
                alert_threshold: payload.alert_threshold,
                reason: payload.reason,
              },
            ],
          });

          success(
            "Adjusted",
            `Quantity has been ${payload.change > 0 ? "increased" : "decreased"} by ${Math.abs(payload.change)}.`,
          );
          if (onSuccess) onSuccess();
          return;
        } catch (fallbackErr) {
          const errorMessage = getErrorMessage(fallbackErr);
          setError(errorMessage);
          showErrorToast("Adjustment Failed", errorMessage);
          if (onError) onError(errorMessage);
          return;
        }
      }

      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      showErrorToast("Adjustment Failed", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsAdjusting(false);
    }
  };

  return { adjustInventory, isAdjusting, error };
};
