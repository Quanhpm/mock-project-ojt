import { useState } from "react";
import { updateCategoryFranchiseDisplayOrder } from "../../api/category-franchise.api";
import { useToast } from "@/hooks/use-toast.hook";
import type { CategoryFranchiseUpdateDisplayOrderPayload } from "../../api/category-franchise.types";

export const useUpdateCategory = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { success, error: showError } = useToast();

  const updateDisplayOrder = async (
    id: string,
    payload: CategoryFranchiseUpdateDisplayOrderPayload
  ) => {
    setIsUpdating(true);
    try {
      const result = await updateCategoryFranchiseDisplayOrder(id, payload);
      success("Cập nhật thứ tự hiển thị thành công");
      return result;
    } catch (error) {
      showError("Cập nhật thứ tự hiển thị thất bại");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateDisplayOrder, isUpdating };
};
