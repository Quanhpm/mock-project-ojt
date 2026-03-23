import { useState } from "react";
import { inventoryApi } from "@/apis/endpoints/inventory.api";
import type { BulkAdjustPayload } from "@/apis/endpoints/inventory.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useBulkAdjustInventory = () => {
    const [isAdjusting, setIsAdjusting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { success, error: showErrorToast } = useToast();

    const bulkAdjust = async (
        payload: BulkAdjustPayload,
        onSuccess?: () => void,
        onError?: (errorMessage: string) => void,
    ) => {
        setIsAdjusting(true);
        setError(null);

        try {
            await inventoryApi.bulkAdjustInventory(payload);
            success(
                "Updated",
                `Updated ${payload.items.length} inventory items.`,
            );
            if (onSuccess) onSuccess();
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                "Unable to update right now. Please try again.";
            setError(errorMessage);
            showErrorToast("Update Failed", errorMessage);
            if (onError) onError(errorMessage);
        } finally {
            setIsAdjusting(false);
        }
    };

    return { bulkAdjust, isAdjusting, error };
};
