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
                "Cập nhật thành công",
                `Đã cập nhật ${payload.items.length} inventory items.`,
            );
            if (onSuccess) onSuccess();
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                "Không thể cập nhật lúc này. Vui lòng thử lại!";
            setError(errorMessage);
            showErrorToast("Cập nhật thất bại", errorMessage);
            if (onError) onError(errorMessage);
        } finally {
            setIsAdjusting(false);
        }
    };

    return { bulkAdjust, isAdjusting, error };
};
