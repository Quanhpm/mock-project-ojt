import { useState } from "react";
import { createMasterCategory } from "../../api/master-category.api";
import { useToast } from "@/hooks/use-toast.hook";
import type { MasterCategoryCreatePayload } from "../../api/master-category.api";

export const useCreateMasterCategory = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { success, error: showError } = useToast();

  const createCategory = async (payload: MasterCategoryCreatePayload) => {
    setIsCreating(true);
    try {
      const result = await createMasterCategory(payload);
      success("Tạo danh mục chính thành công");
      return result;
    } catch (error) {
      showError("Tạo danh mục thất bại");
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return { createCategory, isCreating };
};
