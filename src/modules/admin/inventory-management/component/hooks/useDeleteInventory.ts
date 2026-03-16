import { useState } from "react";
import { inventoryApi } from "@/apis/endpoints/inventory.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useDeleteInventory = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const deleteInventory = async (
    id: string,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsDeleting(true);
    setError(null);

    try {
      await inventoryApi.deleteInventory(id);
      success("Xóa thành công", "Inventory item đã được xóa.");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể xóa inventory lúc này. Vui lòng thử lại!";
      setError(errorMessage);
      showErrorToast("Xóa thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteInventory, isDeleting, error };
};
